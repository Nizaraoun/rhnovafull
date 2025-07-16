"""
FastAPI server for ATS compatibility testing.
Provides REST endpoints to test candidate-job compatibility.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
from datetime import datetime
import sys
import os

# Add the current directory to the path so we can import ats_system
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ats_system import ATSAnalyzer, APIClient

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ATS Compatibility API",
    description="API for testing job application compatibility between candidates and job offers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Pydantic models for API requests/responses
class CompatibilityRequest(BaseModel):
    candidate_id: str
    job_offer_id: str
    api_base_url: Optional[str] = "http://localhost:8080/api"
    update_candidature: Optional[bool] = True

class CompatibilityResponse(BaseModel):
    candidate_id: str
    job_offer_id: str
    compatibility_score: float
    is_compatible: bool
    candidature_updated: bool
    analysis_timestamp: str
    details: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    endpoints: Dict[str, str]

def get_analyzer(api_base_url: str = None) -> ATSAnalyzer:
    """Get or create analyzer instance."""
    api_client = APIClient(base_url=api_base_url or "http://localhost:8080/api")
    return ATSAnalyzer(api_client=api_client)

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint."""
    return HealthResponse(
        status="ATS Compatibility API is running",
        timestamp=datetime.now().isoformat(),
        version="1.0.0",
        endpoints={
            "POST /analyze-compatibility": "Analyze compatibility with JSON body",
            "GET /analyze-compatibility/{candidate_id}/{job_offer_id}": "Analyze compatibility with path parameters",
            "GET /compatibility/{profile_id}/{job_id}": "Analyze compatibility (preferred endpoint)",
            "GET /health": "Health check endpoint",
            "GET /docs": "Interactive API documentation",
            "GET /": "This health check"
        }
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0",
        endpoints={
            "POST /analyze-compatibility": "Analyze compatibility with JSON body",
            "GET /analyze-compatibility/{candidate_id}/{job_offer_id}": "Analyze compatibility with path parameters",
            "GET /compatibility/{profile_id}/{job_id}": "Analyze compatibility (preferred endpoint)",
            "GET /health": "Health check endpoint",
            "GET /docs": "Interactive API documentation"
        }
    )

@app.post("/analyze-compatibility", response_model=CompatibilityResponse)
async def analyze_compatibility_post(request: CompatibilityRequest):
    """
    Analyze compatibility between a candidate and job offer.
    
    Args:
        request: Compatibility request with candidate_id and job_offer_id
        
    Returns:
        CompatibilityResponse with analysis results
    """
    try:
        logger.info(f"POST: Analyzing compatibility for candidate {request.candidate_id} and job {request.job_offer_id}")
        
        # Initialize analyzer with provided API base URL
        analyzer = get_analyzer(request.api_base_url)
        
        # Perform compatibility analysis
        result = analyzer.analyze_compatibility(request.candidate_id, request.job_offer_id)
        
        # Update candidature status if requested
        candidature_updated = False
        if request.update_candidature:
            try:
                logger.info(f"Updating candidature status for candidate {request.candidate_id} and job {request.job_offer_id}")
                logger.info(f"Compatibility result: Score={result.compatibility_score:.2%}, Compatible={result.is_compatible}")
                
                candidature_updated = analyzer.api_client.update_candidature_status(
                    request.candidate_id, 
                    request.job_offer_id, 
                    result.is_compatible
                )
                
                if candidature_updated:
                    action = "processed as approved" if result.is_compatible else "left unprocessed"
                    logger.info(f"✅ Candidature successfully {action} (isProcessed={result.is_compatible})")
                else:
                    logger.warning("❌ Failed to update candidature status")
                    
            except Exception as e:
                logger.warning(f"Failed to update candidature: {e}")
        
        # Prepare response
        response = CompatibilityResponse(
            candidate_id=result.candidate_id,
            job_offer_id=result.job_offer_id,
            compatibility_score=result.compatibility_score,
            is_compatible=result.is_compatible,
            candidature_updated=candidature_updated,
            analysis_timestamp=datetime.now().isoformat(),
            details=result.details
        )
        logger.info(f"Analysis complete: Score={result.compatibility_score:.2%}, Compatible={result.is_compatible}")
        return response
        
    except Exception as e:
        logger.error(f"Error during compatibility analysis: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error analyzing compatibility: {str(e)}"
        )

