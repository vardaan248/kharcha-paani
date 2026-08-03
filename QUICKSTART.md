# Quick Start Guide

Get the Finance Manager application up and running in 5 minutes!

## Prerequisites

- Python 3.9 or higher
- PostgreSQL 12 or higher
- Node.js 16 or higher
- npm or yarn

## Installation Steps

### Step 1: Clone/Download Project

```bash
cd finance-manager
```

### Step 2: Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Edit .env with your database credentials
# Minimum required:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_manager

# Initialize database
python -c "from app.database import init_db; init_db()"

# Start backend server
python -m app.main
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Frontend Setup (3 minutes)

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 4: Open Application

Visit: **http://localhost:5173**

You should see the Finance Manager dashboard! 🎉

---

## Next Steps

### 1. Upload a Sample Bank Statement

1. Click "Upload Statement" button
2. Create a sample CSV file:

```csv
Date,Description,Amount
2024-01-01,Salary Deposit,50000
2024-01-02,Grocery Store,-2500
2024-01-03,Electric Bill,-1200
2024-01-04,Dinner,-800
2024-01-05,Gas Station,-1500
```

3. Upload the file (no password needed for now)
4. Transactions will be auto-categorized!

### 2. Explore Dashboard

- View spending by category (pie chart)
- See monthly trend (line chart)
- Check transaction details

### 3. Manage Categories

1. Go to "Categories" menu
2. Edit existing categories
3. Add custom categories with keywords

### 4. View Analytics

- Analytics → Monthly: See detailed monthly breakdown
- Analytics → Yearly: Compare year-over-year
- Analytics → Insights: Get personalized recommendations

---

## Troubleshooting

### Backend Won't Start

**Error: "could not connect to server"**
```bash
# Check PostgreSQL is running
psql -U postgres

# If not running:
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Services → PostgreSQL → Start
```

**Error: "ModuleNotFoundError: No module named 'app'"**
```bash
# Make sure you're in the backend directory
cd backend
python -m app.main
```

### Frontend Won't Load

**Error: "Connection refused"**
- Check backend is running on http://localhost:8000
- Check CORS settings in backend/.env

**Error: "Module not found"**
```bash
cd frontend
npm install
npm run dev
```

### Database Connection

**Create database manually**:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE finance_manager;
\q
```

**Reset database**:
```python
# In Python
from app.database import drop_tables, create_tables, init_db
drop_tables()
create_tables()
init_db()
```

---

## Project Structure

```
finance-manager/
├── backend/           # Python FastAPI backend
│   ├── app/          # Application code
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   └── package.json
├── docs/             # Documentation
│   ├── dev-docs/     # Technical guides
│   └── user-manual/  # User guides
└── README.md         # Main documentation
```

---

## Development Tips

### Hot Reload

Both frontend and backend support hot reload in development:

- **Frontend**: Edit React components → auto-refresh
- **Backend**: Edit Python files → auto-restart

### Access API Documentation

Backend provides interactive documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Database Inspection

```bash
# Connect to database
psql -U postgres -d finance_manager

# List tables
\dt

# Inspect transactions table
\d transactions

# Query example
SELECT * FROM categories;
```

### Clear All Data

```python
# Python script
from app.database import SessionLocal
from app.models import *

db = SessionLocal()
db.query(Transaction).delete()
db.query(Upload).delete()
db.query(AuditLog).delete()
db.commit()
print("Data cleared!")
```

---

## Common Commands

### Backend Commands

```bash
# Start server
python -m app.main

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Check for errors
python -m pylint app/

# Format code
black app/
```

### Frontend Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Security Reminder

⚠️ **Before sharing or deploying**:

1. Never commit `.env` file
2. Generate new SECRET_KEY and ENCRYPTION_KEY
3. Use strong database password
4. Enable HTTPS in production
5. Set ENVIRONMENT=production
6. Update CORS_ORIGINS for your domain

---

## Next Reading

- **[Full README](../README.md)** - Complete project documentation
- **[Developer Guide](../docs/dev-docs/DEVELOPER_GUIDE.md)** - Technical deep dive
- **[User Manual](../docs/user-manual/USER_GUIDE.md)** - How to use the app
- **[Architecture](../docs/dev-docs/ARCHITECTURE.md)** - System design
- **[Security Guide](../docs/dev-docs/SECURITY.md)** - Security implementation
- **[Database Schema](../docs/dev-docs/DATABASE.md)** - Data model

---

## Need Help?

1. Check the documentation in `/docs` folder
2. Review error messages carefully
3. Check logs: `./logs/app.log`
4. Inspect browser console (F12) for frontend errors

---

**Happy finances tracking! 💰**

*Report bugs or ask questions in documentation.*
