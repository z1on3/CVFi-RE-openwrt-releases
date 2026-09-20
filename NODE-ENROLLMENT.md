# Enrolling an ESP8266 Coin-Acceptor Node

A freshly-flashed CVFi‑RE coin‑acceptor **node** (NodeMCU / ESP8266) now boots into a
**guided Setup wizard** — connect to it from a phone and it walks you through securing
it, joining your Wi‑Fi, linking the router, and **pairing**. Pairing is code‑based: the
router shows a 6‑digit code, you type it on the node, and the node fetches its auth
**token automatically** — you never copy/paste the token by hand.

There are two consoles involved, don't mix them up:

| Console | Where | Title |
|---|---|---|
| **Node** (the coin acceptor) | the node's setup Wi‑Fi at `http://192.168.4.1/` | **CVFI NODE — Guided Setup** |
| **Router** (the PisoWiFi) | `http://10.0.0.1/admin/` | **CVFI RELOADED — PisoWiFi Console** |

---

## Prerequisites

- The node is **flashed** with **both** the CVFi‑RE **firmware** *and* **LittleFS**
  images (see the ESP8266 section in the [README](README.md)). The wizard UI lives in
  the LittleFS image — firmware alone won't show it.
- **Re‑using a node that was provisioned before? Erase the chip first.** The node's
  config (Wi‑Fi + pairing token) is backed up in a flash sector that **survives a
  re‑flash**, so a previously‑paired node comes back *paired* and skips the wizard
  (you'll see the normal Sign‑in page, not Setup). Full‑erase, then flash both images:
  ```sh
  esptool.py --port <PORT> erase_flash
  esptool.py --port <PORT> --baud 460800 write_flash 0x0      CVFi-RE-ESP8266-node-firmware-v0.4.bin
  esptool.py --port <PORT> --baud 460800 write_flash 0x300000 CVFi-RE-ESP8266-node-littlefs-v0.4.bin
  ```
- The router is up and reachable at **`http://10.0.0.1/admin/`** (default login
  `admin` / `admin`).

---

## Connect to the node

On a phone/laptop, join the open Wi‑Fi network **`CVFi-Node-Setup`**. The "sign in to
network" sheet pops up automatically and opens the wizard at **`http://192.168.4.1/`**
(if it doesn't pop, open that address manually). You stay on this setup Wi‑Fi for the
whole process — the node joins your router Wi‑Fi in the background without kicking you
off.

---

## Step 1 — Secure this node & pick the node type

First choose **how this node reaches the router**:

- **Wi‑Fi** — the node joins your router's Wi‑Fi as a station (the classic setup).
- **Ethernet** — the node connects by **LAN cable** through a **W5500** module.
  Wire it on the HSPI bus (SCLK=D5, MISO=D6, MOSI=D7, SCS=D3, 3V3, GND); the node
  gets its address automatically by DHCP. In this mode the coin acceptor moves to
  **coin=D4, enable=D8, LED=D2** (D5/D6/D7 are taken by the Ethernet module) — the
  wizard fills these in for you on Step 5.

Then create an **admin password** for the node (min 8 characters) and tap **Create &
continue**. It's stored only as a salted hash and gates the node's console from here on.

![Wizard step 1 — Secure this node](img/wizard-1-secure.png)

---

## Step 2 — Connect to the router

**Wi‑Fi nodes:** tap **SCAN**, pick your router's SSID (e.g. **`CVFi Reloaded`**) from
the list, enter its Wi‑Fi **password** (leave blank for an open hotspot), and tap
**Connect**. The node joins as a station **without rebooting** and shows **Connected**
once it's on — you're still on the setup Wi‑Fi the whole time.

**Ethernet nodes:** there's nothing to type — plug the LAN cable into the node and a LAN
port on your router, then tap **Check connection**. The wizard shows the Ethernet link
coming up and the address it got, then continues automatically.

![Wizard step 2 — Connect to your Wi‑Fi](img/wizard-2-wifi.png)

---

## Step 3 — Router link

The node **auto‑detects** your router's address (the Wi‑Fi gateway — almost always
**`10.0.0.1:80`**) and pre‑fills it. Tap **TEST CONNECTION** to confirm it's reachable,
then **NEXT**. Only change these if your router uses a different address.

![Wizard step 3 — Router link](img/wizard-3-router.png)

---

## Get your activation code (on the router)

Leave the wizard on **Step 4** for a moment and open the **router** admin
**`http://10.0.0.1/admin/`** → **NodeMCU** (under *Subvendos*) → click **ENROLL NODE**
(top‑right of the NodeMCU card).

> **The node isn't listed here yet — that's expected.** An unpaired node has no token,
> so it stays invisible until it activates in the next step.

A dialog shows a **6‑digit activation code** and *"Waiting for the node to activate…"*.
The code expires in 10 minutes.

![Router → NodeMCU → ENROLL NODE](img/05-router-nodemcu.png)

![Router shows the 6‑digit code](img/06-router-enroll-code.png)

---

## Step 4 — Pair with the router

Back on the node wizard, type the **6‑digit code** into the boxes. Each digit **advances
to the next box automatically** (backspace steps back, and you can paste the whole code).
When all six are in, the node activates: it exchanges the code with the router, **receives
its token automatically**, and saves it — you never type the token.

![Wizard step 4 — Pair with the router](img/wizard-4-pair.png)

The router dialog flips to **"✓ Activated"** and the node will come online shortly.

---

## Step 5 — Coin acceptor

Set the coin‑acceptor **wiring pins** — defaults are **in 12 / enable 13 / LED 14**
(D6/D7/D5) on a **Wi‑Fi** node, or **in 2 / enable 15 / LED 4** (D4/D8/D2) on an
**Ethernet** node (the wizard picks the right set for you). Flip **Test mode** and drop a
coin to confirm the **pulse count** matches the coin's value. Not wiring the acceptor
yet? Tap **Skip for now & finish**. Either way, **Finish** turns test mode off and
reboots the node.

![Wizard step 5 — Coin acceptor](img/wizard-5-coin.png)

---

## Done

After the reboot the node reconnects to the router (over Wi‑Fi or the Ethernet cable) and
appears **ONLINE** and **paired** in the router's **NodeMCU** list. From now on you reach
the node's console at its LAN IP or **`cvfi-node-<id>.local`** (the `CVFi-Node-Setup` AP is
gone), and it shows the normal Sign‑in page — the wizard only runs while a node is
unpaired.

