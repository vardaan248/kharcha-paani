# Documentation Index

Welcome to the Finance Manager Documentation! Here's a guide to all available resources.

## 📖 Documentation Structure

```
docs/
├── dev-docs/
│   ├── DEVELOPER_GUIDE.md      # Complete development guide
│   ├── ARCHITECTURE.md          # System architecture and design patterns
│   ├── SECURITY.md              # Security implementation details
│   ├── DATABASE.md              # Database schema and queries
│   └── API.md                   # API documentation (coming soon)
│
├── user-manual/
│   ├── USER_GUIDE.md            # Complete user manual
│   ├── FAQ.md                   # Frequently asked questions
│   └── TROUBLESHOOTING.md       # Common issues and solutions
│
└── INDEX.md                     # This file
```

## 🚀 Getting Started

**New to the project?** Start here:

1. **[Quick Start Guide](../QUICKSTART.md)** (5 minutes)
   - Installation steps
   - Running the application
   - First upload

2. **[Main README](../README.md)** (10 minutes)
   - Project overview
   - Features list
   - Tech stack
   - API documentation

## 👨‍💻 For Developers

**Building features or fixing bugs?** These guides will help:

### Core Documentation

1. **[Developer Guide](./dev-docs/DEVELOPER_GUIDE.md)** - START HERE
   - Project structure
   - Backend development
   - Frontend development
   - Database queries
   - Testing
   - Deployment

2. **[Architecture Guide](./dev-docs/ARCHITECTURE.md)**
   - System overview
   - Component design
   - Data flows
   - Design patterns
   - Scalability

3. **[Database Schema](./dev-docs/DATABASE.md)**
   - Table definitions
   - Entity relationships
   - Indexes
   - Common queries
   - Performance tips

4. **[Security Guide](./dev-docs/SECURITY.md)**
   - Security implementation
   - File encryption
   - Password management
   - Access control
   - Best practices

### Topic-Specific Guides

