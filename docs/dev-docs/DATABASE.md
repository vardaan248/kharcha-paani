# Database Schema

## Overview

This document describes the complete database schema for the Finance Manager application using PostgreSQL.

## Entity-Relationship Diagram

```
┌─────────────────────┐
│    TRANSACTIONS     │
├─────────────────────┤
│ id (PK)             │
│ date                │
│ amount              │
│ description         │
│ merchant            │◄───────┐
│ category_id (FK)────┼───────┐│
│ type                │       ││
│ tags                │       ││
│ notes               │       ││
│ confidence          │       ││
│ is_recurring        │       ││
│ upload_id (FK)──┐   │       ││
│ created_at      │   │       ││
│ updated_at      │   │       ││
└─────────────────┼───┼───────┼┘
                  │   │       │
         ┌────────┘   │       │
         │            │       │
    ┌────▼────────┐   │       │
    │  UPLOADS    │   │       │
    ├─────────────┤   │       │
    │ id (PK)     │   │       │
    │ filename    │   │       │
    │ original..  │   │       │
    │ file_type   │   │       │
    │ file_size   │   │       │
    │ transaction │   │       │
    │ _count      │   │       │
    │ encrypted   │   │       │
    │ password..  │   │       │
    │ password..  │   │       │
    │ status      │   │       │
    │ error_msg   │   │       │
    │ upload_date │   │       │
    │ processed.. │   │       │
    └─────────────┘   │       │
                      │   ┌───▼────────────┐
                      │   │  CATEGORIES    │
                      │   ├────────────────┤
                      │   │ id (PK)        │
                      │   │ name (UNIQUE)  │
                      │   │ description    │
                      │   │ budget_limit   │
                      │   │ color          │
                      │   │ icon           │
                      │   │ is_system      │
                      │   │ matching_..    │
                      │   │ created_at     │
                      │   │ updated_at     │
                      │   └────────────────┘
                      │
    ┌─────────────────┘
    │
    ▼
┌────────────────────────┐
│ MONTHLY_SNAPSHOTS      │
├────────────────────────┤
│ id (PK)                │
│ year                   │
│ month                  │
│ total_income           │
│ total_expense          │
│ net_cash_flow          │
│ transaction_count      │
│ top_category           │
│ top_category_amount    │
│ snapshot_data (JSON)   │
│ created_at             │
│ updated_at             │
└────────────────────────┘

┌─────────────────────────┐
│  USER_PREFERENCES       │
├─────────────────────────┤
│ id (PK)                 │
│ preference_key (UNIQUE) │
│ preference_value        │
│ data_type               │
│ created_at              │
│ updated_at              │
└─────────────────────────┘

┌─────────────────────────┐
│   AUDIT_LOGS            │
├─────────────────────────┤
│ id (PK)                 │
│ action                  │
│ entity_type             │
│ entity_id               │
│ details (JSON)          │
│ success                 │
│ error_message           │
│ created_at              │
└─────────────────────────┘
```

## Tables

### 1. TRANSACTIONS

Stores individual financial transactions.

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    description VARCHAR(500) NOT NULL,
    merchant VARCHAR(200),
    category_id INTEGER REFERENCES categories(id),
    type VARCHAR(20) NOT NULL DEFAULT 'expense' 
        CHECK (type IN ('income', 'expense', 'transfer')),
    tags VARCHAR(500),
    notes TEXT,
    categorization_confidence FLOAT DEFAULT 1.0,
    is_recurring BOOLEAN DEFAULT FALSE,
    upload_id INTEGER REFERENCES uploads(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_transactions_date (date),
    INDEX idx_transactions_category_id (category_id),
    INDEX idx_transactions_upload_id (upload_id)
);
```

**Columns**:
- `id` - Unique identifier
- `date` - Transaction date (indexed for date range queries)
- `amount` - Transaction amount (can be positive or negative)
- `description` - Transaction description from bank
- `merchant` - Vendor/merchant name (extracted from description)
- `category_id` - Link to category (foreign key)
- `type` - 'income', 'expense', or 'transfer'
- `tags` - Comma-separated custom tags
- `notes` - User notes about transaction
- `categorization_confidence` - 0-1 score (1=100% confident, 0.5=50% confident)
- `is_recurring` - True if detected as recurring
- `upload_id` - Which upload this came from
- `created_at` - When record created
- `updated_at` - Last modification time

**Indexes**:
```sql
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_upload_id ON transactions(upload_id);
CREATE INDEX idx_transactions_merchant ON transactions(merchant);
```

### 2. CATEGORIES

Spending categories for organizing transactions.

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    budget_limit DOUBLE PRECISION,
    color VARCHAR(7) DEFAULT '#3498db',
    icon VARCHAR(50),
    is_system BOOLEAN DEFAULT FALSE,
    matching_keywords TEXT,  -- JSON array of keywords for auto-categorization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_categories_name (name)
);
```

