# Changelog

All notable changes to the JuanFi‑RE flashable releases are documented here.

## beta 0.4.65 — 2026-09-19

**PPPoE.** Improved server configuration, VLAN setup, status reporting, and
mobile usability for more reliable subscriber deployments.

**Maintenance.** General bug fixes and stability improvements.

## beta 0.4.64 — 2026-09-17

**Reliability and performance.** Improved memory efficiency and overall system
stability on constrained devices.

**Maintenance.** General bug fixes and usability improvements.

## beta 0.4.63 — 2026-09-16

**PPPoE.** A round of improvements to the built-in PPPoE server: its settings now
live in a dedicated dialog for a cleaner setup, plan speed limits are applied more
accurately, internet forwarding for PPPoE clients is more reliable, and client
sessions recover cleanly across reconnects and after an in-product update.

**Client speed limits.** Fixed a case where client speed limits were not
reapplied after a reboot.

**Remote Management.** No longer offered on devices with limited memory where it
isn't supported, avoiding a feature that couldn't run reliably there.

**Diagnostics.** The firmware build identity is now reported for easier support.

## beta 0.4.62 — 2026-09-11

**Node management.** Improved the pin-settings editor and Save workflow, with
more reliable delivery of node configuration changes.

**Appearance.** The client portal now follows the device's system theme by
default and uses a quieter corner theme control.

**PC and single-board computer images.** Added broader USB Ethernet adapter
support and improved compatibility with in-product updates.

## beta 0.4.61 — 2026-09-09

**PC and single‑board computer images.** JuanFi‑RE now runs on **Raspberry Pi
3 / 4 / 5**, **x86‑64 PCs** (BIOS and EFI), and **Orange Pi One / PC / Zero 3**.
These ship as ready‑to‑write whole‑disk images (`.img.gz`) that configure their
network automatically on first boot — the first wired port becomes the internet
uplink and the onboard Wi‑Fi becomes the hotspot, so a headless box comes up
ready for setup.

**Coin acceptor over GPIO.** Boards with GPIO pins can now read a coin acceptor
directly, set up from a new **PIN Settings** tab in the admin.

**Node management.** The Edit dialog for a coin‑acceptor node now shows its live
system info (heap, uptime, Wi‑Fi signal, coin counters), lets you change its pin
assignments, and can push a **firmware update to the node over the air** from the
admin — no reflashing by hand. Requires node firmware v0.4 (below).

**New device.** Added support for the **AIRPHO AR‑W410**.

## node firmware v0.4 — 2026-09-09

**Managed from the router.** The ESP8266 coin‑acceptor node can now be viewed,
reconfigured, and updated remotely from the router's admin over the local
network — including an over‑the‑air firmware update. Reflash **both** node images
(firmware **and** LittleFS UI) to move an existing node to v0.4; after that,
future updates can be pushed from the admin.

## beta 0.4.60 — 2026-09-08

**Admin dashboard.** Added a revenue overview tile and a live CPU and memory
usage monitor.

**Reliability.** The router now recovers automatically by rebooting after a
prolonged loss of internet connectivity.

**Upgrades.** Wi‑Fi settings are now preserved across firmware updates.

**Appearance.** Refined the admin sidebar in light mode.

## beta 0.4.59 — 2026-09-08

**Admin interface.** Fixed an issue that could prevent the dashboard from loading
on some devices.

## beta 0.4.58 — 2026-09-08

**System updates.** Improved firmware installation compatibility while retaining
download integrity checks.

## beta 0.4.57 — 2026-09-08

**PPPoE subscriptions.** Added reusable plans and improved subscriber management
for PPPoE deployments.

**Appearance.** Added light and dark modes to both the client portal and admin
dashboard.

**Reliability and performance.** Improved time accounting, sales resets, client
expiry display, long-duration grants, upgrade migrations, and low-memory admin
performance.

## beta 0.4.56 — 2026-09-04

**Portal.** The Insert Coin screen now shows the time you've earned updating live
as you insert coins.

**Vouchers.** Voucher codes are now matched case‑insensitively and redemption was
hardened for more reliable, consistent results.

**Remote Management.** Now off by default, with a new toggle to start it
automatically on boot when you do enable it.

## node firmware v0.3 — 2026-09-04

