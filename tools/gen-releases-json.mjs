#!/usr/bin/env node
// Generate releases.json (the OTA version list the routers read) from the
// GitHub releases of the releases repo. Requires the `gh` CLI, authenticated.
//
//   node tools/gen-releases-json.mjs [owner/repo] > releases.json
//
// For every release it reads the asset list and checksum manifests, emits router
// and appliance images under `assets`, and emits the two ESP8266 images under
// `node_assets`. Newest release first.
//
// The router matches an asset by board == cvfi_board_slug AND openwrt ==
// cvfi_openwrt_version, so the derivation here MUST match those slugs exactly.

import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repo = process.argv[2] || 'z1on3/CVFi-RE-openwrt-releases';
const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// Release channels, longest-suffix-first so a longer name can never be shadowed
// by a shorter one that happens to be its tail.
const CHANNELS = ['stable', 'beta'];

// Fallback caveat per channel, shown by a download page on a device card that has
// no caveat of its own. Editable as data in disclaimers.json so the wording can
// change without touching this script or the consumer; the built-in values below
// are only a safety net if that file is missing or unreadable.
const DISCLAIMERS = (() => {
  const builtin = {
    beta: "⚠ Beta — flash at your own risk. We're not responsible for any damage to your device.",
    stable: "⚠ Flash at your own risk. We're not responsible for any damage to your device.",
    default: "⚠ Flash at your own risk. We're not responsible for any damage to your device.",
  };
  try {
    const raw = JSON.parse(readFileSync(new URL('../disclaimers.json', import.meta.url), 'utf8'));
    const picked = {};
    for (const [k, v] of Object.entries(raw)) {
      if (!k.startsWith('_') && typeof v === 'string') { picked[k] = v; }
    }
    return { ...builtin, ...picked };
  } catch (e) {
    process.stderr.write(`warn: disclaimers.json unreadable (${e.message}); using built-in text\n`);
    return builtin;
  }
})();

// Router image filename: CVFi-RE-<board>-<openwrt>-beta-<rel>.bin
// board slugs contain dashes; the OpenWrt version is the N.N.N token before -beta-.
//
// Assets published before the product rename lead with JuanFi-RE- instead, and both
// forms must keep parsing: the picker offers older releases for reinstall/downgrade,
// and an asset that fails to parse here is simply absent from releases.json — which
// reads on-device as "no compatible image", not as an error anyone would notice.
const IMG_RE = /^(?:CVFi|JuanFi)-RE-(.+)-(\d+\.\d+\.\d+)-(?:beta|stable)-(.+)\.bin$/;

// PC/SBC appliance image filename: CVFi-RE-<board>-<openwrt>-beta-<rel>.img.gz
// (whole-disk images written to SD/eMMC/disk, e.g. Raspberry Pi, x86-64, Orange Pi).
// Same naming shape as the router .bin, different extension; the x86-64 EFI variant
// is ...-<rel>-efi.img.gz and still parses board == 'x86-64'. These are download-only:
// their board slugs are deliberately absent from the on-device cvfi_board_slug map, so
// the router OTA picker never matches (and never tries to sysupgrade a whole-disk image).
const APP_RE = /^(?:CVFi|JuanFi)-RE-(.+)-(\d+\.\d+\.\d+)-(?:beta|stable)-(.+)\.img\.gz$/;

// ESP8266 node images are versioned independently from the router release. Every
// release carries both the application firmware and its required LittleFS image.
const NODE_RE = /^(?:CVFi|JuanFi)-RE-ESP8266-node-(firmware|littlefs)-(v[^/]+)\.bin$/;

