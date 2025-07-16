"""
ATS Analyzer for evaluating job application compatibility.
"""

import logging
from typing import Dict, List, Set, Any
from .models import CandidateProfile, JobOffer, CompatibilityResult
from .api_client import APIClient


class ATSAnalyzer:
    """
    Analyzes compatibility between candidate profiles and job offers.
    """
    
    def __init__(self, api_client: APIClient = None):
        """
        Initialize the ATS analyzer.
        
        Args:
            api_client: API client for fetching data (optional)
        """
        self.api_client = api_client or APIClient()
        self.logger = logging.getLogger(__name__)
        
        # Weights for different compatibility factors
        self.weights = {
            'competences': 0.4,      # 40% - Most important
            'experience': 0.2,       # 20% - Experience level
            'education': 0.15,       # 15% - Educational background
            'location': 0.1,         # 10% - Geographic match
            'languages': 0.1,        # 10% - Language skills
            'certifications': 0.05   # 5% - Additional certifications
        }
    
    def analyze_compatibility(self, candidate_id: str, job_offer_id: str) -> CompatibilityResult:
        """
        Analyze compatibility between a candidate and job offer.
        
        Args:
            candidate_id: ID of the candidate
            job_offer_id: ID of the job offer
            
        Returns:
            CompatibilityResult with score and details
        """
        # Fetch candidate profile and job offer
        candidate = self.api_client.get_candidate_profile(candidate_id)
        job_offer = self.api_client.get_job_offer(job_offer_id)
        
        if not candidate:
            self.logger.error(f"Could not fetch candidate profile for ID: {candidate_id}")
            return CompatibilityResult(
                candidate_id=candidate_id,
                job_offer_id=job_offer_id,
                compatibility_score=0.0,
                is_compatible=False,
                details={"error": "Candidate profile not found"}
            )
        
        if not job_offer:
            self.logger.error(f"Could not fetch job offer for ID: {job_offer_id}")
            return CompatibilityResult(
                candidate_id=candidate_id,
                job_offer_id=job_offer_id,
                compatibility_score=0.0,
                is_compatible=False,
                details={"error": "Job offer not found"}
            )
        
        return self._calculate_compatibility(candidate, job_offer)
    
    def _calculate_compatibility(self, candidate: CandidateProfile, job_offer: JobOffer) -> CompatibilityResult:
        """
        Calculate compatibility score between candidate and job offer.
        
        Args:
            candidate: Candidate profile
            job_offer: Job offer
            
        Returns:
            CompatibilityResult with detailed analysis
        """
        scores = {}
        details = {}
        
        # 1. Skills/Competences compatibility (40%)
        competences_score, competences_details = self._analyze_competences(
            candidate.competences, job_offer.competences_requises
        )
        scores['competences'] = competences_score
        details['competences'] = competences_details
        
        # 2. Experience compatibility (20%)
        experience_score, experience_details = self._analyze_experience(
            candidate.experiences, candidate.profession, job_offer.experience, job_offer.position
        )
        scores['experience'] = experience_score
        details['experience'] = experience_details
        
        # 3. Education compatibility (15%)
        education_score, education_details = self._analyze_education(
            candidate.formations, job_offer.titre, job_offer.tags
        )
        scores['education'] = education_score
        details['education'] = education_details
        
        # 4. Location compatibility (10%)
        location_score, location_details = self._analyze_location(
            candidate.ville, candidate.pays, job_offer.localisation
        )
        scores['location'] = location_score
        details['location'] = location_details
        
        # 5. Language compatibility (10%)
        language_score, language_details = self._analyze_languages(
            candidate.langues, job_offer.description, job_offer.localisation
        )
        scores['languages'] = language_score
        details['languages'] = language_details
        
        # 6. Certifications compatibility (5%)
        cert_score, cert_details = self._analyze_certifications(
            candidate.certifications, job_offer.tags, job_offer.competences_requises
        )
        scores['certifications'] = cert_score
        details['certifications'] = cert_details
        
        # Calculate weighted total score
        total_score = sum(scores[key] * self.weights[key] for key in scores)
        
        # Determine if compatible (threshold: 50%)
        is_compatible = total_score >= 0.5
        
        details['scores_breakdown'] = scores
        details['weights_used'] = self.weights
        details['total_score'] = total_score
        print("+++++++++++++++++++++++++++++++++")
        return CompatibilityResult(
            candidate_id=candidate.candidat_id,
            job_offer_id=job_offer.id,
            compatibility_score=total_score,
            is_compatible=is_compatible,
            details=details
        )
    
    def _analyze_competences(self, candidate_skills: List[str], required_skills: List[str]) -> tuple:
        """Analyze skills compatibility."""
        if not required_skills:
            return 1.0, {"message": "No specific skills required"}
        
        if not candidate_skills:
            return 0.0, {"message": "Candidate has no listed skills"}
        
        # Normalize skills to lowercase for comparison
        candidate_skills_norm = {skill.lower().strip() for skill in candidate_skills}
        required_skills_norm = {skill.lower().strip() for skill in required_skills}
        
        # Find matching skills
        matching_skills = candidate_skills_norm.intersection(required_skills_norm)
        
        # Calculate score
        score = len(matching_skills) / len(required_skills_norm)
        
        details = {
            "candidate_skills": candidate_skills,
            "required_skills": required_skills,
            "matching_skills": list(matching_skills),
            "match_percentage": f"{score * 100:.1f}%"
        }
        
        return min(score, 1.0), details
    
    def _analyze_experience(self, candidate_exp: List[str], candidate_profession: str, 
                           required_exp: str, job_position: str) -> tuple:
        """Analyze experience compatibility."""
        score = 0.0
        details = {
            "candidate_experiences": candidate_exp,
            "candidate_profession": candidate_profession,
            "required_experience": required_exp,
            "job_position": job_position
        }
        
        # Basic scoring based on having experience
        if candidate_exp:
            score += 0.5
            
        # Check if profession matches position
        if candidate_profession and job_position:
            if any(word in candidate_profession.lower() 
                   for word in job_position.lower().split()):
                score += 0.3
                details["profession_match"] = True
            else:
                details["profession_match"] = False
        
        # Parse experience years if possible
        if required_exp:
            exp_years = self._extract_years_from_text(required_exp)
            candidate_years = sum(self._extract_years_from_text(exp) for exp in candidate_exp)
            
            if exp_years > 0 and candidate_years >= exp_years:
                score += 0.2
                details["experience_years_sufficient"] = True
            else:
                details["experience_years_sufficient"] = False
                
            details["required_years"] = exp_years
            details["candidate_years"] = candidate_years
        
        return min(score, 1.0), details
    
    def _analyze_education(self, candidate_education: List[str], job_title: str, job_tags: List[str]) -> tuple:
        """Analyze education compatibility."""
        if not candidate_education:
            return 0.3, {"message": "No education information provided"}
        
        score = 0.5  # Base score for having education
        
        # Look for relevant keywords in education vs job requirements
        education_text = " ".join(candidate_education).lower()
        job_keywords = (job_title + " " + " ".join(job_tags)).lower()
        
        # Common education-job mappings
        tech_keywords = ["informatique", "computer", "software", "développement", "engineering"]
        business_keywords = ["business", "gestion", "management", "commerce"]
        
        if any(keyword in education_text for keyword in tech_keywords) and \
           any(keyword in job_keywords for keyword in tech_keywords):
            score += 0.3
        elif any(keyword in education_text for keyword in business_keywords) and \
             any(keyword in job_keywords for keyword in business_keywords):
            score += 0.3
        
        details = {
            "candidate_education": candidate_education,
            "education_relevance_score": score
        }
        
        return min(score, 1.0), details
    
    def _analyze_location(self, candidate_city: str, candidate_country: str, job_location: str) -> tuple:
        """Analyze location compatibility."""
        if not job_location:
            return 1.0, {"message": "No specific location requirement"}
        
        score = 0.0
        details = {
            "candidate_city": candidate_city,
            "candidate_country": candidate_country,
            "job_location": job_location
        }
        
        job_location_lower = job_location.lower()
        
        # Check country match
        if candidate_country and candidate_country.lower() in job_location_lower:
            score += 0.5
            details["country_match"] = True
        
        # Check city match
        if candidate_city and candidate_city.lower() in job_location_lower:
            score += 0.5
            details["city_match"] = True
        
        # If remote work indicators
        if any(remote_word in job_location_lower for remote_word in ["remote", "télétravail", "distance"]):
            score = 1.0
            details["remote_work"] = True
        
        return min(score, 1.0), details
    
    def _analyze_languages(self, candidate_languages: List[str], job_description: str, job_location: str) -> tuple:
        """Analyze language compatibility."""
        if not candidate_languages:
            return 0.5, {"message": "No language information provided"}
        
        score = 0.5  # Base score for having language info
        
        # Extract language names from candidate languages
        candidate_langs = set()
        for lang_str in candidate_languages:
            lang_str_lower = lang_str.lower()
            if "français" in lang_str_lower or "french" in lang_str_lower:
                candidate_langs.add("french")
            if "anglais" in lang_str_lower or "english" in lang_str_lower:
                candidate_langs.add("english")
            if "espagnol" in lang_str_lower or "spanish" in lang_str_lower:
                candidate_langs.add("spanish")
        
        # Check if job requires specific languages
        job_text = (job_description + " " + (job_location or "")).lower()
        
        if ("english" in job_text or "anglais" in job_text) and "english" in candidate_langs:
            score += 0.3
        if ("french" in job_text or "français" in job_text) and "french" in candidate_langs:
            score += 0.3
        
        details = {
            "candidate_languages": candidate_languages,
            "detected_languages": list(candidate_langs),
            "language_score": score
        }
        
        return min(score, 1.0), details
    
    def _analyze_certifications(self, candidate_certs: List[str], job_tags: List[str], required_skills: List[str]) -> tuple:
        """Analyze certifications compatibility."""
        if not candidate_certs:
            return 0.5, {"message": "No certifications provided"}
        
        score = 0.5  # Base score for having certifications
        
        # Look for relevant certification keywords
        cert_text = " ".join(candidate_certs).lower()
        job_keywords = " ".join(job_tags + required_skills).lower()
        
        # Common certification keywords
        if any(keyword in cert_text for keyword in ["aws", "azure", "oracle", "java", "python"]) and \
           any(keyword in job_keywords for keyword in ["aws", "azure", "oracle", "java", "python"]):
            score += 0.5
        
        details = {
            "candidate_certifications": candidate_certs,
            "certification_relevance_score": score
        }
        
        return min(score, 1.0), details
    
    def _extract_years_from_text(self, text: str) -> int:
        """Extract years from experience text."""
        import re
        if not text:
            return 0
        
        # Look for patterns like "3 ans", "2-3 years", "5 années"
        years_pattern = r'(\d+)(?:\s*[-à]\s*(\d+))?\s*(?:ans?|years?|années?)'
        matches = re.findall(years_pattern, text.lower())
        
        if matches:
            # Take the maximum if range is provided
            for match in matches:
                if match[1]:  # Range like "2-3"
                    return int(match[1])
                else:  # Single number like "3"
                    return int(match[0])
        
        return 0
    
    def set_weights(self, new_weights: Dict[str, float]):
        """
        Update the weights used for compatibility calculation.
        
        Args:
            new_weights: Dictionary with new weights for each factor
        """
        self.weights.update(new_weights)
        
        # Ensure weights sum to 1.0
        total = sum(self.weights.values())
        if total != 1.0:
            for key in self.weights:
                self.weights[key] = self.weights[key] / total
