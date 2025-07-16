"""
ATS System - Applicant Tracking System for Job Application Compatibility
========================================================================

This module provides functionality to evaluate the compatibility between
candidate profiles and job offers based on various criteria.
"""

__version__ = "1.0.0"
__author__ = "ATS System Team"

from .ats_analyzer import ATSAnalyzer
from .api_client import APIClient
from .models import CandidateProfile, JobOffer, CompatibilityResult

__all__ = [
    "ATSAnalyzer",
    "APIClient", 
    "CandidateProfile",
    "JobOffer",
    "CompatibilityResult"
]
