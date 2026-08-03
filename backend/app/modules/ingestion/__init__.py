"""Ingestion module"""

from .parser import Parser, CSVParser, ExcelParser, ParserFactory

__all__ = ["Parser", "CSVParser", "ExcelParser", "ParserFactory"]