**Wired nodes.** The ESP8266 coin‑acceptor node firmware can now connect to the
router by **Ethernet cable** (a W5500 module) in addition to Wi‑Fi. A **single
firmware image** covers both — choose **Wi‑Fi** or **Ethernet** in the first‑run
Setup wizard, which then confirms the link and fills in the right coin‑acceptor
pins for you. Reflash **both** node images (firmware **and** LittleFS UI) to get it.

## beta 0.4.55 — 2026-09-03

**Scheduling.** Added an optional weekly auto‑restart schedule in Settings so the
router can reboot itself on a chosen day and time.

**Networking.** New VLANs now start serving addresses right away, without needing
a reboot.

## beta 0.4.5 — 2026-09-02

**Vouchers and session validity.** A voucher's expiry now defines the paid
session's validity window, and batch expiry uses a days/hours/minutes picker.
Used vouchers can now be deleted, with a confirmation warning.

**Portal time handling.** Pausing a session now freezes the clock and restores the
full remaining time on resume; the portal shows the full validity window as the
Expiration; and paused time plus bandwidth settings now carry across a device
transfer.

**Free time.** Free‑time access moved into Captive Portal settings, with a new
weekly availability schedule and configurable claim frequency.

**Branding.** Custom portal logos can now display full‑width, and operators can
post an Announcement message on the portal.

## beta 0.4.4 — 2026-08-31

**Storage and reliability.** Improved on‑device storage handling so Remote
Management no longer uses up flash space on low‑storage routers, plus tidier
cleanup of update backups. Expanded the on‑router diagnostics bundle for faster
support.

## beta 0.4.3 — 2026-08-30

**PPPoE Server and admin WAN / Internet page.** Routers can now run their own
PPPoE server for downstream billing, with a new admin PPPoE Server page (plans,
subscriptions, pay‑bill captive screen) and a new admin WAN / Internet page with a
live throughput chart and guided uplink configuration — SQM/per‑client shaping is
now correctly re‑applied after a WAN change.

**Router Pro reliability.** Router Pro entitlement is now more robust across reboots and network changes.
The admin UI also gets Router Pro upsell prompts on Free‑tier routers and a
corrected Free‑tier node badge.

**Fixes:** OTA checksum lookup now tolerates `./`‑prefixed `SHA256SUMS` lines;
voucher "Expiry (days)" now converts to an absolute timestamp on generate instead
of drifting; VLAN trunk‑port picker no longer shows duplicate ports; base button
CSS and Vouchers UX cleanup; native file‑input picker button is now themed.

**Admin SPA refactor.** The whole admin single‑page app was componentized (shared
combobox CSS moved into the core stylesheet, per‑session page‑asset caching, a nav
loader, and fixes for cross‑module scope errors introduced by the refactor) —
internal, no user‑visible behavior change beyond a snappier nav.

## beta 0.4.1 — 2026-08-27

**Fixed System Update flashing.** In‑place System Update / OTA and manual‑image
flashing now complete reliably instead of occasionally rebooting back onto the old
firmware. Root cause: the flasher ran as a child of a wrapper process that lingered
into the bootloader hand‑off (procd stage‑2) and could abort the write; it now
replaces itself (`exec sysupgrade`) so the upgrade proceeds exactly like a CLI/LuCI
flash. The System Update screen also drops live polling for a simple
"Flashing… please wait for reboot" dialog, and an applied hotfix now reports to the
dashboard within seconds instead of on the next hourly heartbeat. Your settings and
data are preserved across the update.

Because **0.4.0 was never published** (it shipped with the flashing bug above),
0.4.1 also carries everything from 0.4.0 below — if you're coming from 0.3.6 you get
all of it in one update.

## beta 0.4.0 — 2026-08-26 *(unreleased — folded into 0.4.1)*

Expanded router hardware support, plus a new single‑port access‑point mode.

- **New supported routers:**
  - **Mercusys MR70X v1 / MR1800X** (AX1800, MT7621)
  - **Ruijie RG‑EW3200GX PRO** (Wi‑Fi 6, MT7622)
  - **Comfast CF‑EW72 v2** and **CF‑EW71 v2** (outdoor PoE APs)
- **TP‑Link EAP225 family — single‑port AP‑as‑gateway** (v1, v3, v4, Outdoor v1,
  Outdoor v3, Wall v2). The lone PoE Ethernet port becomes the WAN uplink and the
  built‑in Wi‑Fi is the 10.0.0.1/24 hotspot LAN. ⚠️ **Experimental** — not yet
  boot‑tested on hardware; flash only on a device you can recover. (v2 hardware flashes
  the v1 image; v5 has no working OpenWrt Wi‑Fi driver and is not provided.)
