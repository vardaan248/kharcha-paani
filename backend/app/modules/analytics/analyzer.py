"""
Analytics Module
Provides spending analysis, insights, and statistics using Beanie ODM (MongoDB)
All methods are async — call with `await`.
"""

from app.models import Transaction, TransactionType
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
import statistics
import logging

logger = logging.getLogger(__name__)


class TransactionAnalyzer:
    """Analyzes transactions and provides insights. No DB session required."""

    # ── Monthly & yearly summaries ────────────────────────────────────────────

    async def get_monthly_summary(self, year: int, month: int) -> Dict[str, Any]:
        """Summary for a specific month."""
        month_start = date(year, month, 1)
        month_end = (
            date(year + 1, 1, 1) - timedelta(days=1)
            if month == 12
            else date(year, month + 1, 1) - timedelta(days=1)
        )

        transactions = await Transaction.find(
            Transaction.date >= month_start,
            Transaction.date <= month_end,
        ).to_list()

        income  = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
        expense = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)

        return {
            "year":  year,
            "month": month,
            "period": f"{year}-{month:02d}",
            "total_income":      round(income, 2),
            "total_expense":     round(expense, 2),
            "net_cash_flow":     round(income - expense, 2),
            "transaction_count": len(transactions),
            "category_breakdown": self._category_breakdown(transactions),
            "largest_transaction": self._largest(transactions),
            "average_transaction": (
                round(sum(t.amount for t in transactions) / len(transactions), 2)
                if transactions else 0
            ),
        }

    async def get_yearly_summary(self, year: int) -> Dict[str, Any]:
        """Summary for a full year with per-month breakdown."""
        year_start, year_end = date(year, 1, 1), date(year, 12, 31)

        transactions = await Transaction.find(
            Transaction.date >= year_start,
            Transaction.date <= year_end,
        ).to_list()

        income  = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
        expense = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)

        # Build month-by-month breakdown using only fetched data (no extra queries)
        monthly: Dict[str, Dict] = {}
        for m in range(1, 13):
            m_key = f"{m:02d}"
            m_txns = [t for t in transactions if t.date.month == m]
            m_income  = sum(t.amount for t in m_txns if t.type == TransactionType.INCOME)
            m_expense = sum(t.amount for t in m_txns if t.type == TransactionType.EXPENSE)
            monthly[m_key] = {"income": m_income, "expense": m_expense, "net": m_income - m_expense}

        return {
            "year":  year,
            "total_income":            round(income, 2),
            "total_expense":           round(expense, 2),
            "net_cash_flow":           round(income - expense, 2),
            "transaction_count":       len(transactions),
            "monthly_breakdown":       monthly,
            "average_monthly_expense": round(expense / 12, 2),
        }

    # ── Category trends ───────────────────────────────────────────────────────

    async def get_category_trends(self, category_name: str, months: int = 6) -> Dict[str, Any]:
        """Month-over-month spending trend for one category."""
        start_date = date.today() - timedelta(days=30 * months)

        transactions = await Transaction.find(
            Transaction.category == category_name,
            Transaction.date >= start_date,
        ).to_list()

        monthly_totals: Dict[str, float] = {}
        for t in transactions:
            key = f"{t.date.year}-{t.date.month:02d}"
            monthly_totals[key] = monthly_totals.get(key, 0) + t.amount

        average = statistics.mean(monthly_totals.values()) if monthly_totals else 0

        return {
            "category":       category_name,
            "months":         months,
            "monthly_totals": monthly_totals,
            "average":        round(average, 2),
            "highest_month":  max(monthly_totals.items(), key=lambda x: x[1]) if monthly_totals else None,
            "lowest_month":   min(monthly_totals.items(), key=lambda x: x[1]) if monthly_totals else None,
        }

    # ── Recurring detection ───────────────────────────────────────────────────

    async def detect_recurring_transactions(self, min_occurrences: int = 3) -> List[Dict]:
        """Detect transactions that repeat on a roughly monthly cycle."""
        all_txns = await Transaction.find_all().to_list()

        groups: Dict[tuple, list] = {}
        for t in all_txns:
            key = (t.merchant, round(t.amount, 2))
            groups.setdefault(key, []).append(t)

        recurring = []
        for (merchant, amount), txns in groups.items():
            if len(txns) < min_occurrences:
                continue
            dates = sorted(t.date for t in txns)
            if len(dates) < 2:
                continue
            intervals = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]
            avg_interval = statistics.mean(intervals)
            if 25 <= avg_interval <= 35:
                recurring.append({
                    "merchant":              merchant,
                    "amount":                amount,
                    "occurrences":           len(txns),
                    "average_interval_days": round(avg_interval, 1),
                    "last_transaction":      str(dates[-1]),
                })

        return recurring

    # ── Smart insights ────────────────────────────────────────────────────────

    async def get_spending_insights(self) -> List[Dict[str, str]]:
        """Generate actionable insights based on current vs previous month."""
        insights = []
        today = date.today()

        current = await self.get_monthly_summary(today.year, today.month)
        prev_month = today.month - 1 or 12
        prev_year  = today.year if today.month > 1 else today.year - 1
        previous   = await self.get_monthly_summary(prev_year, prev_month)

        cur_exp  = current["total_expense"]
        prev_exp = previous["total_expense"]

        if prev_exp and cur_exp > prev_exp * 1.2:
            pct = ((cur_exp - prev_exp) / prev_exp) * 100
            insights.append({
                "type":       "warning",
                "message":    f"⚠️ Spending up {pct:.1f}% vs last month",
                "suggestion": "Review your transactions and identify areas to cut back",
            })
        elif prev_exp and cur_exp < prev_exp * 0.9:
            pct = ((prev_exp - cur_exp) / prev_exp) * 100
            insights.append({
                "type":       "success",
                "message":    f"✅ Great job! Spending down {pct:.1f}% vs last month",
                "suggestion": "Keep it up — consider saving the difference",
            })

        if current["category_breakdown"]:
            top_cat, top_amt = max(current["category_breakdown"].items(), key=lambda x: x[1])
            insights.append({
                "type":       "info",
                "message":    f"💰 Top spending: {top_cat} (₹{top_amt:.2f})",
                "suggestion": "Consider setting a budget for this category",
            })

        recurring = await self.detect_recurring_transactions()
        if recurring:
            total_recurring = sum(r["amount"] for r in recurring)
            insights.append({
                "type":       "info",
                "message":    f"🔄 Recurring expenses: ₹{total_recurring:.2f}/month ({len(recurring)} items)",
                "suggestion": "Review your subscriptions — cancel any you no longer use",
            })

        return insights

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _category_breakdown(transactions: list) -> Dict[str, float]:
        breakdown: Dict[str, float] = {}
        for t in transactions:
            if t.type == TransactionType.EXPENSE:
                breakdown[t.category] = round(breakdown.get(t.category, 0) + t.amount, 2)
        return breakdown

    @staticmethod
    def _largest(transactions: list) -> Optional[Dict[str, Any]]:
        if not transactions:
            return None
        t = max(transactions, key=lambda x: abs(x.amount))
        return {"date": str(t.date), "amount": t.amount, "description": t.description}
