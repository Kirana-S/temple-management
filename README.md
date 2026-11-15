# Hindu Temple Management System – Phase 1

**Temple Name:** Bhairaveshwara Swami and Vana Durga Parameshwari Hindu Temple  
**Version:** 1.0 (Phase 1)

A clean, responsive, and fully functional web-based Temple Management System designed to help temple administrators seamlessly manage daily temple activities, devotees, pooja/abhisheka bookings, donations, expenditures, and accounting reports.

---

## 🛕 Key Features

1. **Dashboard:**
   - Real-time metrics from SQLite database: Total Devotees, Total Donations, Today's Donations, Total Pooja Bookings, Today's Bookings, Total Expenses, Monthly Income, and Monthly Expenses.
   - Interactive monthly income vs. expenses chart.
   - Live feeds for recent donations, recent pooja bookings, and recent expenses.

2. **Devotee Management (`/devotees`):**
   - Register devotees with auto-generated Devotee ID (`DEV001`, `DEV002`, ...).
   - Edit devotee details (mobile, email, address, city).
   - Instant search across name, mobile, and city.
   - Delete devotee with confirmation dialog.

3. **Deity Management (`/deities`):**
   - Default presiding sanctum deities seeded automatically:
     - **Bhairaveshwara Swami** (Lord Shiva manifestation)
     - **Vana Durga Parameshwari** (Goddess of the forest & Shakti form)
   - Add new deities or shrines, edit descriptions, and toggle active status.

4. **Pooja & Seva Management (`/poojas`):**
   - 6 pre-seeded temple poojas with amounts: Archana (₹51), Abhisheka (₹251), Special Pooja (₹501), Rudrabhisheka (₹1001), Kumkum Archane (₹101), Durga Pooja (₹751).
   - Configure pooja prices, descriptions, and assign to deities.
   - Filter by deity or search by name.

5. **Pooja Booking Management (`/bookings`):**
   - Schedule bookings by selecting registered devotees or entering walk-in devotee details.
   - Select deity and pooja service (auto-fills default pooja fee).
   - Record payment method (Cash, UPI, Bank Transfer, Cheque, Other) and status (Paid, Pending, Cancelled).
   - Filter bookings by pooja date and search by devotee name.
   - Generate and print official pooja booking receipts with browser print.

6. **Donation Management (`/donations`):**
   - Record donations across 6 categories: General Donation, Annadana Donation, Temple Development, Festival Donation, Building Fund, Other Donation.
   - Automatically generates formal Receipt Numbers (`RCP20260001`, ...).
   - Filter by category and date.
   - Instant printable receipt modal with temple insignia, donor details, and seal/signature boxes.

7. **Expense Management (`/expenses`):**
   - Track temple outlays by category: Temple Maintenance, Electricity, Water, Pooja Materials, Festival Expenses, Annadana Expenses, Staff Expenses, Repairs, Other.
   - Auto-generates Expense ID (`EXP001`, ...).
   - Filter and search by category and expense date.

8. **Reports & Audit Ledger (`/reports`):**
   - Date range filters and quick presets (Today, This Month, All Time).
   - Tabbed view: Summary Statement, Itemized Donations, Pooja Bookings Register, and Expenses Ledger.
   - Net remaining operating balance calculation.
   - Print-optimized view formatted for formal committee reports.

9. **Printable Receipts:**
   - Dedicated print layout for donations and bookings including temple name, address, receipt number, date, devotee/donor name, payment method, amount in INR, and signature blocks.

---

## 🛠️ Technology Stack

- **Backend:**
  - Python
  - FastAPI
  - SQLAlchemy ORM
  - SQLite (file: `backend/temple.db`)
  - Pydantic v2 schemas
- **Frontend:**
  - Next.js (App Router)
  - React
  - TypeScript
  - Tailwind CSS (Temple theme: Saffron, Golden, Cream, Maroon)
  - Lucide React icons
  - Axios

---

## 📁 Project Structure

```
temple-management/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py       # SQLite engine & session
│   │   ├── models.py         # 6 SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── main.py           # FastAPI app & seed initialization
│   │   └── routers/
│   │       ├── devotees.py   # Devotee CRUD
│   │       ├── deities.py    # Deity CRUD
│   │       ├── poojas.py     # Pooja service CRUD
│   │       ├── bookings.py   # Booking CRUD
│   │       ├── donations.py  # Donation CRUD & receipt number generator
│   │       ├── expenses.py   # Expense CRUD
│   │       ├── dashboard.py  # Statistics & chart aggregation
│   │       └── reports.py    # Filtered accounting reports & summary
│   ├── requirements.txt
│   └── temple.db             # Auto-generated SQLite database
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Receipt.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── Toast.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── dashboard/page.tsx
│   │   ├── devotees/page.tsx
│   │   ├── devotees/new/page.tsx
│   │   ├── deities/page.tsx
│   │   ├── poojas/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── bookings/new/page.tsx
│   │   ├── donations/page.tsx
│   │   ├── donations/new/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── expenses/new/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── tsconfig.json
└── README.md
```

---

## 🚀 How to Run the Application

### 1. Start the FastAPI Backend

Open a terminal and run:

```bash
cd "c:\Users\Gurumurthi\my website\temple-management\backend"

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start backend server with uvicorn
uvicorn app.main:app --reload --port 8000

or 
python -m uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- Redoc API Docs: `http://localhost:8000/redoc`

*Note:* When the backend starts for the first time, it automatically creates `temple.db` and seeds the 2 primary deities and 6 default pooja services.

---

### 2. Start the Next.js Frontend

Open a second terminal and run:

```bash
cd "c:\Users\Gurumurthi\my website\temple-management\frontend"

# Start the development server
npm run dev
```

- Web Application URL: `http://localhost:3000`
- Opens directly to `/dashboard`.

---

## 🧪 Testing Backend Functionality

To run the built-in end-to-end API test suite:

```bash
cd "c:\Users\Gurumurthi\my website\temple-management\backend"
python -c "from fastapi.testclient import TestClient; from app.main import app; c = TestClient(app); print('Stats:', c.get('/dashboard/stats').json())"
```
