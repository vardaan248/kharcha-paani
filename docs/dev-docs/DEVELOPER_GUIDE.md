# Developer Documentation

## Overview

This document provides comprehensive technical documentation for developers working on the Finance Manager application. It covers architecture, components, APIs, and development practices.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Architecture](#architecture)
3. [Backend Development](#backend-development)
4. [Frontend Development](#frontend-development)
5. [Database Design](#database-design)
6. [Security Implementation](#security-implementation)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Project Structure

### Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── core/
│   │   ├── config.py          # Settings from environment
│   │   └── logger.py          # Logging configuration
│   ├── models/
│   │   └── transaction.py     # SQLAlchemy ORM models
│   ├── modules/
│   │   ├── ingestion/         # File parsing module
│   │   ├── categorizer/       # Categorization engine
│   │   ├── analytics/         # Analytics and insights
│   │   └── security/          # Encryption and security
│   ├── api/                    # API endpoints (to be implemented)
│   └── database/
│       └── session.py         # Database session management
├── tests/                      # Test suite
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
└── .gitignore
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/            # Reusable React components
│   ├── pages/                 # Page-level components
│   ├── services/
│   │   └── apiService.js      # Centralized API calls
│   ├── store/                 # State management (Zustand)
│   ├── config/
│   │   └── api.js             # API configuration
│   ├── App.jsx                # Main app component
│   └── main.jsx               # React entry point
├── public/                    # Static assets
├── index.html
├── package.json
├── vite.config.js            # Vite configuration
└── .gitignore
```

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│           Components → Services → API Calls                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                           │
│  Routes → Controllers → Services → Database Layer           │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────┐    ┌────────────┐    ┌──────────┐
   │Database │    │File Storage│    │Encryption│
   │(PostgreSQL)  │            │    │Service   │
   └─────────┘    └────────────┘    └──────────┘
```

### Module Architecture

**Ingestion Module** - Handles file upload and parsing
- CSVParser: Parse CSV files
- ExcelParser: Parse Excel files
- ParserFactory: Create appropriate parser

**Categorizer Module** - Smart transaction categorization
- Rules: Keyword, Regex, Amount-based matching
- RuleEngine: Apply rules to transactions
- Extensible for ML-based categorization

**Analytics Module** - Business intelligence
- TransactionAnalyzer: Compute statistics
- Trend analysis
- Insight generation
- Recurring detection

**Security Module** - Encryption and data protection
- FileEncryptionManager: Encrypt/decrypt files
- PasswordManager: Secure password handling
- FileAccessLog: Audit trail

---

## Backend Development

### Setting Up Development Environment

1. **Create Virtual Environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Initialize Database**
   ```bash
   python -c "from app.database import init_db; init_db()"
   ```

5. **Run Development Server**
   ```bash
   python -m app.main
   # or with auto-reload
   uvicorn app.main:app --reload
   ```

### Key Files and Functions

#### app/core/config.py
Centralized configuration management using Pydantic.

```python
from app.core.config import settings

# Access any setting
db_url = settings.database_url
max_upload = settings.max_upload_size_bytes
```

#### app/database/session.py
Database session management.

```python
from app.database import SessionLocal, get_db

# Use in FastAPI endpoints
@app.get("/items")
def read_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return items
```

#### app/modules/ingestion/parser.py
File parsing logic.

```python
from app.modules.ingestion import ParserFactory

parser = ParserFactory.create_parser("statement.csv")
transactions, errors = parser.parse("path/to/file.csv")
```

#### app/modules/categorizer/engine.py
Transaction categorization.

```python
from app.modules.categorizer import RuleEngine

engine = RuleEngine(db_session)
category, confidence = engine.categorize(transaction)
```

#### app/modules/analytics/analyzer.py
Analytics and insights.

```python
from app.modules.analytics import TransactionAnalyzer

analyzer = TransactionAnalyzer(db_session)
summary = analyzer.get_monthly_summary(2024, 1)
insights = analyzer.get_spending_insights()
```

#### app/modules/security/encryption.py
Encryption and password protection.

```python
from app.modules.security import FileEncryptionManager, PasswordManager

# File encryption
manager = FileEncryptionManager()
encrypted = manager.encrypt_file("statement.pdf", password="secure")

# Password management
hash = PasswordManager.create_password_hash("password")
is_valid = PasswordManager.verify_password("password", hash)
```

### Adding a New API Endpoint

1. Create endpoint file in `app/api/`:
   ```python
   # app/api/transactions.py
   from fastapi import APIRouter, Depends
   from sqlalchemy.orm import Session
   from app.database import get_db
   
   router = APIRouter(prefix="/transactions", tags=["transactions"])
   
   @router.get("/")
   def list_transactions(db: Session = Depends(get_db)):
       transactions = db.query(Transaction).all()
       return transactions
   ```

2. Include router in main app:
   ```python
   # app/main.py
   from app.api import transactions
   
   app.include_router(transactions.router)
   ```

### Database Queries

```python
from app.database import SessionLocal
from app.models import Transaction, Category

db = SessionLocal()

# Get all transactions
all_trans = db.query(Transaction).all()

# Filter transactions
recent = db.query(Transaction).filter(
    Transaction.date >= date(2024, 1, 1)
).all()

# Join with category
trans_with_cat = db.query(Transaction).join(Category).all()

# Aggregate
total = db.query(func.sum(Transaction.amount)).scalar()

db.close()
```

---

## Frontend Development

### React Component Structure

```jsx
// components/MyComponent.jsx
import { useState, useEffect } from 'react'
import ApiService from '../services/apiService'

export default function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await ApiService.getTransactions()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>{/* Component JSX */}</div>
}
```

### State Management with Zustand

```javascript
// store/transactionStore.js
import { create } from 'zustand'

export const useTransactionStore = create((set) => ({
  transactions: [],
  loading: false,
  error: null,
  
  fetchTransactions: async () => {
    set({ loading: true })
    try {
      const data = await ApiService.getTransactions()
      set({ transactions: data, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  
  addTransaction: (transaction) => 
    set((state) => ({ transactions: [...state.transactions, transaction] })),
}))
```

### Using Hooks

```jsx
import { useTransactionStore } from '../store/transactionStore'

export default function TransactionsList() {
  const { transactions, loading, fetchTransactions } = useTransactionStore()
  
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])
  
  return (
    <div>
      {transactions.map((t) => (
        <div key={t.id}>{t.description}</div>
      ))}
    </div>
  )
}
```

### Making API Calls

```javascript
// All API calls go through ApiService
import ApiService from '../services/apiService'

// Get data
const transactions = await ApiService.getTransactions()
const summary = await ApiService.getMonthlySummary(2024, 1)

// Upload file
const response = await ApiService.uploadFile(fileInput.files[0], password)

// Error handling
try {
  const data = await ApiService.getTransactions()
} catch (error) {
  console.error('Failed to load transactions:', error.message)
}
```

---

## Database Design

### Transaction Model

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  amount FLOAT NOT NULL,
  description VARCHAR(500) NOT NULL,
  merchant VARCHAR(200),
  category_id INTEGER REFERENCES categories(id),
  type ENUM('income', 'expense', 'transfer'),
  tags VARCHAR(500),
  notes TEXT,
  categorization_confidence FLOAT DEFAULT 1.0,
  is_recurring BOOLEAN DEFAULT false,
  upload_id INTEGER REFERENCES uploads(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Category Model

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  budget_limit FLOAT,
  color VARCHAR(7) DEFAULT '#3498db',
  icon VARCHAR(50),
  is_system BOOLEAN DEFAULT false,
  matching_keywords TEXT,  -- JSON array
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Upload Tracking

```sql
CREATE TABLE uploads (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(20),
  file_size INTEGER,
  transaction_count INTEGER DEFAULT 0,
  encrypted BOOLEAN DEFAULT false,
  password_protected BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  upload_date TIMESTAMP DEFAULT NOW(),
  processed_date TIMESTAMP
);
```

---

## Security Implementation

### File Encryption

The application uses Fernet (symmetric encryption) for file protection.

```python
from app.modules.security import FileEncryptionManager

# Initialize manager
manager = FileEncryptionManager(encryption_key="base64-encoded-key")

# Encrypt file with password
encrypted_result = manager.encrypt_file("statement.pdf", password="user_password")
# Result includes: encrypted_data, metadata, password_hash

# Decrypt file (with password verification)
decrypted_data = manager.decrypt_file(
    encrypted_result['encrypted_data'],
    password="user_password",
    password_hash=encrypted_result['password_hash']
)
```

### Password Hashing

Never store passwords in plain text. Use bcrypt:

```python
from app.modules.security import PasswordManager

# Hash password for storage
password_hash = PasswordManager.create_password_hash("user_password")
# Store password_hash in database

# Verify password
is_correct = PasswordManager.verify_password("user_password", password_hash)
```

### Audit Logging

Track access to sensitive files:

```python
from app.modules.security import FileAccessLog

# Log file access
FileAccessLog.log_access(
    file_name="statement.pdf",
    action="decrypt",
    success=True,
    user_id="user123"
)

# Retrieve logs
logs = FileAccessLog.get_logs(file_name="statement.pdf", days=30)
```

### Environment Security

```bash
# .env file (NEVER commit this to Git)
DATABASE_URL=postgresql://user:password@localhost/finance_manager
SECRET_KEY=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
ENVIRONMENT=production
```

---

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_parser.py

# Run specific test
pytest tests/test_parser.py::test_csv_parsing -v

# Watch mode (requires pytest-watch)
ptw
```

### Example Test

```python
# tests/test_ingestion.py
import pytest
from app.modules.ingestion import CSVParser

def test_csv_parsing():
    parser = CSVParser("test_data.csv")
    transactions, errors = parser.parse("test_data.csv")
    
    assert len(transactions) > 0
    assert len(errors) == 0
    assert transactions[0]['date'] is not None
    assert transactions[0]['amount'] > 0
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Coverage report
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Deployment

### Backend Deployment

1. **Set up production database**
   ```bash
   createdb finance_manager
   ```

2. **Install production dependencies**
   ```bash
   pip install -r requirements.txt
   pip install gunicorn
   ```

3. **Configure production .env**
   ```bash
   ENVIRONMENT=production
   DATABASE_URL=postgresql://...
   SECRET_KEY=<strong-random-key>
   ENCRYPTION_KEY=<strong-random-key>
   ```

4. **Run with Gunicorn**
   ```bash
   gunicorn app.main:app --workers 4 --bind 0.0.0.0:8000
   ```

### Frontend Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to static hosting (Vercel, Netlify, etc.)**
   ```bash
   # Vercel example
   npm install -g vercel
   vercel --prod
   ```

---

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Error: could not connect to server
   Solution: Check DATABASE_URL in .env, ensure PostgreSQL is running
   ```

2. **Module Import Errors**
   ```
   Error: ModuleNotFoundError: No module named 'app'
   Solution: Ensure backend directory is in PYTHONPATH
   export PYTHONPATH="${PYTHONPATH}:/path/to/backend"
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 8000
   lsof -i :8000
   # Kill process
   kill -9 <PID>
   ```

4. **CORS Errors**
   - Check CORS_ORIGINS in backend/.env
   - Ensure frontend URL is whitelisted

### Logging

Enable debug logging:
```bash
# In .env
LOG_LEVEL=DEBUG
```

Check logs:
```bash
tail -f ./logs/app.log
```

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

