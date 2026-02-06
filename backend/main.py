"""
FastAPI application for PMO Agent.
Provides endpoints for file analysis and project prioritization.
"""

# Vercel serverless fix: add backend directory to Python path
import sys
import os
from pathlib import Path

# Add the backend directory to sys.path for Vercel compatibility
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db, init_db
from models import AnalysisHistory, PriorityHistory
from services import (
    AIAnalysisError,
    FileParsingError,
    analyze_with_groq,
    calculate_priority_score,
    extract_pptx_text,
    parse_excel,
    process_excel_batch,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


app = FastAPI(
    title="PMO Agent API",
    description="Corporate Data Integrity & Prioritization Agent",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for Vite frontend (local and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PriorityRequest(BaseModel):
    """Request model for project prioritization."""
    roi: float = Field(..., ge=0, le=100, description="Return on Investment (0-100)")
    urgency: float = Field(..., ge=0, le=100, description="Urgency level (0-100)")
    risk: float = Field(..., ge=0, le=100, description="Risk level (0-100)")
    strategic_alignment: float = Field(default=50.0, ge=0, le=100)
    resource_availability: float = Field(default=50.0, ge=0, le=100)


class AnalysisResponse(BaseModel):
    """Response model for file analysis."""
    success: bool
    analysis_id: int
    discrepancies: list[dict[str, Any]]
    summary: str
    match_score: int
    excel_info: dict[str, Any]
    pptx_info: dict[str, Any]


class PriorityResponse(BaseModel):
    """Response model for priority calculation."""
    score: float
    tier: str
    tier_color: str
    breakdown: dict[str, Any]
    recommendation: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: str
    version: str


@app.get("/", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0"
    )


@app.post("/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_files(
    file_excel: UploadFile = File(..., description="Excel file (.xlsx)"),
    file_ppt: UploadFile = File(..., description="PowerPoint file (.pptx)"),
    db: Session = Depends(get_db),
) -> AnalysisResponse:
    """
    Analyze discrepancies between Excel data and PowerPoint presentation.
    
    - Parses Excel file for data extraction
    - Extracts text from PowerPoint slides
    - Uses Groq AI to identify inconsistencies
    - Saves analysis record to database
    """
    # Validate file types
    if not file_excel.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel file must be .xlsx or .xls format"
        )
    
    if not file_ppt.filename.endswith('.pptx'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PowerPoint file must be .pptx format"
        )
    
    try:
        # Read file contents
        excel_content = await file_excel.read()
        pptx_content = await file_ppt.read()
        
        # Parse files
        excel_data = await run_in_threadpool(parse_excel, excel_content)
        pptx_data = await run_in_threadpool(extract_pptx_text, pptx_content)
        
        # Run AI analysis
        analysis_result = await analyze_with_groq(
            excel_data_obj=excel_data,
            pptx_summary=pptx_data["summary"]
        )
        
        # Save to database
        history_record = AnalysisHistory(
            excel_filename=file_excel.filename,
            pptx_filename=file_ppt.filename,
            analysis_date=datetime.utcnow(),
            discrepancies_summary=analysis_result["summary"],
            discrepancies_json=analysis_result["discrepancies"],
            status="completed"
        )
        db.add(history_record)
        db.commit()
        db.refresh(history_record)
        
        return AnalysisResponse(
            success=True,
            analysis_id=history_record.id,
            discrepancies=analysis_result["discrepancies"],
            summary=analysis_result["summary"],
            match_score=analysis_result["match_score"],
            excel_info={
                "filename": file_excel.filename,
                "sheets": len(excel_data["sheets"]),
                "total_rows": excel_data["total_rows"]
            },
            pptx_info={
                "filename": file_ppt.filename,
                "total_slides": pptx_data["total_slides"]
            }
        )
        
    except FileParsingError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except AIAnalysisError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@app.post("/prioritize", response_model=PriorityResponse, tags=["Prioritization"])
async def prioritize_project(request: PriorityRequest) -> PriorityResponse:
    """
    Calculate project priority score based on weighted factors.
    
    - ROI: 30% weight
    - Urgency: 25% weight
    - Risk (inverted): 20% weight
    - Strategic Alignment: 15% weight
    - Resource Availability: 10% weight
    """
    result = calculate_priority_score(
        roi=request.roi,
        urgency=request.urgency,
        risk=request.risk,
        strategic_alignment=request.strategic_alignment,
        resource_availability=request.resource_availability
    )
    return PriorityResponse(**result)


@app.post("/prioritize/batch", tags=["Prioritization"])
async def batch_prioritize_projects(
    file: UploadFile = File(..., description="Excel file with project data"),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Process an Excel file containing multiple projects and return priority scores for all.
    Results are saved to history for later retrieval.
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be .xlsx or .xls format"
        )
        
    try:
        content = await file.read()
        result = await run_in_threadpool(process_excel_batch, content)
        
        # Save to history
        history_record = PriorityHistory(
            filename=file.filename,
            analysis_date=datetime.utcnow(),
            total_projects=result["total_projects"],
            results_json=result["results"],
            status="completed"
        )
        db.add(history_record)
        db.commit()
        db.refresh(history_record)
        
        # Add history_id to response
        result["history_id"] = history_record.id
        return result
        
    except FileParsingError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch processing failed: {str(e)}"
        )


@app.get("/history", tags=["Analysis"])
async def get_analysis_history(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Get recent analysis history records."""
    records = (
        db.query(AnalysisHistory)
        .order_by(AnalysisHistory.analysis_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": record.id,
            "excel_filename": record.excel_filename,
            "pptx_filename": record.pptx_filename,
            "analysis_date": record.analysis_date.isoformat(),
            "summary": record.discrepancies_summary,
            "status": record.status,
        }
        for record in records
    ]


@app.get("/history/{analysis_id}", tags=["Analysis"])
async def get_analysis_detail(
    analysis_id: int,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Get detailed analysis record including full discrepancies data."""
    record = db.query(AnalysisHistory).filter(AnalysisHistory.id == analysis_id).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Análisis con ID {analysis_id} no encontrado"
        )
    
    return {
        "id": record.id,
        "excel_filename": record.excel_filename,
        "pptx_filename": record.pptx_filename,
        "analysis_date": record.analysis_date.isoformat(),
        "summary": record.discrepancies_summary,
        "discrepancies": record.discrepancies_json or [],
        "status": record.status,
    }


@app.get("/priority-history", tags=["Prioritization"])
async def get_priority_history(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Get recent priority analysis history records."""
    records = (
        db.query(PriorityHistory)
        .order_by(PriorityHistory.analysis_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": record.id,
            "filename": record.filename,
            "analysis_date": record.analysis_date.isoformat(),
            "total_projects": record.total_projects,
            "status": record.status,
        }
        for record in records
    ]


@app.get("/priority-history/{history_id}", tags=["Prioritization"])
async def get_priority_detail(
    history_id: int,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Get detailed priority analysis including all project results."""
    record = db.query(PriorityHistory).filter(PriorityHistory.id == history_id).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Priorización con ID {history_id} no encontrada"
        )
    
    return {
        "id": record.id,
        "filename": record.filename,
        "analysis_date": record.analysis_date.isoformat(),
        "total_projects": record.total_projects,
        "results": record.results_json or [],
        "status": record.status,
    }
