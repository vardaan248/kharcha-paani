# Architecture Guide

## System Overview

The Finance Manager application follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer (Frontend)                │
│                   React Components + UI Layer                    │
│                  (Vite, Chart.js, Zustand)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (JSON)
┌────────────────────────────▼────────────────────────────────────┐
│                    Application Layer (Backend)                   │
│              FastAPI - Request Handling & Routing                │
└────────────────────────────┬────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
      ┌──────────────┐ ┌───────────────┐ ┌─────────────┐
      │  Ingestion   │ │ Categorizer   │ │  Analytics  │
      │   Module     │ │    Module     │ │   Module    │
      │              │ │               │ │             │
      │ - CSV/Excel  │ │ - Rule Engine │ │ - Analyzer  │
      │   Parser     │ │ - Pattern     │ │ - Insights  │
      │ - Validation │ │   Matching    │ │ - Trends    │
      └──────────────┘ └───────────────┘ └─────────────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
      ┌──────────────┐ ┌───────────────┐ ┌─────────────┐
      │   Security   │ │   Database    │ │   Models    │
      │   Module     │ │   Layer       │ │   Layer     │
      │              │ │               │ │             │
      │ - Encryption │ │ - SQLAlchemy  │ │ - ORM       │
      │ - Hashing    │ │ - PostgreSQL  │ │ - Schemas   │
      │ - Audit Log  │ │ - Sessions    │ │ - Relations │
      └──────────────┘ └───────────────┘ └─────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  PostgreSQL DB  │
                    │                 │
                    │ - Transactions  │
                    │ - Categories    │
                    │ - Uploads       │
                    │ - Audit Logs    │
                    └─────────────────┘
```

## Core Components

### 1. Ingestion Module
**Responsibility**: Parse and import bank statement files

**Components**:
- `Parser` (Abstract Base) - Template for all parsers
- `CSVParser` - Parse CSV bank statements
- `ExcelParser` - Parse Excel files
- `ParserFactory` - Create appropriate parser

**Key Features**:
- Auto-detect column names
- Handle multiple formats
- Validation and error reporting
- Transaction normalization

**Example Flow**:
```
Upload File → Validate → Parse → Normalize → Return Transactions
```

### 2. Categorizer Module
**Responsibility**: Intelligently categorize transactions

**Components**:
- `Rule` (Abstract) - Base rule class
- `KeywordRule` - Match by keywords
- `RegexRule` - Pattern matching
- `AmountRule` - Match by amount ranges
- `RuleEngine` - Apply rules to transactions

**Key Features**:
- Configurable rule sets
- Multi-rule evaluation
- Confidence scoring
- Extensible for ML models

**Example Flow**:
```
Transaction → Load Rules → Evaluate Rules → Select Category → Return (Category, Confidence)
```

### 3. Analytics Module
**Responsibility**: Compute statistics and insights

**Components**:
- `TransactionAnalyzer` - Core analytics engine

**Key Features**:
- Monthly/yearly summaries
- Category breakdowns
- Spending trends
- Recurring detection
- Smart insights generation

**Example Flow**:
```
Transactions → Group by Category → Calculate Stats → Generate Insights
```

### 4. Security Module
**Responsibility**: Encryption and access control

**Components**:
- `FileEncryptionManager` - Encrypt/decrypt files
- `PasswordManager` - Hash/verify passwords
- `FileAccessLog` - Audit trail

**Key Features**:
- Fernet symmetric encryption
- Bcrypt password hashing
- Access logging
- Audit trail

**Example Flow**:
```
Upload File + Password → Encrypt → Store Password Hash → Log Access
```

### 5. Database Layer
**Responsibility**: Data persistence and retrieval

**Components**:
- `session.py` - SQLAlchemy session management
- Models: Transaction, Category, Upload, MonthlySnapshot, AuditLog

**Key Features**:
- Connection pooling
- ORM mapping
- Relationship management
- Query optimization

## Data Flow Patterns

### Pattern 1: File Upload and Processing

```
1. User uploads file
2. Backend receives file
3. Validation (type, size)
4. Parse file (CSVParser/ExcelParser)
5. Normalize transactions
6. Detect duplicates
7. Categorize each transaction (RuleEngine)
8. Store in database
9. Compute monthly snapshot
10. Return summary to frontend
```

### Pattern 2: Analytics Request

```
1. User requests monthly summary
2. Backend queries transactions for date range
3. Group by category
4. Calculate totals and statistics
5. Run insight generators
6. Format response
7. Return to frontend
8. Frontend displays charts/data
```

### Pattern 3: Secure File Access

```
1. Upload with password protection
2. Encrypt file (FileEncryptionManager)
3. Store encrypted data + password hash
4. Log upload action
5. Later: Request file with password
6. Verify password against hash
7. Decrypt file (if valid)
8. Log access attempt
9. Return decrypted data
```

## API Layer Design

### REST Endpoints Structure

```
/api
├── /transactions
│   ├── GET    /                    # List transactions
│   ├── POST   /                    # Create transaction
│   ├── GET    /{id}                # Get by ID
│   ├── PUT    /{id}                # Update
│   └── DELETE /{id}                # Delete
│
├── /categories
│   ├── GET    /                    # List categories
│   ├── POST   /                    # Create category
│   ├── GET    /{id}                # Get by ID
│   ├── PUT    /{id}                # Update
│   └── DELETE /{id}                # Delete
│
├── /uploads
│   ├── GET    /                    # List uploads
│   ├── POST   /file                # Upload new file
│   └── GET    /{id}                # Get status
│
├── /analytics
│   ├── GET    /monthly/{year}/{month}    # Monthly summary
│   ├── GET    /yearly/{year}             # Yearly summary
│   ├── GET    /trends/{category}         # Category trends
│   ├── GET    /insights                  # Smart insights
│   └── GET    /recurring                 # Recurring expenses
│
└── /security
    ├── POST   /encrypt                   # Encrypt file
    ├── POST   /decrypt                   # Decrypt file
    └── GET    /audit-logs                # Access logs
