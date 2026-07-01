# ctrlSTOP - Cyber Cafe Management System (Prototype)

A full-stack, crash-proof cyber cafe management platform built with Node.js, Socket.io, React, and Electron. It features remote desktop locking, automated countdown timers, a custom game launcher shell, and multi-station memory sync.

---

##  Core Architecture

The system is built as a **monorepo** consisting of three main modules:

1. **The Brain (Server):** Node.js & Express server handling WebSocket connections, multi-room synchronization, and session state serialization.
2. **The Remote (Admin Dashboard):** A web interface serving realtime controls to monitor and allocate gaming sessions across multiple client stations.
3. **The Guard (Client App):** An Electron application utilizing a React dashboard that serves as a custom game launcher shell and hardware lock screen.

---

##  Features Implemented

*   **Realtime Multi-Station Rooms:** Leverages Socket.io rooms to securely target specific client terminals (`station-1`, `station-2`, etc.) independently.
*   **Automated Countdown Engine:** Backend precision intervals dictate user sessions and execute automated lock commands at exactly `00:00`.
*   **Persistent Session Memory:** Writes system states to `stations.json` automatically, facilitating mid-session crash-recovery.
*   **Integrated Game Launcher:** Replaces the native desktop interface with an interactive React application grid simulating full-screen game execution.

---

##  Local Installation & Development

To deploy the development prototype locally, configure three separate terminal instances:

### 1. Start the Server
```bash
cd server
npm install
node index.js

```
--- 
# NEED TO ADD FEATURES

## 1. SECURITY AND HARDINING 

   * 1. windows shortcuts can still bypass the electron UI the lock screen .Need to use the registry edit(regedit) or a node library to kill the windows shortcuts continiously.

   * 2. Automated force close - when the timer hits 00:00 the app should forcefuly kill the running game before showing the lock screen.
   * 3. Shell Replacement - Configure the client app to replace <mark><u>explorer.exe</u></mark> replacing your entire windows desktop upon booting up windows startup. if a station pc crahses it show black screen instead of windows desktop

   * 4. Deep Freeze Integration - connecting a tools like faronics Deep Freeze via scripts so that the moment the session hits 00:00 it forcefully resarts the PC and wipes any downloaded file ,viruses , or game hacks left behind the customer 

## 2. UI/UX CHANGES

   * 1. Floating overlay - Displaying how much time is left on realtime a semi transparent small timer on the top right side corner.

   * 2. Messages/Announcement - Admin can send a message to the client using the admin panel to show it as a pop-up mesasge in for 3-5 seconds on the client's side.

## 3. ADMIN INFRASTRUCTURE 

   * 1. Screenshot/Task monitoring - Admin can capture and see the screenshot of a particualr client to see the what's going on the each station.

   * 2. Remotely controlling - Admin can shutdown , restart , sleep a station on command using the admin panel.

## 4. REVENUE , PAYMENT FEATUERS & POS SYSTEM

   * 1. QR CODE/ Digital Payment integration - When a station is locked, show a dynamic QR Code in the screen user pays it using UPI and and get the time they bought.

   * 2. PrePaid Ticket/Voucher System - Genrate a list of random 6 digit code in the admin panel (e.g X8Y2Z0 = 2hours) the owner prints it out and the user use it to unmlock a station and the code/voucher expires.
   * 3. Self-Service Kiosk & UPI Automation -  Self-Service Kiosk & UPI Automation - A client-facing dashboard where users can create their own accounts ,  scan a dynamic UPI QR code to instantly buy credits, and log in securely from any vacant station without needing the admin to touch a button.

## 5.BANDWITH & GAME UPDATE

* 1. Local PXE Boot / LAN Cache Server - server acts as a local cache . when station 1 upadete a game  the server saves the updates files when station2 needs a update it pull over the fast cached server at 1GBPS, consuming 0 internet bandwith.
