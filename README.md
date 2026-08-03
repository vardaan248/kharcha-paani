# Finance Manager Application

A personal finance management application that helps you track, analyze, and optimize your spending. Upload monthly bank statements, categorize transactions, and get actionable insights about your financial habits.

## 🎯 Features

### Core Features (MVP)
- **Bank Statement Import**: Upload CSV, Excel, or PDF bank statements
- **Smart Categorization**: Auto-categorize transactions with customizable rules
- **Dashboard**: Visual overview of spending with charts and statistics
- **Monthly & Yearly Analysis**: Compare spending patterns over time
- **Category Breakdown**: Detailed spending breakdown by category
- **Transaction Management**: View, search, filter, and manually edit transactions

### Security Features
- **Password-Protected Uploads**: Secure sensitive bank statements with passwords
- **File Encryption**: Encrypt uploaded statements for privacy
- **Audit Logging**: Track all access to sensitive files
- **Secure Storage**: Encrypted storage of financial data

### Advanced Features (Phase 2+)
- **Budget Tracking**: Set and monitor category budgets
- **Recurring Detection**: Automatically identify subscriptions
- **Spending Insights**: Smart recommendations based on your habits
- **Export Reports**: Generate PDF reports and statistics
- **Multiple Accounts**: Support for multiple bank accounts

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create Python virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Initialize database**
   ```bash
   python -c "from app.database import init_db; init_db()"
   ```

6. **Run the server**
   ```bash
   python -m app.main
   # Server will start at http://localhost:8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   # Application will be available at http://localhost:5173
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
finance-manager/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuration, logging
│   │   ├── models/         # Database models
│   │   ├── modules/        # Business logic
│   │   │   ├── ingestion/  # File parsing
│   │   │   ├── categorizer/# Smart categorization
│   │   │   ├── analytics/  # Analysis engine
│   │   │   └── security/   # Encryption & auth
│   │   ├── database/       # DB session management
│   │   └── main.py         # FastAPI app
│   ├── tests/              # Test suite
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── store/          # State management
│   │   └── config/         # App configuration
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
│
└── docs/
    ├── dev-docs/           # Technical documentation
    ├── user-manual/        # User guides
    └── README.md           # This file
```

## 🔒 Security Considerations

### Password Protection for Bank Statements
The application includes a dedicated security module for handling sensitive financial documents:

1. **File Encryption**: All uploaded statements can be encrypted using Fernet encryption
2. **Password Hashing**: Passwords are hashed using bcrypt (never stored in plain text)
3. **Access Logging**: Every access to encrypted files is logged for audit purposes
4. **Secure Storage**: Encrypted files are stored separately from parsed data

**Usage:**
```python
from app.modules.security import FileEncryptionManager

manager = FileEncryptionManager()
encrypted = manager.encrypt_file("statement.pdf", password="secure_password")
# Later...
decrypted = manager.decrypt_file(encrypted["encrypted_data"], "secure_password", encrypted["password_hash"])
```

### Database Security
- Use strong credentials in `.env`
- Never commit `.env` to version control
- Use HTTPS in production
- Implement authentication for API endpoints

## 📊 API Documentation

The backend provides a RESTful API with automatic documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### Key Endpoints

```
GET  /health                      # Health check
POST /uploads/file                # Upload bank statement
GET  /transactions                # List transactions
POST /transactions/{id}           # Update transaction
GET  /categories                  # List categories
POST /analytics/monthly/{y}/{m}   # Monthly summary
GET  /analytics/insights          # Smart insights
GET  /security/audit-logs         # Access logs
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest
pytest --cov=app         # With coverage
pytest -v               # Verbose output
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

## 📚 Documentation

- **[Developer Documentation](./docs/dev-docs/)** - Technical guides and API details
- **[User Manual](./docs/user-manual/)** - How to use the application
- **[Architecture Guide](./docs/dev-docs/architecture.md)** - System design details
- **[Security Guide](./docs/dev-docs/security.md)** - Security implementation details
- **[Database Schema](./docs/dev-docs/database.md)** - Database structure

## 🛠️ Development

### Tech Stack

**Backend:**
- FastAPI - Modern Python web framework
- SQLAlchemy - ORM for database operations
- PostgreSQL - Relational database
- Pandas - Data processing
- Cryptography - Encryption utilities

**Frontend:**
- React 18 - UI library
- Vite - Build tool
- Chart.js - Data visualization
- Zustand - State management
- Axios - HTTP client

### Code Style

- **Python**: Follow PEP 8 standards
- **JavaScript**: ESLint configuration provided
- **Commits**: Use conventional commit format

### Making Contributions

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 🤝 Extensibility

The application is designed with extensibility in mind:

### Adding New File Format Support
Implement a new parser class:
```python
from app.modules.ingestion import Parser

class MyBankParser(Parser):
    def parse(self, file_path):
        # Your implementation
        pass
    
    def validate(self):
        # Validation logic
        pass
```

### Adding New Categorization Rules
Create custom rules:
```python
from app.modules.categorizer import Rule

class CustomRule(Rule):
    def matches(self, transaction):
        # Your matching logic
        return condition
```

### Adding Analytics Features
Extend the analyzer:
```python
from app.modules.analytics import TransactionAnalyzer

class CustomAnalyzer(TransactionAnalyzer):
    def custom_analysis(self):
        # Your analysis
        pass
```

## 📝 License

Personal use only. See LICENSE file for details.

## 📞 Support

For issues, questions, or suggestions, please refer to the documentation in the `/docs` folder or check the application's help section.

## 🚧 Roadmap

### Phase 1 (Current)
- ✅ Basic file upload and parsing
- ✅ Transaction categorization
- ✅ Simple dashboard
- ✅ Security features

### Phase 2
- Budget tracking and alerts
- Recurring transaction detection
- PDF export reports
- Advanced analytics

### Phase 3
- Mobile app
- Real-time bank API integration
- Machine learning categorization
- Collaborative budgeting

---

**Built with ❤️ for personal financial management**
