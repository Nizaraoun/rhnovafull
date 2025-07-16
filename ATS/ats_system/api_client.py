"""
API client for fetching candidate profiles and job offers.
"""

import requests
from typing import Optional, Dict, Any
import logging
from .models import CandidateProfile, JobOffer


class APIClient:
    """Client for interacting with the ATS API endpoints."""
    
    def __init__(self, base_url: str = "http://localhost:8080/api"):
        """
        Initialize the API client.
        
        Args:
            base_url: Base URL for the API endpoints
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.logger = logging.getLogger(__name__)
    
    def get_candidate_profile(self, user_id: str) -> Optional[CandidateProfile]:
        """
        Fetch candidate profile by user ID.
        
        Args:
            user_id: The user ID to fetch profile for
            
        Returns:
            CandidateProfile object or None if not found
        """
        url = f"{self.base_url}/profil/{user_id}"
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            
            data = response.json()
            return CandidateProfile.from_dict(data)
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching candidate profile for user {user_id}: {e}")
            return None
        except (ValueError, KeyError) as e:
            self.logger.error(f"Error parsing candidate profile data for user {user_id}: {e}")
            return None
    
    def get_job_offer(self, job_id: str) -> Optional[JobOffer]:
        """
        Fetch job offer by job ID.
        
        Args:
            job_id: The job ID to fetch offer for
            
        Returns:
            JobOffer object or None if not found
        """
        url = f"{self.base_url}/joboffers/{job_id}"
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            
            data = response.json()
            return JobOffer.from_dict(data, job_id)
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching job offer {job_id}: {e}")
            return None
        except (ValueError, KeyError) as e:
            self.logger.error(f"Error parsing job offer data for job {job_id}: {e}")
            return None
    
    def set_headers(self, headers: Dict[str, str]):
        """
        Set custom headers for API requests.
        
        Args:
            headers: Dictionary of headers to set
        """
        self.session.headers.update(headers)
    
    def set_auth_token(self, token: str):
        """
        Set authorization token for API requests.
        
        Args:
            token: Bearer token for authentication
        """
        self.session.headers['Authorization'] = f'Bearer {token}'
    
    def update_candidature_status(self, candidate_id: str, job_offer_id: str, is_compatible: bool) -> bool:
        """
        Update candidature processing status.
        
        Args:
            candidate_id: The candidate ID
            job_offer_id: The job offer ID
            is_compatible: Whether the candidate is compatible with the job
            
        Returns:
            True if update was successful, False otherwise
        """
        # Logic: 
        # - If compatible (true): isProcessed=true (candidate is processed and approved)
        # - If not compatible (false): isProcessed=false (candidate remains unprocessed)
        is_processed = is_compatible
        
        url = f"{self.base_url}/candidatures/candidat/{candidate_id}/offre/{job_offer_id}/processed"
        params = {"isProcessed": str(is_processed).lower()}
        
        try:
            self.logger.info(f"Updating candidature for candidate {candidate_id} and job {job_offer_id} with isProcessed={is_processed}")
            
            response = self.session.put(url, params=params)
            response.raise_for_status()
            
            self.logger.info(f"Successfully updated candidature for candidate {candidate_id} and job {job_offer_id} with compatibility: {is_compatible} (isProcessed: {is_processed})")
            return True
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error updating candidature for candidate {candidate_id} and job {job_offer_id}: {e}")
            return False
