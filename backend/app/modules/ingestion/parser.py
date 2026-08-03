"""
Data Ingestion Module
Handles parsing and importing of bank statements from various file formats
"""

import pandas as pd
from abc import ABC, abstractmethod
from typing import List, Dict, Tuple
from datetime import datetime
import re
import logging

logger = logging.getLogger(__name__)


class Parser(ABC):
    """Abstract base class for file parsers"""
    
    @abstractmethod
    def parse(self, file_path: str) -> Tuple[List[Dict], List[str]]:
        """
        Parse file and extract transactions
        
        Args:
            file_path: Path to the file
        
        Returns:
            Tuple of (transactions list, errors list)
        """
        pass
    
    @abstractmethod
    def validate(self) -> bool:
        """Validate if file format is supported"""
        pass
    
    @staticmethod
    def normalize_transaction(row: Dict) -> Dict:
        """
        Normalize transaction data to standard format
        
        Args:
            row: Raw transaction row
        
        Returns:
            Normalized transaction dictionary
        """
        return {
            "date": row.get("date"),
            "amount": float(row.get("amount", 0)),
            "description": row.get("description", ""),
            "merchant": row.get("merchant"),
            "type": row.get("type", "expense").lower(),
            "tags": row.get("tags", "")
        }


class CSVParser(Parser):
    """Parser for CSV bank statements"""
    
    SUPPORTED_FORMATS = [
        # Common bank CSV formats
        {"date_col": "Date", "amount_col": "Amount", "desc_col": "Description"},
        {"date_col": "Transaction Date", "amount_col": "Debit", "desc_col": "Merchant"},
        {"date_col": "date", "amount_col": "amount", "desc_col": "description"},
    ]
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.df = None
    
    def validate(self) -> bool:
        """Check if file is a valid CSV"""
        try:
            self.df = pd.read_csv(self.file_path, nrows=5)
            return len(self.df) > 0
        except Exception as e:
            logger.error(f"CSV validation failed: {str(e)}")
            return False
    
    def parse(self, file_path: str) -> Tuple[List[Dict], List[str]]:
        """
        Parse CSV file
        
        Args:
            file_path: Path to CSV file
        
        Returns:
            Tuple of (transactions, errors)
        """
        transactions = []
        errors = []
        
        try:
            df = pd.read_csv(file_path)
            
            # Auto-detect column names
            columns = df.columns.tolist()
            date_col, amount_col, desc_col = self._detect_columns(columns)
            
            if not (date_col and amount_col and desc_col):
                errors.append("Could not auto-detect required columns (Date, Amount, Description)")
                logger.warning("Column auto-detection failed")
                return transactions, errors
            
            # Parse each row
            for idx, row in df.iterrows():
                try:
                    transaction = {
                        "date": pd.to_datetime(row[date_col]).date(),
                        "amount": float(row[amount_col]),
                        "description": str(row[desc_col]),
                        "merchant": str(row.get(desc_col, "")).split("-")[0].strip() if pd.notna(row.get(desc_col)) else None,
                        "type": "expense" if float(row[amount_col]) > 0 else "income"
                    }
                    transactions.append(transaction)
                
                except Exception as e:
                    errors.append(f"Row {idx + 2}: {str(e)}")
                    logger.warning(f"Error parsing row {idx + 2}: {str(e)}")
            
            logger.info(f"Parsed {len(transactions)} transactions from CSV")
        
        except Exception as e:
            errors.append(f"CSV parsing failed: {str(e)}")
            logger.error(f"CSV parsing error: {str(e)}")
        
        return transactions, errors
    
    @staticmethod
    def _detect_columns(columns: List[str]) -> Tuple[str, str, str]:
        """
        Auto-detect date, amount, and description columns
        
        Args:
            columns: List of column names
        
        Returns:
            Tuple of (date_col, amount_col, desc_col)
        """
        date_col = None
        amount_col = None
        desc_col = None
        
        columns_lower = [c.lower() for c in columns]
        
        # Detect date column
        date_keywords = ["date", "transaction date", "post date"]
        for keyword in date_keywords:
            if keyword in columns_lower:
                date_col = columns[columns_lower.index(keyword)]
                break
        
        # Detect amount column
        amount_keywords = ["amount", "debit", "credit", "value", "transaction amount"]
        for keyword in amount_keywords:
            if keyword in columns_lower:
                amount_col = columns[columns_lower.index(keyword)]
                break
        
        # Detect description column
        desc_keywords = ["description", "merchant", "particulars", "details", "narration"]
        for keyword in desc_keywords:
            if keyword in columns_lower:
                desc_col = columns[columns_lower.index(keyword)]
                break
        
        return date_col, amount_col, desc_col


class ExcelParser(Parser):
    """Parser for Excel bank statements"""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
    
    def validate(self) -> bool:
        """Check if file is a valid Excel"""
        try:
            pd.read_excel(self.file_path, nrows=1)
            return True
        except Exception as e:
            logger.error(f"Excel validation failed: {str(e)}")
            return False
    
    def parse(self, file_path: str) -> Tuple[List[Dict], List[str]]:
        """
        Parse Excel file
        
        Args:
            file_path: Path to Excel file
        
        Returns:
            Tuple of (transactions, errors)
        """
        transactions = []
        errors = []
        
        try:
            # Try to read Excel file
            xls = pd.ExcelFile(file_path)
            
            # Use first sheet
            sheet_name = xls.sheet_names[0]
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Auto-detect columns (reuse CSV logic)
            columns = df.columns.tolist()
            date_col, amount_col, desc_col = CSVParser._detect_columns(columns)
            
            if not (date_col and amount_col and desc_col):
                errors.append("Could not auto-detect required columns")
                return transactions, errors
            
            # Parse rows
            for idx, row in df.iterrows():
                try:
                    transaction = {
                        "date": pd.to_datetime(row[date_col]).date(),
                        "amount": float(row[amount_col]),
                        "description": str(row[desc_col]),
                        "merchant": str(row.get(desc_col, "")).split("-")[0].strip(),
                        "type": "expense" if float(row[amount_col]) > 0 else "income"
                    }
                    transactions.append(transaction)
                
                except Exception as e:
                    errors.append(f"Row {idx + 2}: {str(e)}")
            
            logger.info(f"Parsed {len(transactions)} transactions from Excel")
        
        except Exception as e:
            errors.append(f"Excel parsing failed: {str(e)}")
            logger.error(f"Excel parsing error: {str(e)}")
        
        return transactions, errors


class ParserFactory:
    """Factory for creating appropriate parser based on file type"""
    
    PARSERS = {
        "csv": CSVParser,
        "xlsx": ExcelParser,
        "xls": ExcelParser,
    }
    
    @staticmethod
    def create_parser(file_path: str) -> Parser:
        """
        Create parser for file type
        
        Args:
            file_path: Path to file
        
        Returns:
            Parser instance
        
        Raises:
            ValueError: If file type not supported
        """
        file_ext = file_path.split(".")[-1].lower()
        
        if file_ext not in ParserFactory.PARSERS:
            raise ValueError(f"Unsupported file type: {file_ext}")
        
        parser_class = ParserFactory.PARSERS[file_ext]
        return parser_class(file_path)
    
    @staticmethod
    def get_supported_formats() -> List[str]:
        """Get list of supported file formats"""
        return list(ParserFactory.PARSERS.keys())
