"""
Categorization Module
Smart categorization of transactions with rule-based engine
Uses Beanie ODM — no DB session needed, works directly with Category documents
"""

import re
from typing import Dict, Optional, List, Tuple
from app.models import Category
import logging

logger = logging.getLogger(__name__)


class Rule:
    """Base class for categorization rules"""

    def __init__(self, rule_type: str, value: str, category: str):
        self.rule_type = rule_type
        self.value = value
        self.category = category

    def matches(self, transaction: Dict) -> bool:
        raise NotImplementedError


class KeywordRule(Rule):
    def matches(self, transaction: Dict) -> bool:
        description = transaction.get("description", "").lower()
        merchant = (transaction.get("merchant") or "").lower()
        keyword = self.value.lower()
        return keyword in description or keyword in merchant


class RegexRule(Rule):
    def matches(self, transaction: Dict) -> bool:
        description = transaction.get("description", "")
        try:
            return bool(re.search(self.value, description, re.IGNORECASE))
        except re.error:
            logger.warning(f"Invalid regex pattern: {self.value}")
            return False


class AmountRule(Rule):
    def matches(self, transaction: Dict) -> bool:
        try:
            amount = float(transaction.get("amount", 0))
            if self.value.startswith(">"):
                return amount > float(self.value[1:])
            elif self.value.startswith("<"):
                return amount < float(self.value[1:])
            else:
                parts = self.value.split("-")
                min_val = float(parts[0])
                max_val = float(parts[1]) if len(parts) > 1 else float("inf")
                return min_val <= amount <= max_val
        except (ValueError, IndexError):
            return False


class RuleEngine:
    """
    Transaction categorization engine.
    Call `await RuleEngine.create()` to get an instance with rules loaded from DB.
    """

    def __init__(self, rules: List[Rule]):
        self.rules = rules

    @classmethod
    async def create(cls) -> "RuleEngine":
        """
        Factory method — loads categories + keywords from MongoDB and builds rules.
        Usage: engine = await RuleEngine.create()
        """
        rules: List[Rule] = []
        categories = await Category.find_all().to_list()

        for category in categories:
            for keyword in category.matching_keywords:
                rules.append(
                    KeywordRule(
                        rule_type="keyword",
                        value=keyword,
                        category=category.name,
                    )
                )

        logger.info(f"Loaded {len(rules)} categorization rules from {len(categories)} categories")
        return cls(rules)

    def categorize(self, transaction: Dict) -> Tuple[str, float]:
        """
        Match a transaction against loaded rules.

        Returns:
            (category_name, confidence_score)  — confidence 0.95 for rule match, 0.5 for default
        """
        for rule in self.rules:
            if rule.matches(transaction):
                logger.debug(f"Matched rule '{rule.value}' → {rule.category}")
                return rule.category, 0.95

        return "Other", 0.5

    def batch_categorize(self, transactions: List[Dict]) -> List[Tuple[str, float]]:
        """Categorize a list of transactions in one pass."""
        return [self.categorize(t) for t in transactions]