![Node Dashboard — online and paired](img/04-node-status.png)

---

## After enrollment

- **Re‑run coin calibration** any time from the node console → **Coin Tester**.
- **Rates & points** — set on the **router** under **Coin Rates** (global), or per‑node
  overrides on the router's **NodeMCU → Edit** page.
- **Rename / manage** the node from the router's **NodeMCU** list (Edit / Unpin / Delete).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| No `CVFi-Node-Setup` AP after flashing | The node kept an old config in its EEPROM backup — **erase the chip** and reflash **both** images (see Prerequisites). |
| Wizard doesn't show — it goes straight to a **Sign‑in** page | The node is still **paired** (its saved token survived the re‑flash). Do a full **`erase_flash`** first, then reflash both images. |
| Setup page blank on first open | Fixed in node **v0.2** (the setup page is now a single self‑contained response). Make sure you flashed the **v0.3** (or newer) LittleFS image. |
| Node not listed on the router *before* pairing | **Expected.** An unpaired node has no token, so it isn't shown. Click **ENROLL NODE** and it appears only after it activates. |
| **"code rejected or expired"** on pairing | The code lives 10 min and is single‑use. Click **ENROLL NODE** again for a fresh code, and make sure Step 3 showed the router as reachable. |
| Node stays **OFFLINE** after pairing | It isn't reaching the router. On a Wi‑Fi node re‑check the Wi‑Fi password (Step 2); on an Ethernet node check the LAN cable and W5500 wiring (SCS=D3, SPI on D5/D6/D7). Confirm the router host (Step 3) is correct. |
| Node online but no coins register | Re‑check the **Coin Acceptor** pins (Step 5 / Coin Tester) and the coin rates on the router. |
