"""
Database models for the PMO Agent application.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, Integer, String, Text, JSON

from database import Base


class AnalysisHistory(Base):
    """
    Stores history of all file analysis operations.
    Tracks filenames, analysis dates, and discovered discrepancies.
    """

    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    excel_filename = Column(String(255), nullable=False)
    pptx_filename = Column(String(255), nullable=False)
    analysis_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    discrepancies_summary = Column(Text, nullable=True)
    discrepancies_json = Column(JSON, nullable=True)
    status = Column(String(50), default="completed", nullable=False)

    def __repr__(self) -> str:
        return f"<AnalysisHistory(id={self.id}, excel='{self.excel_filename}', date={self.analysis_date})>"


class PriorityHistory(Base):
    """
    Stores history of batch priority analysis operations.
    Tracks filename, analysis date, and full project results.
    """

    __tablename__ = "priority_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    analysis_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    total_projects = Column(Integer, nullable=False)
    results_json = Column(JSON, nullable=False)
    status = Column(String(50), default="completed", nullable=False)

    def __repr__(self) -> str:
        return f"<PriorityHistory(id={self.id}, file='{self.filename}', projects={self.total_projects})>"