// Per-device presentation metadata (display name, product photo, optional warning
// note), keyed by the board slug parsed out of the image filename above. Emitted both
// as a top-level `devices` catalog AND inlined on each asset so the website can render
// a device card with `<img src=asset.image>` and show `asset.note`. Images are public
// hotlinks from CDNs that allow it and were verified to return image/* — NOT openwrt.org
// (its _media / fetch.php paths serve text/html, so they render broken as <img src>).
// Blank `image` = no hotlinkable public source found (self-hosting was declined for repo
// size); the site falls back to its own placeholder. `note` is a per-device caveat
// the site can badge (experimental / limited support); omit it when there's nothing to
// flag. The router OTA picker ignores all three fields (reads only board/openwrt/file/
// sha256), so this is presentation-only and safe to add.
const EAP225_NOTE = '⚠ Experimental — single-port AP-as-gateway image, not yet boot-tested on hardware. Flash only on a device you can recover, and verify one revision (internet + portal + a client session) first.';
const DEVICES = {
  'asus-rt-ax52':               { name: 'ASUS RT-AX52',               image: 'https://image.alza.cz/products/Asus23_022/Asus23_022-01.jpg' },
  'asus-rt-ac68u':              { name: 'ASUS RT-AC68U',              image: 'https://dlcdnwebimgs.asus.com/gain/6670e848-ba84-47e0-97d5-fd076ac3a137/w185', note: '⚠ Wi-Fi unsupported on this Broadcom board in OpenWrt — routes over Ethernet only and cannot serve its own hotspot. Use it wired or paired with an external AP node. First flash from stock ASUS uses the .trx (this image is that .trx under a .bin name).' },
  'comfast-cf-n5-v2':           { name: 'Comfast CF-N5 v2',           image: 'https://comfastgroup.com/wp-content/uploads/2024/09/cf-n5-v2.webp' },
  'comfast-cf-ew71-v2':         { name: 'Comfast CF-EW71 v2',         image: '' },
  'comfast-cf-ew72-v2':         { name: 'Comfast CF-EW72 v2',         image: 'https://comfastgroup.com/wp-content/uploads/2024/09/cf-ew72-v2.webp' },
  'edup-ep-rt2983':             { name: 'EDUP EP-RT2983',             image: '' },
  'linksys-ea8300':             { name: 'Linksys EA8300',             image: '' },
  'linksys-wrt1900acs':         { name: 'Linksys WRT1900ACS',         image: '' },
  'mercusys-mr70x-v1':          { name: 'Mercusys MR70X v1',          image: 'https://static.mercusys.com/product-image/01_large20201223072930.jpg' },
  'newifi-d2':                  { name: 'Newifi D2',                  image: '' },
  'ruijie-rg-ew1200g-pro-v1.1': { name: 'Ruijie RG-EW1200G PRO v1.1', image: 'https://eo-sgp-cos.ruijie.com/background/other/2023-10-27/7b9d778c2293490a993760bc68f52396.png' },
  'ruijie-rg-ew3200gx-pro':     { name: 'Ruijie RG-EW3200GX PRO',     image: 'https://eo-sgp-cos.ruijie.com/background/other/2023-10-30/b2b529094b4d432fa998eba11a445b19.png' },
  'zbt-wg3526-16m':             { name: 'ZBT WG3526 (16M)',           image: '' },
  // AIRPHO AR-W410 — a ZBT WG3526 16M clone; its release .bin is a byte-for-byte copy
  // of the zbt-wg3526-16m image (see build-all.sh). Listed as its own device for the
  // download site; on-device OTA still matches the zbt-wg3526-16m asset (same board name).
  'airpho-ar-w410':             { name: 'AIRPHO AR-W410',             image: '', note: 'ZBT WG3526 (16M) clone — identical image to the ZBT WG3526; in-product updates track the ZBT WG3526 asset.' },
  // TP-Link EAP225 single-port family — TP-Link's CDN blocks hotlinking (HTTP 403),
  // so no working public img src; host a photo in release/img/ to fill these.
  // (No eap225-v2: v2 hardware has no separate OpenWrt profile and flashes the v1 image.)
  'eap225-v1':                  { name: 'TP-Link EAP225 v1',          image: '', note: EAP225_NOTE },
  'eap225-v3':                  { name: 'TP-Link EAP225 v3',          image: '', note: EAP225_NOTE },
  'eap225-v4':                  { name: 'TP-Link EAP225 v4',          image: '', note: EAP225_NOTE },
  'eap225-outdoor-v1':          { name: 'TP-Link EAP225-Outdoor v1',  image: '', note: EAP225_NOTE },
  'eap225-outdoor-v3':          { name: 'TP-Link EAP225-Outdoor v3',  image: '', note: EAP225_NOTE },
  'eap225-wall-v2':             { name: 'TP-Link EAP225-Wall v2',     image: '', note: EAP225_NOTE },
  // PC / SBC appliance images (whole-disk .img.gz for SD/eMMC/disk — NOT an OTA
  // sysupgrade target). Listed for the download site only; these slugs are absent
  // from cvfi_board_slug so no running router is ever offered one.
  'orange-pi-one':              { name: 'Orange Pi One',              image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Top_view_of_an_Orange_Pi_One_single-board_computer.jpg' },
  'orange-pi-pc':               { name: 'Orange Pi PC',               image: '' },
  'orange-pi-zero-3':           { name: 'Orange Pi Zero 3',           image: '' },
  'raspberry-pi-3':             { name: 'Raspberry Pi 3',             image: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Raspberry_Pi_3_B%2B.jpg' },
  'raspberry-pi-4':             { name: 'Raspberry Pi 4',             image: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Raspberry_Pi_4_Model_B_-_Top.jpg' },
  'raspberry-pi-5':             { name: 'Raspberry Pi 5',             image: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Raspberry_Pi_5.jpg' },
  // x86-64 ships two variants (EFI/UEFI and legacy BIOS), both parsing to board
  // 'x86-64'; the appliance loop below appends "(EFI)"/"(BIOS)" to this name so the
  // two download cards are distinguishable.
  'x86-64':                     { name: 'PC / x86-64',                image: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Intel_NUC_Mini_PC.jpg' },
};

function parseSums(text) {
  // Lines: "<sha256> *<filename>" (or two spaces). Basename may include a dir.
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([0-9a-fA-F]{64})\s+\*?(.+)$/);
    if (m) { map[m[2].replace(/^.*\//, '')] = m[1].toLowerCase(); }
  }
  return map;
}

const releases = JSON.parse(gh(['release', 'list', '--repo', repo, '--json', 'tagName,name,publishedAt,isPrerelease,isDraft']));
// gh release list returns newest-first already; keep that order.
const out = { latest: '', releases: [] };

for (const rel of releases) {
  const tag = rel.tagName;
  if (tag === 'patches') { continue; } // the patch-asset release is not an OTA version
  // Draft releases are still staged: their assets are not publicly downloadable,
  // so they must never appear in the OTA list (routers could not fetch them).
  if (rel.isDraft) { continue; }
  const view = JSON.parse(gh(['release', 'view', tag, '--repo', repo, '--json', 'assets']));
  const names = (view.assets || []).map((a) => a.name);
  if (!names.includes('SHA256SUMS.txt')) { continue; }

  // Download + parse SHA256SUMS.txt for this release (node tmp + fs; no shell utils).
  let sums = {};
  const tmp = join(tmpdir(), `cvfi-sums-${tag.replace(/[^\w.-]/g, '_')}.txt`);
  try {
    gh(['release', 'download', tag, '--repo', repo, '--pattern', 'SHA256SUMS.txt', '--output', tmp, '--clobber']);
    sums = parseSums(readFileSync(tmp, 'utf8'));
    rmSync(tmp, { force: true });
  } catch (e) {
    process.stderr.write(`warn: ${tag}: could not read SHA256SUMS.txt (${e.message})\n`);
  }

  // Appliance images carry their checksums in a SEPARATE manifest so the router
  // SHA256SUMS.txt stays purely sysupgrade .bin. Best-effort: most releases lack it.
  let appSums = {};
  if (names.includes('SHA256SUMS-appliance.txt')) {
    const atmp = join(tmpdir(), `cvfi-appsums-${tag.replace(/[^\w.-]/g, '_')}.txt`);
    try {
      gh(['release', 'download', tag, '--repo', repo, '--pattern', 'SHA256SUMS-appliance.txt', '--output', atmp, '--clobber']);
      appSums = parseSums(readFileSync(atmp, 'utf8'));
      rmSync(atmp, { force: true });
    } catch (e) {
      process.stderr.write(`warn: ${tag}: could not read SHA256SUMS-appliance.txt (${e.message})\n`);
    }
  }

  let nodeSums = {};
  if (names.includes('SHA256SUMS-node.txt')) {
    const ntmp = join(tmpdir(), `cvfi-nodesums-${tag.replace(/[^\w.-]/g, '_')}.txt`);
    try {
      gh(['release', 'download', tag, '--repo', repo, '--pattern', 'SHA256SUMS-node.txt', '--output', ntmp, '--clobber']);
      nodeSums = parseSums(readFileSync(ntmp, 'utf8'));
      rmSync(ntmp, { force: true });
    } catch (e) {
      process.stderr.write(`warn: ${tag}: could not read SHA256SUMS-node.txt (${e.message})\n`);
    }
  }

  const assets = [];
  for (const name of names) {
    const m = name.match(IMG_RE);
    if (!m) { continue; }               // not a router image
    const [, board, openwrt] = m;
    const sha256 = sums[name];
    if (!sha256) { continue; }           // no checksum -> unsafe to offer
    const meta = DEVICES[board] || { name: board, image: '', note: '' };
    assets.push({ board, name: meta.name, openwrt, file: name, sha256, image: meta.image || '', note: meta.note || '' });
  }
  // Appliance whole-disk images (.img.gz), same asset shape so the site renders them
  // uniformly. Checksums come from SHA256SUMS-appliance.txt (fall back to the main
  // manifest if an older release folded them together). The on-device OTA picker
  // ignores these (their board slugs aren't in cvfi_board_slug), so they can never be
  // offered to a router as an update.
  for (const name of names) {
    const m = name.match(APP_RE);
    if (!m) { continue; }
    const [, board, openwrt] = m;
    const sha256 = appSums[name] || sums[name];
    if (!sha256) { continue; }
    const meta = DEVICES[board] || { name: board, image: '', note: '' };
    // x86-64 has two whole-disk variants (EFI/UEFI and legacy BIOS) that both parse
    // to board 'x86-64', so they'd otherwise render two identical "PC / x86-64" cards.
    // The EFI image is ...-<rel>-efi.img.gz; everything else is the BIOS image.
    let displayName = meta.name;
    if (board === 'x86-64') {
      displayName = /-efi\.img\.gz$/.test(name) ? `${meta.name} (EFI)` : `${meta.name} (BIOS)`;
    }
    assets.push({ board, name: displayName, openwrt, file: name, sha256, image: meta.image || '', note: meta.note || '' });
  }
  const nodeAssets = [];
  for (const name of names) {
    const m = name.match(NODE_RE);
    if (!m) { continue; }
    const [, type, nodeVersion] = m;
    const sha256 = nodeSums[name];
    if (!sha256) { continue; }
    nodeAssets.push({
      type,
      name: type === 'firmware' ? 'ESP8266 Node Firmware' : 'ESP8266 Node LittleFS',
      version: nodeVersion,
      file: name,
      sha256,
    });
  }
  if (!assets.length) { continue; }

  // Derive a display "version" from the tag (v0.3-beta -> 0.3-beta).
  const version = tag.replace(/^v/, '');
  // Channel comes from the tag suffix, and carries the fallback caveat a download
  // page shows for a device with no caveat of its own. Emitting it per release
  // rather than per manifest is deliberate: an older beta listed for a downgrade
  // still says beta, while the current stable does not.
  const channel = CHANNELS.find((c) => version.endsWith(`-${c}`)) || '';
  out.releases.push({
    version,
    tag,
    channel,
    disclaimer: DISCLAIMERS[channel] ?? DISCLAIMERS.default ?? '',
    date: (rel.publishedAt || '').slice(0, 10),
    notes: rel.name || '',
    assets,
    node_assets: nodeAssets,
  });
}

if (out.releases.length) { out.latest = out.releases[0].version; }
// top-level catalog: board slug -> { name, image, note } (normalized so every entry
// has all three keys, even when the DEVICES map omitted an empty image/note).
out.devices = Object.fromEntries(
  Object.entries(DEVICES).map(([k, v]) => [k, { name: v.name, image: v.image || '', note: v.note || '' }]),
);
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