@app.get("/analyze-compatibility/{candidate_id}/{job_offer_id}", response_model=CompatibilityResponse)
async def analyze_compatibility_get(
    candidate_id: str,
    job_offer_id: str,
    api_base_url: Optional[str] = "http://localhost:8080/api",
    update_candidature: Optional[bool] = True
):
    """
    GET endpoint for compatibility analysis (alternative to POST).
    
    Args:
        candidate_id: ID of the candidate
        job_offer_id: ID of the job offer
        api_base_url: Base URL for the HR API
        update_candidature: Whether to update candidature status
        
    Returns:
        CompatibilityResponse with analysis results
    """
    logger.info(f"GET: Analyzing compatibility for candidate {candidate_id} and job {job_offer_id}")
    
    request = CompatibilityRequest(
        candidate_id=candidate_id,
        job_offer_id=job_offer_id,
        api_base_url=api_base_url,
        update_candidature=update_candidature
    )
    
    return await analyze_compatibility_post(request)

@app.get("/compatibility/{profile_id}/{job_id}", response_model=CompatibilityResponse)
async def analyze_compatibility_profile_job(
    profile_id: str,
    job_id: str,
    api_base_url: Optional[str] = "http://localhost:8080/api",
    update_candidature: Optional[bool] = True
):
    """
    Analyze compatibility using profile_id and job_id parameters.
    This endpoint uses profile_id and job_id as path parameters for easier access.
    
    Args:
        profile_id: ID of the candidate profile
        job_id: ID of the job offer
        api_base_url: Base URL for the HR API
        update_candidature: Whether to update candidature status
        
    Returns:
        CompatibilityResponse with analysis results
    """
    logger.info(f"Analyzing compatibility for profile {profile_id} and job {job_id}")
    
    request = CompatibilityRequest(
        candidate_id=profile_id,
        job_offer_id=job_id,
        api_base_url=api_base_url,
        update_candidature=update_candidature
    )
    
    return await analyze_compatibility_post(request)

# Add CORS middleware for web browser access
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    print("🚀 Starting ATS Compatibility FastAPI Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("📋 Alternative docs: http://localhost:8000/redoc")
    print("🔗 Available endpoints:")
    print("   POST http://localhost:8000/analyze-compatibility")
    print("   GET  http://localhost:8000/analyze-compatibility/{candidate_id}/{job_offer_id}")
    print("   GET  http://localhost:8000/compatibility/{profile_id}/{job_id}")
    print("   GET  http://localhost:8000/health")
    print("\n✨ Example usage:")
    print('   curl -X POST http://localhost:8000/analyze-compatibility \\')
    print('        -H "Content-Type: application/json" \\')
    print('        -d \'{"candidate_id":"6852df3e7c3a1e4221d5cbe8","job_offer_id":"685003a01832c67844dd5e7f"}\'')
    print()
    print("   Or GET: http://localhost:8000/compatibility/6852df3e7c3a1e4221d5cbe8/685003a01832c67844dd5e7f")
    print()
    print("📝 Candidature Update Logic:")
    print("   - Compatible candidates: isProcessed=true (approved)")
    print("   - Non-compatible candidates: isProcessed=false (unprocessed)")
    print("   - Endpoint used: PUT /api/candidatures/candidat/{candidate_id}/offre/{job_id}/processed?isProcessed={true/false}")
    print()
    
    try:
        import uvicorn
        uvicorn.run(
            "fastapi_server:app", 
            host="0.0.0.0", 
            port=8000, 
            reload=True,
            log_level="info"
        )
    except ImportError:
        print("❌ Error: uvicorn is not installed. Please install it with:")
        print("   pip install uvicorn[standard]")
        sys.exit(1)