```

### Error Handling Strategy

```
Request → Validation → Processing → Response
                ↓
           Invalid Input
                ↓
        Return Error Response
        - 400 Bad Request
        - 401 Unauthorized
        - 404 Not Found
        - 500 Server Error
```

## Scalability Considerations

### Phase 1 (Current)
- Single user, local database
- File storage on local filesystem
- In-memory caching for rules

### Phase 2
- Add user accounts (multi-tenancy)
- Implement caching layer (Redis)
- Add background job queue (Celery)
- Pre-computed analytics snapshots

### Phase 3
- Distributed database (sharding)
- S3/Cloud file storage
- Microservices architecture
- Real-time updates (WebSockets)

## Design Patterns Used

### 1. Factory Pattern
```python
# ParserFactory creates appropriate parser
parser = ParserFactory.create_parser("file.csv")  # Returns CSVParser
parser = ParserFactory.create_parser("file.xlsx") # Returns ExcelParser
```

### 2. Strategy Pattern
```python
# Different rules implement same interface
class Rule(ABC):
    def matches(self, transaction): pass

class KeywordRule(Rule): ...
class RegexRule(Rule): ...
class AmountRule(Rule): ...
```

### 3. Singleton Pattern
```python
# Single settings instance
from app.core.config import settings
# Used throughout app for consistency
```

### 4. Repository Pattern
```python
# Data access abstraction
class TransactionRepository:
    def get_all(self): ...
    def get_by_date_range(self, start, end): ...
    def save(self, transaction): ...
```

### 5. Dependency Injection
```python
# FastAPI dependency injection
@app.get("/")
def read_root(db: Session = Depends(get_db)):
    # db is injected
    pass
```

## Extension Points

### Adding New File Formats

```python
from app.modules.ingestion import Parser

class PDFParser(Parser):
    def parse(self, file_path):
        # Extract transactions from PDF
        return transactions, errors
    
    def validate(self):
        # Validate PDF format
        return True
```

Then update `ParserFactory`:
```python
PARSERS = {
    "csv": CSVParser,
    "xlsx": ExcelParser,
    "pdf": PDFParser,  # NEW
}
```

### Adding New Analytics

```python
class TransactionAnalyzer:
    def custom_analysis(self):
        # New analysis method
        return results
```

### Adding New Categorization Rules

```python
class CustomRule(Rule):
    def matches(self, transaction):
        # Custom matching logic
        return boolean
```

## Performance Optimization

### Database
- Index on frequently queried columns (date, category_id)
- Pre-compute monthly snapshots
- Connection pooling
- Query optimization

### Frontend
- Lazy load charts
- Pagination for transaction lists
- Local caching of API responses
- Code splitting with Vite

### Backend
- Cache rule engine in memory
- Batch processing for uploads
- Async processing for heavy operations
- Response compression

## Security Architecture

```
┌─────────────────────┐
│   User Interface    │
└──────────┬──────────┘
           │
      ┌────▼────┐
      │ CORS    │ ← Check origin
      │ Policy  │
      └────┬────┘
           │
      ┌────▼──────────┐
      │ Authentication│ ← Verify identity
      │ (future)      │
      └────┬──────────┘
           │
      ┌────▼──────────┐
      │ Authorization │ ← Check permissions
      │ (future)      │
      └────┬──────────┘
           │
      ┌────▼────────────────┐
      │ Input Validation    │ ← Sanitize input
      │ & Sanitization      │
      └────┬────────────────┘
           │
      ┌────▼──────────┐
      │ Encryption    │ ← Protect data
      │ & Hashing     │
      └────┬──────────┘
           │
      ┌────▼──────────┐
      │ Audit Logging │ ← Track actions
      │ & Monitoring  │
      └────┬──────────┘
           │
    ┌─────▼──────┐
    │  Database  │
    └────────────┘
```

---

This architecture supports the current needs while remaining flexible for future enhancements. Each module can be developed, tested, and extended independently.
