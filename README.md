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

# need to add features  