- **ASUS RT‑AC68U** — provided, but ⚠️ **Wi‑Fi is unsupported** on this Broadcom board in
  OpenWrt. It routes over Ethernet only and **cannot serve its own hotspot** — use it
  wired or paired with an external AP node.
- Build‑pipeline hardening: one‑image‑per‑device with continue‑on‑error, and correct
  handling of Broadcom `.trx` images.

The ESP8266 coin‑acceptor node firmware is unchanged from 0.3.6 (**v0.2**).

## beta 0.3.6 — 2026-08-24

- Minor bug fixes.
- **Fixed the update process** — in‑place System Update / OTA flashing now completes
  reliably (the flasher's loop‑device helper was missing on some boards, so a
  firmware update could silently do nothing and revert). The System Update screen now
  also shows the live upgrade log in a terminal view so you can watch it flash.
- **Fixed timezone issues** — saving Session Policies no longer fails with an
  "invalid timezone" error; the full time‑zone database now ships in the image.

The ESP8266 coin‑acceptor node firmware is updated to **v0.2**: a guided first‑run
**Setup wizard** (secure → join Wi‑Fi → router link → pair → coin acceptor) that
replaces the bare admin page on a freshly‑flashed node, plus a captive‑portal fix
so the setup page opens directly instead of a blank screen that needed a reload.
**Reflash both node images** (Wireless firmware **and** LittleFS UI) to get it.

## beta 0.3.5 — 2026-08-23

- **Connectivity improvement** — hardened captive‑portal handling for more reliable pre‑authentication behavior.
- **System Upgrade** — update the router firmware from the admin panel: upload a
  firmware image or pick an OTA build, with automatic patch handling.
- **Printable vouchers** — generate printable voucher sheets, with your print settings
  saved for next time.