**Columns**:
- `id` - Unique identifier
- `name` - Category name (unique, e.g., "Groceries")
- `description` - Long description
- `budget_limit` - Monthly budget for this category
- `color` - Hex color for UI (e.g., "#E74C3C")
- `icon` - Icon emoji or name (e.g., "🛒")
- `is_system` - True for built-in categories (can't delete)
- `matching_keywords` - JSON array: ["grocery", "supermarket", "trader joe"]
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Default Categories**:
```sql
INSERT INTO categories (name, is_system, color, icon) VALUES
('Groceries', true, '#E74C3C', '🛒'),
('Utilities', true, '#3498DB', '💡'),
('Transportation', true, '#F39C12', '🚗'),
('Entertainment', true, '#9B59B6', '🎮'),
('Healthcare', true, '#E91E63', '💊'),
('Housing', true, '#2ECC71', '🏠'),
('Dining', true, '#E67E22', '🍽️'),
('Shopping', true, '#1ABC9C', '🛍️'),
('Subscriptions', true, '#95A5A6', '📱'),
('Other', true, '#7F8C8D', '📌');
```

### 3. UPLOADS

Tracks imported bank statement files.

```sql
CREATE TABLE uploads (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,  -- 'csv', 'xlsx', 'pdf'
    file_size INTEGER NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    encrypted BOOLEAN DEFAULT FALSE,
    password_protected BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),  -- Bcrypt hash of password
    status VARCHAR(20) DEFAULT 'pending'  -- 'pending', 'processing', 'completed', 'failed'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP,
    
    INDEX idx_uploads_status (status),
    INDEX idx_uploads_upload_date (upload_date)
);
```

**Columns**:
- `filename` - Stored filename (hashed/safe)
- `original_filename` - Filename user uploaded
- `file_type` - 'csv', 'xlsx', or 'pdf'
- `file_size` - File size in bytes
- `transaction_count` - Number of transactions parsed
- `encrypted` - True if file is encrypted
- `password_protected` - True if password-protected
- `password_hash` - Bcrypt hash of password (if protected)
- `status` - Processing status
- `error_message` - Error details if processing failed
- `upload_date` - When uploaded
- `processed_date` - When processing completed

### 4. MONTHLY_SNAPSHOTS

Pre-calculated monthly statistics for performance.

```sql
CREATE TABLE monthly_snapshots (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    total_income DOUBLE PRECISION DEFAULT 0,
    total_expense DOUBLE PRECISION DEFAULT 0,
    net_cash_flow DOUBLE PRECISION DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    top_category VARCHAR(100),
    top_category_amount DOUBLE PRECISION,
    snapshot_data TEXT,  -- JSON: detailed category breakdown
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(year, month),
    INDEX idx_snapshots_year_month (year, month)
);
```

**Columns**:
- `year`, `month` - Unique identifier for the month
- `total_income` - Sum of all income transactions
- `total_expense` - Sum of all expense transactions
- `net_cash_flow` - income - expense
- `transaction_count` - Number of transactions in month
- `top_category` - Highest spending category
- `top_category_amount` - Amount in top category
- `snapshot_data` - JSON: `{"Groceries": 5000, "Dining": 2000, ...}`
- `created_at`, `updated_at` - Timestamps

**Snapshots are computed**:
- When new transactions are imported
- When transaction is edited
- On request via API
- Cached for performance

### 5. USER_PREFERENCES

Stores user settings and preferences.

```sql
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    preference_key VARCHAR(100) UNIQUE NOT NULL,
    preference_value TEXT NOT NULL,
    data_type VARCHAR(20) DEFAULT 'string'  -- 'string', 'json', 'boolean', 'number'
        CHECK (data_type IN ('string', 'json', 'boolean', 'number')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_preferences_key (preference_key)
);
```

**Columns**:
- `preference_key` - Unique setting name
- `preference_value` - Setting value
- `data_type` - Data type for parsing
- `created_at`, `updated_at` - Timestamps

**Example Preferences**:
```sql
INSERT INTO user_preferences (preference_key, preference_value, data_type) VALUES
('theme', 'light', 'string'),
('currency', 'INR', 'string'),
('default_view', 'monthly', 'string'),
('notifications_enabled', 'true', 'boolean'),
('budget_alert_threshold', '90', 'number'),
('excluded_merchants', '["internal transfer", "check deposit"]', 'json');
```

### 6. AUDIT_LOGS

Audit trail for sensitive operations.

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,  -- 'upload', 'encrypt', 'decrypt', 'delete', etc.
    entity_type VARCHAR(100) NOT NULL,  -- 'transaction', 'upload', 'category', etc.
    entity_id INTEGER,
    details TEXT,  -- JSON: additional details
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_logs_created_at (created_at),
    INDEX idx_audit_logs_entity_type_id (entity_type, entity_id)
);
```

**Columns**:
- `action` - What happened (upload, decrypt, modify, delete)
- `entity_type` - Type of entity affected
- `entity_id` - ID of affected entity
- `details` - JSON with extra info
- `success` - Operation succeeded?
- `error_message` - Error if failed
- `created_at` - When action occurred

**Example Log Entry**:
```sql
INSERT INTO audit_logs (action, entity_type, entity_id, details, success) VALUES
('decrypt', 'upload', 5, '{"file_name": "statement.pdf", "user_id": "user123"}', true);
```

---

## Queries

### Common Query Patterns

**Get Monthly Summary**:
```sql
SELECT 
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    COUNT(*) as transaction_count
FROM transactions
WHERE date >= '2024-01-01' AND date < '2024-02-01';
```

**Get Spending by Category**:
```sql
SELECT 
    c.name,
    SUM(t.amount) as total,
    COUNT(*) as count
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.date >= '2024-01-01' AND t.date < '2024-02-01'
GROUP BY c.name
ORDER BY total DESC;
```

**Find Recurring Transactions**:
```sql
SELECT 
    merchant,
    amount,
    COUNT(*) as occurrences,
    AVG(EXTRACT(DAY FROM date) - LAG(EXTRACT(DAY FROM date)) 
        OVER (PARTITION BY merchant, amount ORDER BY date))::int as avg_days_between
