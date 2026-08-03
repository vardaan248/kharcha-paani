"""
MongoDB Connection and Initialisation
Uses Motor (async driver) + Beanie ODM — no sessions, no migrations.
Collections are created automatically on first use.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models import ALL_MODELS, Category
import logging

logger = logging.getLogger(__name__)

_motor_client: AsyncIOMotorClient | None = None


async def connect_to_mongo() -> None:
    """Open the Motor connection and initialise Beanie document models."""
    global _motor_client
    _motor_client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=_motor_client[settings.mongodb_db_name],
        document_models=ALL_MODELS,
    )
    logger.info(
        f"Connected to MongoDB: {settings.mongodb_url} / {settings.mongodb_db_name}"
    )


async def close_mongo_connection() -> None:
    """Close the Motor connection on app shutdown."""
    global _motor_client
    if _motor_client:
        _motor_client.close()
        logger.info("MongoDB connection closed")


async def init_default_categories() -> None:
    """
    Seed the categories collection with default values on first run.
    Skipped if system categories already exist.
    """
    existing = await Category.find_one(Category.is_system == True)
    if existing:
        return

    defaults = [
        Category(name="Groceries",       is_system=True, color="#E74C3C", icon="🛒",
                 matching_keywords=["grocery","supermarket","whole foods","walmart","kirana"]),
        Category(name="Utilities",        is_system=True, color="#3498DB", icon="💡",
                 matching_keywords=["electricity","water","gas bill","internet","phone bill"]),
        Category(name="Transportation",   is_system=True, color="#F39C12", icon="🚗",
                 matching_keywords=["petrol","fuel","parking","toll","metro","uber","ola","rapido"]),
        Category(name="Entertainment",    is_system=True, color="#9B59B6", icon="🎮",
                 matching_keywords=["movie","cinema","netflix","spotify","hotstar","prime"]),
        Category(name="Healthcare",       is_system=True, color="#E91E63", icon="💊",
                 matching_keywords=["pharmacy","hospital","clinic","doctor","medical","apollo"]),
        Category(name="Housing",          is_system=True, color="#2ECC71", icon="🏠",
                 matching_keywords=["rent","maintenance","society","repair"]),
        Category(name="Dining",           is_system=True, color="#E67E22", icon="🍽️",
                 matching_keywords=["restaurant","swiggy","zomato","cafe","pizza","biryani"]),
        Category(name="Shopping",         is_system=True, color="#1ABC9C", icon="🛍️",
                 matching_keywords=["amazon","flipkart","myntra","mall","clothing"]),
        Category(name="Subscriptions",    is_system=True, color="#95A5A6", icon="📱",
                 matching_keywords=["subscription","membership","renewal","premium"]),
        Category(name="Other",            is_system=True, color="#7F8C8D", icon="📌",
                 matching_keywords=[]),
    ]

    await Category.insert_many(defaults)
    logger.info(f"Seeded {len(defaults)} default categories")


# ── kept for backward compatibility in any future API endpoints ──────────────
async def get_db():
    """Placeholder — not needed with Beanie, but kept for API consistency."""
    return None
