# 🚛 TransportX - Fleet Logbook & Accounting Portal

A modern, high-performance, and minimal React web application tailored for transport and fleet management to handle truck entries, party ledgers, driver assignments, lorry receipt (bilty) printing, and financial accounting.

Designed specifically to be **100% hosted on GitHub Pages** with **Zero Data Loss Guarantee** and built-in **Password Protection**.

---

## 🌟 Key Features

### 1. 📋 Comprehensive Truck Entry Logbook
Log and manage all essential transport and logistics information:
- **Transport Party Details**: Party/Consignor Name, Phone, GSTIN, Address, and City.
- **Vehicle Information**: Truck / Vehicle No. (e.g. `MH 12 RN 8845`), Vehicle Type (14 Wheeler, 10 Wheeler, Trailer, Container, etc.).
- **Route**: Origin (`From`) & Destination (`To`).
- **Dates & Identification**: Trip Date, Auto-generated Lorry Receipt / Bilty Number (e.g. `ST-1001`).
- **Cargo / Goods**: Material description (Steel bars, Cement, FMCG, Agro produce, etc.) & Weight/Quantity.
- **Driver Details**: Driver Full Name & Mobile Number.
- **Financials & Accounting**:
  - Total Freight Amount (₹)
  - Advance Received (₹)
  - Remaining Balance Due (₹) — *Auto-calculated instantly*
  - Payment Status (*Paid*, *Partial*, *Pending*) — *Auto-computed or manual*
  - Operating Costs (Diesel / Fuel expenses, Toll & Police bhatta)
  - Delivery Status (*Booked*, *In Transit*, *Delivered*, *Completed*, *Cancelled*)
  - Remarks / POD notes

### 2. 👥 Transport Party Ledger & Directory
- View all transport parties/clients with aggregate financial statistics.
- Tracks **Total Shipments**, **Total Freight Billed**, **Total Advance Paid**, and **Current Balance Due**.
- **Detailed Account Statement Modal**: Chronological debit/credit history of all trips for any party.
- **1-Click WhatsApp Payment Reminder**: Automatically formats and sends an overdue payment reminder with party and balance details directly via WhatsApp.

### 3. 📄 Printable Lorry Receipt (Bilty Voucher)
- Professional standard Indian Goods Consignment Note / LR formatted for A4 printing.
- Includes TransportX company branding, Consignor particulars, Truck & Driver details, cargo table, freight breakdown, and authorized signature stamps.
- One-click browser print (`Ctrl+P` or Print button) with clean black-and-white print stylesheets.

### 4. 🔒 Built-in Access Protection
- Access-gate modal blocks unauthorized users before any fleet data is revealed.
- Configurable passcode protection managed securely within the **Settings** tab.
- Session memory option ("Remember this device") for authenticated devices.

### 5. 💾 Zero-Data-Loss Architecture (GitHub Pages Ready)
GitHub Pages is a static CDN host without a traditional backend database. TransportX solves this with a **zero-data-loss storage system**:
- **IndexedDB Database (Dexie.js Engine)**: Stores structured records locally inside your browser, surviving page refreshes, browser closures, and system reboots.
- **Dual-Storage Mirror**: Real-time mirror in `localStorage` for high availability.
- **1-Click JSON Backup**: Download a timestamped snapshot of the entire database (`transportx-backup-[date].json`).
- **1-Click SQLite Database Export**: Generates a standard `.sql` script with `CREATE TABLE` and `INSERT INTO` statements compatible with SQLite 3, DB Browser for SQLite, DBeaver, etc.
- **1-Click Excel / CSV Export**: Instant spreadsheet download for Microsoft Excel, Google Sheets, or Tally.
- **1-Click Database Restore**: Upload any backup file to restore 100% of your records immediately.
- **Optional Cloud Sync (Supabase Free Tier)**: Transporters who want automatic synchronization across their mobile phone and office computer can connect a free Supabase PostgreSQL database in the Database tab!

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Navigate to the project directory
cd "z:\Event Tools\transportx"

# 2. Start the local Vite development server
npm run dev
```

Open your browser at the URL shown in your terminal (usually `http://localhost:5173` or `5174`).

---

## 🌐 How to Host on GitHub Pages (Step-by-Step)

### Option A: Automatic Deployment via GitHub Actions (Recommended)

1. Repository: [`https://github.com/Ritik-Jr/transportx`](https://github.com/Ritik-Jr/transportx).
2. Push your latest code:
   ```bash
   git add .
   git commit -m "Update TransportX"
   git push origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **GitHub Actions** (or choose **Deploy from a branch** and select branch **`gh-pages`**).
4. Your website will be live at `https://ritik-jr.github.io/transportx/`!

### Option B: 1-Command Deployment via `gh-pages`

Run:
```bash
npm run deploy
```
This runs `npm run build` and automatically pushes the production `dist` directory to the `gh-pages` branch on GitHub!

---

## 🛠️ Technology Stack

- **React 19**
- **Vite 8**
- **Tailwind CSS v4**
- **Dexie.js** (IndexedDB browser database)
- **Lucide React** (Clean transportation & accounting icons)
- **Canvas Confetti** (User delight feedback on payment settlement)
