# Security Guide

## Overview

This document details the security implementation of the Finance Manager application, focusing on protecting sensitive financial data.

## Table of Contents

1. [Threat Model](#threat-model)
2. [Data Protection](#data-protection)
3. [File Encryption](#file-encryption)
4. [Password Security](#password-security)
5. [Access Control](#access-control)
6. [Audit Logging](#audit-logging)
7. [Environment Security](#environment-security)
8. [Best Practices](#best-practices)
9. [Security Checklist](#security-checklist)

---

## Threat Model

### Identified Threats

| Threat | Impact | Mitigation |
|--------|--------|-----------|
| Unauthorized file access | High | Password + Encryption |
| Data breach in transit | High | HTTPS/TLS |
| Data breach at rest | High | Database + File encryption |
| SQL injection | Critical | Parameterized queries (SQLAlchemy) |
| Cross-site scripting (XSS) | High | Input validation, React escaping |
| CSRF attacks | Medium | CSRF tokens (future) |
| Weak passwords | Medium | Password hashing (bcrypt) |
| Accidental data exposure | Medium | Audit logging, access control |
| Malware in uploads | Medium | File validation, sandboxing |

### Attack Surface

1. **File Upload** - Malicious or oversized files
2. **API Endpoints** - Injection attacks, unauthorized access
3. **Database** - SQL injection, unauthorized queries
4. **Frontend** - XSS, CSRF
5. **Storage** - Unencrypted sensitive files
6. **Credentials** - Weak passwords, exposure

---

## Data Protection

### Data Classification

```
Classification | Sensitivity | Protection Level
────────────────────────────────────────────────
Public        | Low         | Basic validation
Internal      | Medium      | Validation + Logging
Confidential   | High        | Encryption + Auth
Secret        | Critical    | Double encryption + MFA*
```

*MFA coming in future

### Data at Rest

**Database:**
```python
# All sensitive data stored in PostgreSQL
# Connection: postgresql://user:password@host/db

# Field-level encryption for sensitive fields:
# - password_hash (bcrypt)
# - encryption_key (Fernet)
```

**File Storage:**
```python
# Uploaded statements can be encrypted
# Location: ./uploads/
# Encryption: Fernet symmetric encryption
# Key: Stored separately (app secret key)
```

### Data in Transit

1. **API Communication**
   - Enable HTTPS in production
   - Use TLS 1.2 or higher
   - Certificate pinning (future)

2. **Frontend-Backend**
   ```javascript
   // Ensure all API calls use HTTPS in production
   const API_BASE_URL = 'https://api.finance-manager.local'
   ```

3. **Database Connection**
   ```python
   # Use SSL for database connections
   DATABASE_URL = "postgresql://user:pass@host/db?sslmode=require"
   ```

---

## File Encryption

### Implementation

The application uses **Fernet (symmetric encryption)** for file protection:

```python
from cryptography.fernet import Fernet
from app.modules.security import FileEncryptionManager
```

### How It Works

```
1. Generate/load encryption key
2. Initialize Fernet cipher
3. Encrypt file data
4. Store encrypted blob + password hash
5. On access: verify password + decrypt
```

### Usage Example

```python
# Setup
from app.modules.security import FileEncryptionManager

manager = FileEncryptionManager(encryption_key="base64-key")

# Encrypt
result = manager.encrypt_file(
    file_path="statement.pdf",
    password="user_password"
)
# Result includes:
# - encrypted_data: Binary encrypted file
# - metadata: File information
# - password_hash: Hashed password for verification

# Decrypt
decrypted = manager.decrypt_file(
    encrypted_data=result['encrypted_data'],
    password="user_password",
    password_hash=result['password_hash']
)

# Now decrypted contains original file data
```

### Security Properties

| Property | Value |
|----------|-------|
| Algorithm | Fernet (AES-128-CBC) |
| Key Size | 256 bits |
| Timestamp | Included in token |
| HMAC | Yes (integrity verification) |
| Reproducible | No (good for security) |

### Encryption Key Management

```python
# .env configuration
ENCRYPTION_KEY=<base64-encoded-256-bit-key>

# Generation (one-time)
from cryptography.fernet import Fernet
key = Fernet.generate_key()  # Returns bytes
encoded_key = key.decode()   # Encode as string for .env

# Never:
# ❌ Hardcode in source code
# ❌ Commit to git
# ❌ Share via email
# ❌ Log or print

# Do:
# ✅ Store in .env file
# ✅ Use environment variable in production
# ✅ Rotate periodically (quarterly+)
# ✅ Keep separate backup
```

---

## Password Security

### Password Hashing

Uses **bcrypt** with 12 rounds:

```python
from app.modules.security import PasswordManager

# Hash password
password = "user_password"
hashed = PasswordManager.create_password_hash(password)
# Result: $2b$12$... (60 characters)

# Verify password
is_valid = PasswordManager.verify_password(password, hashed)
# Returns: True or False
```

### Why Bcrypt?

| Aspect | Value |
|--------|-------|
| Algorithm | bcrypt |
| Rounds | 12 |
| Salt | Automatic |
| Time | ~0.3 seconds per hash |
| Resistant to | Rainbow tables, GPU attacks |

### Password Storage

```python
# NEVER store plain text
❌ password_plain = "user_password"  # DON'T DO THIS!

# ALWAYS hash
✅ password_hash = PasswordManager.create_password_hash(password_plain)
✅ db.password_hash = password_hash  # Store hash only
```

### Database Storage

```sql
-- Upload table with password protection
CREATE TABLE uploads (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255),
    password_protected BOOLEAN,
    password_hash VARCHAR(60),  -- Bcrypt hash (always 60 chars)
    -- ... other fields
);
```

### For Users

**Strong Password Guidelines:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Avoid common words, patterns
- Different password for each service

Example strong password:
```
✅ Tr0pic@l!Sunset#2024
✅ MyBank$tatement@2024
✅ P@ssw0rd!Finance+Secure
```

Example weak passwords:
```
❌ password
❌ 123456
❌ banker2024
❌ statement
```

---

## Access Control

### Audit Logging

Every sensitive operation is logged:

```python
from app.modules.security import FileAccessLog

# Log access
FileAccessLog.log_access(
    file_name="statement.pdf",
    action="decrypt",
    success=True,
    user_id="user_123"
)

# Log structure
{
    "timestamp": "2024-01-15T10:30:00",
    "file_name": "statement.pdf",
    "action": "decrypt",
    "success": True,
    "error": None,
    "user_id": "user_123"
}

# Retrieve logs
logs = FileAccessLog.get_logs(file_name="statement.pdf", days=30)

# Example log entries:
# - file_name="statement.pdf", action="upload"
# - file_name="statement.pdf", action="encrypt"
# - file_name="statement.pdf", action="decrypt", success=True
# - file_name="statement.pdf", action="decrypt", success=False, error="Incorrect password"
```

### Logged Actions

| Action | Details |
|--------|---------|
| upload | File uploaded, metadata |
| encrypt | File encrypted with password |
| decrypt_success | File successfully decrypted |
| decrypt_fail | Failed decryption attempt (wrong password) |
| download | File accessed/downloaded |
| delete | File deleted |
| share | File shared with user |

### Review Audit Logs

```bash
# In application
Settings → Security → Audit Log

# Via API (to be implemented)
GET /api/security/audit-logs?file_name=statement.pdf&days=30
```

---

## Environment Security

### Configuration Files

```python
# ❌ DON'T COMMIT to git
.env
.env.local
.env.production

# ✅ DO COMMIT template
.env.example
```

### .env Template

```bash
# .env.example (safe to commit)
DATABASE_URL=postgresql://user:password@localhost:5432/finance_manager
SECRET_KEY=your-secret-key-change-this-in-production
ENCRYPTION_KEY=your-encryption-key-change-this-in-production
ENVIRONMENT=development
```

### Production Setup

```bash
# .env (never commit!)
DATABASE_URL=postgresql://prod_user:strong_password@prod_server:5432/finance_manager
SECRET_KEY=<generate-strong-random-key>
ENCRYPTION_KEY=<generate-strong-random-key>
ENVIRONMENT=production
CORS_ORIGINS=["https://finance.example.com"]
```

### Key Generation

```python
# Generate strong secrets
import secrets
import base64

# 32 bytes = 256 bits
secret_key = secrets.token_urlsafe(32)
# Output: "0aB_1cD2eF3gH4iJ5kL6mN7oP8qR9sT"

# Generate encryption key (Fernet format)
from cryptography.fernet import Fernet
encryption_key = Fernet.generate_key()
# Output: "b'yRe0..."
```

---

## Best Practices

### 1. Secrets Management

```bash
# ✅ Use environment variables
export SECRET_KEY="your-secret"
export DATABASE_URL="..."

# ✅ Use .env file (development only)
source .env

# ✅ Use secrets manager (production)
# - AWS Secrets Manager
# - HashiCorp Vault
# - Azure Key Vault
```

### 2. Input Validation

```python
# ✅ Always validate input
if not file_path.endswith(('.csv', '.xlsx')):
    raise ValueError("Invalid file type")

if file_size > settings.max_upload_size_bytes:
    raise ValueError("File too large")

# ✅ Sanitize user input
import bleach
clean_description = bleach.clean(user_input)
```

### 3. SQL Injection Prevention

```python
# ❌ VULNERABLE - String concatenation
query = f"SELECT * FROM transactions WHERE id = {user_id}"

# ✅ SAFE - Parameterized query (SQLAlchemy handles this)
transaction = db.query(Transaction).filter(Transaction.id == user_id).first()
```

### 4. XSS Prevention

```python
# React automatically escapes output
// ✅ Safe - React escapes by default
<div>{user_input}</div>

// ❌ Dangerous - Using dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{__html: user_input}} />
```

### 5. CORS Configuration

```python
# app/core/config.py
CORS_ORIGINS = [
    "http://localhost:3000",      # Development
    "http://localhost:5173",      # Vite dev
    "https://finance.example.com" # Production
]

# ✅ Whitelist known origins
# ✅ Disable in development if needed
# ✅ Update for new environments
```

### 6. Error Handling

```python
# ❌ Exposes system details
@app.get("/items")
def read_item(item_id: int):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise Exception(f"Database error: Item {item_id} not found in table 'items'")

# ✅ Generic error message
@app.get("/items")
def read_item(item_id: int):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
```

---

## Security Checklist

### Development

- [ ] Never commit `.env` to git
- [ ] Use strong passwords (12+ chars, mixed case, symbols)
- [ ] Validate all user inputs
- [ ] Use parameterized queries (SQLAlchemy ORM)
- [ ] Encrypt sensitive files
- [ ] Hash passwords with bcrypt
- [ ] Log sensitive actions
- [ ] Sanitize error messages
- [ ] Enable CORS only for known origins
- [ ] Use HTTPS in production

### Deployment

- [ ] Generate new SECRET_KEY and ENCRYPTION_KEY
- [ ] Set ENVIRONMENT=production
- [ ] Enable database SSL connection
- [ ] Configure CORS_ORIGINS for production domain
- [ ] Use strong database password
- [ ] Enable database backups
- [ ] Set up log aggregation
- [ ] Monitor access logs
- [ ] Regular security updates
- [ ] Penetration testing

### Operations

- [ ] Review audit logs monthly
- [ ] Rotate encryption keys quarterly
- [ ] Update dependencies regularly
- [ ] Monitor for suspicious activities
- [ ] Test disaster recovery procedures
- [ ] Maintain security documentation
- [ ] Conduct security training
- [ ] Implement rate limiting (future)
- [ ] Add 2FA for admin access (future)
- [ ] Regular backups tested

---

## Future Security Enhancements

1. **Authentication**
   - User login system
   - JWT tokens
   - Password recovery
   - 2FA/MFA

2. **Authorization**
   - Role-based access control (RBAC)
   - Permissions system
   - Multi-user support

3. **Advanced Encryption**
   - Field-level encryption
   - Homomorphic encryption (for analytics on encrypted data)
   - Key rotation

4. **Threat Detection**
   - Anomaly detection
   - Rate limiting
   - DDoS protection
   - Bot detection

5. **Compliance**
   - PCI DSS (if handling cards)
   - GDPR compliance
   - Data retention policies
   - Encryption standards

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Fernet Encryption](https://cryptography.io/en/latest/fernet/)
- [Bcrypt Password Hashing](https://pypi.org/project/bcrypt/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [SQLAlchemy Security](https://docs.sqlalchemy.org/en/20/)

---

**Security is not a feature, it's a responsibility. Review this guide regularly and stay updated on security best practices.**
