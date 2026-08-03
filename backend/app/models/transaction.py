"""
Database models for Finance Manager
Uses Beanie ODM (MongoDB) - no schema migrations, collections created automatically
"""

from beanie import Document
from pydantic import Field
from datetime import date, datetime
from typing import Optional, List
from enum import Enum


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


class Transaction(Document):
    """Represents a single financial transaction"""

    date: date
    amount: float
    description: str
    merchant: Optional[str] = None
    category: str = "Other"
    type: TransactionType = TransactionType.EXPENSE
    tags: List[str] = []
    notes: Optional[str] = None
    categorization_confidence: float = 1.0  # 0-1, ready for future ML
    is_recurring: bool = False
    upload_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "transactions"


class Category(Document):
    """Spending/income category with matching rules for auto-categorization"""

    name: str
    description: Optional[str] = None
    budget_limit: Optional[float] = None
    color: str = "#3498db"
    icon: Optional[str] = None
    is_system: bool = False
    matching_keywords: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "categories"


class Upload(Document):
    """Tracks uploaded bank statement files"""

    filename: str
    original_filename: str
    file_type: str
    file_size: int
    transaction_count: int = 0
    encrypted: bool = False
    password_protected: bool = False
    password_hash: Optional[str] = None
    status: str = "pending"
    error_message: Optional[str] = None
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    processed_date: Optional[datetime] = None

    class Settings:
        name = "uploads"


class MonthlySnapshot(Document):
    """Pre-calculated monthly statistics for fast dashboard loads"""

    year: int
    month: int
    total_income: float = 0
    total_expense: float = 0
    net_cash_flow: float = 0
    transaction_count: int = 0
    top_category: Optional[str] = None
    top_category_amount: Optional[float] = None
    snapshot_data: dict = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "monthly_snapshots"


class UserPreference(Document):
    """User settings and preferences"""

    preference_key: str
    preference_value: str
    data_type: str = "string"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "user_preferences"


class AuditLog(Document):
    """Audit trail for sensitive operations"""

    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[dict] = None
    success: bool = True
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "audit_logs"


# All document models — passed to Beanie on startup
ALL_MODELS = [
    Transaction,
    Category,
    Upload,
    MonthlySnapshot,
    UserPreference,
    AuditLog,
]