**Ingestion Module** (File Upload & Parsing)
- See: [DEVELOPER_GUIDE.md](./dev-docs/DEVELOPER_GUIDE.md#backend-development) → Key Files → app/modules/ingestion/parser.py

**Categorizer Module** (Smart Categorization)
- See: [DEVELOPER_GUIDE.md](./dev-docs/DEVELOPER_GUIDE.md#backend-development) → Key Files → app/modules/categorizer/engine.py

**Analytics Module** (Insights & Reporting)
- See: [DEVELOPER_GUIDE.md](./dev-docs/DEVELOPER_GUIDE.md#backend-development) → Key Files → app/modules/analytics/analyzer.py

**Security Module** (Encryption & Access)
- See: [SECURITY.md](./dev-docs/SECURITY.md) and [DEVELOPER_GUIDE.md](./dev-docs/DEVELOPER_GUIDE.md) → Security

## 👤 For Users

**Using the application?** These guides will help:

1. **[User Guide](./user-manual/USER_GUIDE.md)** - START HERE
   - Dashboard overview
   - Uploading statements
   - Managing transactions
   - Categories and budgets
   - Analytics
   - Security features
   - Tips and tricks

2. **[FAQ](./user-manual/FAQ.md)** (Coming Soon)
   - Common questions
   - Troubleshooting
   - Best practices

## 🔍 Quick Reference

### Common Tasks

**I want to...**

- **Upload a bank statement**
  → [User Guide: Uploading Bank Statements](./user-manual/USER_GUIDE.md#uploading-bank-statements)

- **Categorize transactions**
  → [User Guide: Managing Transactions](./user-manual/USER_GUIDE.md#managing-transactions)

- **View analytics**
  → [User Guide: Analytics and Insights](./user-manual/USER_GUIDE.md#analytics-and-insights)

- **Set up security**
  → [User Guide: Security Features](./user-manual/USER_GUIDE.md#security-features) or [Security Guide](./dev-docs/SECURITY.md)

- **Add a new feature**
  → [Developer Guide](./dev-docs/DEVELOPER_GUIDE.md) → corresponding module

- **Debug an issue**
  → [Developer Guide: Troubleshooting](./dev-docs/DEVELOPER_GUIDE.md#troubleshooting)

- **Optimize performance**
  → [Database Schema: Performance](./dev-docs/DATABASE.md#performance-optimization)

- **Deploy to production**
  → [Developer Guide: Deployment](./dev-docs/DEVELOPER_GUIDE.md#deployment)

- **Understand the architecture**
  → [Architecture Guide](./dev-docs/ARCHITECTURE.md)

## 📚 Documentation by Topic

### Security & Privacy

- [Security Guide](./dev-docs/SECURITY.md) - Complete security documentation
- [Password Management](./dev-docs/SECURITY.md#password-security)
- [File Encryption](./dev-docs/SECURITY.md#file-encryption)
- [User Guide: Security Features](./user-manual/USER_GUIDE.md#security-features)

### Data & Analytics

- [Database Schema](./dev-docs/DATABASE.md)
- [Analytics Module](./dev-docs/DEVELOPER_GUIDE.md#backend-development) in Developer Guide
- [User Guide: Analytics](./user-manual/USER_GUIDE.md#analytics-and-insights)

### Development

- [Developer Guide](./dev-docs/DEVELOPER_GUIDE.md)
- [Architecture Guide](./dev-docs/ARCHITECTURE.md)
- [Backend Setup](./dev-docs/DEVELOPER_GUIDE.md#setting-up-development-environment)
- [Frontend Setup](./dev-docs/DEVELOPER_GUIDE.md#frontend-development)
- [Testing](./dev-docs/DEVELOPER_GUIDE.md#testing)

### Deployment

- [Deployment Guide](./dev-docs/DEVELOPER_GUIDE.md#deployment)
- [Production Checklist](./dev-docs/SECURITY.md#security-checklist)
- [Environment Security](./dev-docs/SECURITY.md#environment-security)

## 🔄 Workflow Examples

### Uploading and Analyzing Transactions

```
1. User Guide: Uploading Bank Statements
   ↓
2. User Guide: Managing Transactions
   ↓
3. User Guide: Analytics and Insights
   ↓
4. Done! Check recommendations
```

### Adding New File Format Support

```
1. Architecture Guide: Extension Points
   ↓
2. Developer Guide: Adding a New API Endpoint
   ↓
3. Implement Parser in app/modules/ingestion/
   ↓
4. Add Tests
   ↓
5. Update Documentation
```

### Troubleshooting Issues

```
1. Check User Guide: FAQ (when available)
   ↓
2. Check Developer Guide: Troubleshooting
   ↓
3. Check Browser Console (F12)
   ↓
4. Check Backend Logs (./logs/app.log)
   ↓
5. Report Issue with Details
```

## 📋 Documentation Checklist

### For Each Feature
- [ ] User manual section
- [ ] Developer guide section
- [ ] API documentation
- [ ] Code comments
- [ ] Architecture diagram
- [ ] Example usage

### For Each Module
- [ ] Module overview
- [ ] Key components
- [ ] Usage examples
- [ ] Extension points
- [ ] Performance considerations
- [ ] Security implications

## 🔗 Related Documentation

### External Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Cryptography Library](https://cryptography.io/)

### Project Files

- [README.md](../README.md) - Main project README
- [QUICKSTART.md](../QUICKSTART.md) - Quick start guide
- [backend/requirements.txt](../backend/requirements.txt) - Python dependencies
- [frontend/package.json](../frontend/package.json) - Node dependencies

## 📝 Contributing to Documentation

### How to Update Documentation

1. Identify the appropriate file
2. Make changes following the structure
3. Use clear headings and examples
4. Keep technical terms explained
5. Add links to related sections
6. Test links work correctly

### Documentation Standards

- Use Markdown format
- Use clear, active voice
- Provide code examples
- Include diagrams where helpful
- Keep it up-to-date with code changes
- Include both user and developer perspectives

## 🚀 What's Next?

### For Users
1. Start with [Quick Start Guide](../QUICKSTART.md)
2. Read [User Manual](./user-manual/USER_GUIDE.md)
3. Explore the application
4. Check [FAQ](./user-manual/FAQ.md) for common questions

### For Developers
1. Start with [Developer Guide](./dev-docs/DEVELOPER_GUIDE.md)
2. Read [Architecture Guide](./dev-docs/ARCHITECTURE.md)
3. Review [Database Schema](./dev-docs/DATABASE.md)
4. Check [Security Guide](./dev-docs/SECURITY.md)
5. Start contributing!

### For Project Leads
1. Review [Architecture](./dev-docs/ARCHITECTURE.md)
2. Understand [Security Implementation](./dev-docs/SECURITY.md)
3. Check [Deployment Guide](./dev-docs/DEVELOPER_GUIDE.md#deployment)
4. Review [Database Schema](./dev-docs/DATABASE.md)

---

## 📞 Support

If you can't find what you're looking for:

1. **Check the Table of Contents** in each document
2. **Use search** (Ctrl+F) within documents
3. **Review code comments** in the source code
4. **Check the main README** for overview

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
**Status**: Complete

*This documentation is a living document. Please keep it updated as the project evolves.*