FROM transactions
GROUP BY merchant, amount
HAVING COUNT(*) >= 3
ORDER BY occurrences DESC;
```

**Get Audit Trail for File**:
```sql
SELECT *
FROM audit_logs
WHERE entity_type = 'upload' AND entity_id = 5
ORDER BY created_at DESC;
```

---

## Performance Optimization

### Indexes

```sql
-- Transaction queries (most common)
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_upload_id ON transactions(upload_id);

-- Composite index for common filters
CREATE INDEX idx_transactions_date_category 
    ON transactions(date, category_id);

-- Upload queries
CREATE INDEX idx_uploads_status ON uploads(status);
CREATE INDEX idx_uploads_upload_date ON uploads(upload_date);

-- Audit queries
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Search queries
CREATE INDEX idx_transactions_merchant ON transactions(merchant);
CREATE INDEX idx_categories_name ON categories(name);
```

### Pre-computed Snapshots

Monthly snapshots are pre-calculated and stored to avoid expensive queries:

```python
# Computed when importing transactions
def compute_monthly_snapshot(year, month):
    transactions = get_transactions_for_month(year, month)
    
    snapshot = {
        'total_income': sum(t.amount for t in transactions if t.type == 'income'),
        'total_expense': sum(t.amount for t in transactions if t.type == 'expense'),
        'category_breakdown': {cat: amount for cat, amount in groupby_category(transactions)},
        # ...
    }
    
    db.create_or_update_snapshot(year, month, snapshot)
```

### Query Optimization Tips

1. Use date indexes for range queries
2. Pre-compute snapshots for common queries
3. Limit result sets with pagination
4. Use EXPLAIN to analyze slow queries
5. Archive old data (after 5+ years)

---

## Backup & Recovery

### Backup Strategy

```bash
# Daily backups
pg_dump finance_manager > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -Fc finance_manager > backup_$(date +%Y%m%d).dump

# With encryption
pg_dump finance_manager | gpg --symmetric > backup_$(date +%Y%m%d).sql.gpg
```

### Restore from Backup

```bash
# From text dump
psql finance_manager < backup_20240115.sql

# From binary dump
pg_restore -d finance_manager backup_20240115.dump
```

---

## Future Considerations

1. **Partitioning** - Partition transactions by date for large datasets
2. **Archiving** - Move old data to archive database
3. **Replication** - Setup master-replica for redundancy
4. **Sharding** - Horizontal scaling for multi-user (future)
5. **Data Encryption** - Encrypt sensitive columns at rest

---

**Refer to this schema when:**
- Adding new features
- Querying data
- Optimizing performance
- Writing tests
- Migrating data