- **New device:** **ZBT WG3526 (16 MB)** image (`ramips/mt7621`,
  `zbtlink_zbt-wg3526-16m`) — [device page](https://openwrt.org/toh/zbtlink/zbt_wg3526).

The ESP8266 coin‑acceptor node firmware is **unchanged since v1.0** — no reflash needed.

## beta 0.3 — 2026-08-22

A large feature release across all three router images (CF‑N5 v2, RG‑EW1200G PRO
v1.1, and the RT‑AX52 dev‑kit). The ESP8266 coin‑acceptor node firmware is
**unchanged since v1.0** — no reflash needed.

> **Reflash note:** the CF‑N5 v2 image is built on the `zbtlink_zbt-wg3526-16m`
> profile (both radios). Coming from a different profile, use `sysupgrade -F -n`.

### New device support
- **Newifi D2** (D‑Team) — `ramips/mt7621`, profile `d-team_newifi-d2` (officially
  supported by OpenWrt).
- **Linksys EA8300 (AC2200)** — `ipq40xx/generic`, profile `linksys_ea8300`
  (Qualcomm IPQ4019, tri‑radio, NAND). The shipped `.bin` is a **sysupgrade** image;
  first install from stock Linksys firmware uses the OpenWrt factory flow.
- **Linksys WRT1900ACS** — `mvebu/cortexa9`, profile `linksys_wrt1900acs` (Marvell
  Armada 385, 128 MB NAND / 512 MB RAM, dual‑firmware). Sysupgrade image; first
  install from stock uses the OpenWrt factory image.
- **Linksys EA8300 also built on OpenWrt 23.05.5** (in addition to 24.10.3), because
  upgrading this board to 24.10.x can fail to boot ([openwrt#17979](https://github.com/openwrt/openwrt/issues/17979)).
  The **23.05.5** image is recommended for the EA8300; both are published.
- **EDUP EP‑RT2983** (Wi‑Fi 6) — `ramips/mt7621`, profile `edup_ep-rt2983` (MT7621AT +
  MT7915, 5× GbE, 128 MB NAND / 256 MB RAM). Built on **OpenWrt 25.12.4** (the board was
  added after the 24.10 series). Sysupgrade image; first install from stock uses factory.

### Monetization: Router‑Pro / Free tiers
- **Device tier awareness** — cache / sync / redeem with a tier badge; Free vs Pro.
- **Free‑tier limits** — 10 concurrent active sessions and a branding lock.
- **Router Pro** activation without an api_key via a rate‑limited redeem; cloud
  sync gated to Pro with a Reconnect (reactivate) step; Pro license owner + masked
  key readout. Router Pro, node slots, and Cloud Subscription are decoupled.

### SubVendo / node licensing
- **License‑gated node enrollment**; per‑node **slot enforcement** on the device.
- Subvendo license **carried through enrollment and bound per node** (masked key);
  enroll subvendo nodes **auth‑free via device_id**, rate‑limited redeem.
- **Revoke‑to‑release/reclaim** a node slot; License column + real owner readout.

### Remote‑AP VLAN binding
- `tbl_vendo.vlan_id` (schema **v23**): bind nodes to **AP SSIDs / VLANs** for
  portal auto‑select and node‑name branding; VLAN provisioning + enforcement;
  auto‑select the bound node by ingress VLAN subnet; searchable SSID combo in admin.


### Sessions & time
- **Immutable session‑expiry deadline** + operator **timezone** setting; clients
  **Expiry** column and a system time/timezone readout; **auto‑resume** a paused
  session instantly on portal reconnect.

### Admin UI
- Collapsible sidebar rail with the app **version in the footer**; redesigned
  sidebar header; reusable **show/hide password** field; **branding media
  lifecycle** (remove, deterministic uploads, live previews); one full‑width hero
  logo/banner; logout + debug‑logs moved into the sidebar.


## beta 0.2 — 2026-08-16

Router images bump to **beta 0.2** (OpenWrt 24.10.3). The ESP8266 coin‑acceptor
node firmware is **unchanged since v1.0** — no reflash needed.

### Devices
- Added a **dev‑kit / experimental** image for the ASUS **RT‑AX52** (the development
  reference board), built on **OpenWrt 25.12.0** (`mediatek/filogic`, aarch64).
  Published for testers; not on the 24.10.3 base of the other two boards.

### Anti‑tethering / hotspot re‑share protection
- **Downstream TTL/hop‑limit cap** drops traffic from devices re‑sharing the
  hotspot (the AdoPisoft method), matching the decremented TTL at the FORWARD hook.
- **TCP‑SYN‑fingerprint tether detector** (`cvfi_tether_scan`) with selectable
  enforcement — **off / log / kick** — wired into cron. (The experimental
  timestamp‑clock same‑OS signal was trialled and reverted as false‑positive‑prone.)

### Game‑priority QoS
- **Grouped game‑ports** model with range/CSV support, replacing the flat list.
- **Bitmask‑decomposed `tc` u32 range blocks** + a game‑filter ceiling for accurate
  per‑port prioritisation.
- **Seeded popular mobile‑game defaults** out of the box (MLBB, HoK, CODM), shown as
  a collapsed, view‑proof masked row in the editor.

### Coin‑rate expiry
- New **`wipe_at`** per‑user field (schema **v13**): a coin rate can carry a
  tri‑state expiry that grants a wipe time, swept automatically on expiry, with a
  matching admin UI control.

### Bandwidth / bufferbloat
- **`fq_codel` attached to every per‑client HTB leaf**, fixing bufferbloat under load.

### On‑device sales
- **Reset Sales** on the device, backed by a new `tbl_collections` ledger.

### Admin & captive‑portal UI overhaul
- Broad **UI quality‑of‑life batch** across dashboard, sales, vouchers,
  session policies, portal, insert‑coin and footer, plus a unified **D/H/M** time
  helper and hash‑based tab routing (reload keeps the current page).
- **Branding banner/logo** are now **upload‑only** (URL inputs removed).
- Coin‑rate and game‑priority editors reworked into responsive cards / flat
  1‑row‑per‑entry tables (no horizontal scroll).
- Captive‑portal configuration consolidated out of Settings.

### Diagnostics
- SQLite journal switched to **TRUNCATE** mode, plus an on‑device diagnostics dump
  (`/cgi-bin/debug-logs`) for support.

---

## beta 0.1 — 2026-08-14

Initial public beta.

- Router images for Comfast **CF‑N5 v2** (`zbtlink_zbt-wg3526-16m`) and Ruijie
  **RG‑EW1200G PRO v1.1** (`ruijie_rg-ew1200g-pro-v1.1`), OpenWrt 24.10.3.
- ESP8266 coin‑acceptor node firmware **v1.0** (Wireless + LittleFS images).
- Fully offline PisoWiFi captive portal (coin / voucher / points / free‑time),
  first‑boot self‑init, default LAN `10.0.0.1`, admin `admin`/`admin`.
