"""
Data models for the ATS system.
"""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime


@dataclass
class CandidateProfile:
    """Represents a candidate profile."""
    candidat_id: str
    date_de_naissance: Optional[datetime] = None
    ville: Optional[str] = None
    pays: Optional[str] = None
    code_postal: Optional[str] = None
    phone_number: Optional[str] = None
    profession: Optional[str] = None
    formations: List[str] = None
    experiences: List[str] = None
    competences: List[str] = None
    langues: List[str] = None
    certifications: List[str] = None
    projets: List[str] = None
    description: Optional[str] = None
    
    def __post_init__(self):
        # Initialize empty lists if None
        if self.formations is None:
            self.formations = []
        if self.experiences is None:
            self.experiences = []
        if self.competences is None:
            self.competences = []
        if self.langues is None:
            self.langues = []
        if self.certifications is None:
            self.certifications = []
        if self.projets is None:
            self.projets = []
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CandidateProfile':
        """Create a CandidateProfile from a dictionary."""
        # Handle nested candidat reference
        candidat_id = data.get('candidat', {}).get('$id', {}).get('$oid', '')
        if not candidat_id:
            candidat = data.get('candidat', '')
            if isinstance(candidat, dict):
                candidat_id = candidat.get('id', candidat.get('_id', str(candidat)))
            else:
                candidat_id = str(candidat)
        
        # Handle date conversion
        date_de_naissance = None
        if 'dateDeNaissance' in data and '$date' in data['dateDeNaissance']:
            date_str = data['dateDeNaissance']['$date']
            try:
                date_de_naissance = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            except ValueError:
                pass
        
        return cls(
            candidat_id=candidat_id,
            date_de_naissance=date_de_naissance,
            ville=data.get('ville'),
            pays=data.get('pays'),
            code_postal=data.get('codePostal'),
            phone_number=data.get('phoneNumber'),
            profession=data.get('profession'),
            formations=data.get('formations', []),
            experiences=data.get('experiences', []),
            competences=data.get('competences', []),
            langues=data.get('langues', []),
            certifications=data.get('certifications', []),
            projets=data.get('projets', []),
            description=data.get('description')
        )


@dataclass
class JobOffer:
    """Represents a job offer."""
    id: str
    titre: str
    description: str
    localisation: Optional[str] = None
    position: Optional[str] = None
    experience: Optional[str] = None
    date_publication: Optional[datetime] = None
    derniere_date_pour_postuler: Optional[datetime] = None
    salaire: Optional[float] = None
    competences_requises: List[str] = None
    tags: List[str] = None
    type_emploi: Optional[str] = None
    archived: bool = False
    
    def __post_init__(self):
        # Initialize empty lists if None
        if self.competences_requises is None:
            self.competences_requises = []
        if self.tags is None:
            self.tags = []
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any], job_id: str = None) -> 'JobOffer':
        """Create a JobOffer from a dictionary."""
        # Handle date conversions
        date_publication = None
        if 'datePublication' in data and '$date' in data['datePublication']:
            date_str = data['datePublication']['$date']
            try:
                date_publication = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            except ValueError:
                pass
        
        derniere_date_pour_postuler = None
        if 'derniereDatePourPostuler' in data and '$date' in data['derniereDatePourPostuler']:
            date_str = data['derniereDatePourPostuler']['$date']
            try:
                derniere_date_pour_postuler = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            except ValueError:
                pass
        
        return cls(
            id=job_id or str(data.get('_id', '')),
            titre=data.get('titre', ''),
            description=data.get('description', ''),
            localisation=data.get('localisation'),
            position=data.get('position'),
            experience=data.get('experience'),
            date_publication=date_publication,
            derniere_date_pour_postuler=derniere_date_pour_postuler,
            salaire=data.get('salaire'),
            competences_requises=data.get('competencesRequises', []),
            tags=data.get('tags', []),
            type_emploi=data.get('typedemploi'),
            archived=data.get('archived', False)
        )


@dataclass
class CompatibilityResult:
    """Represents the result of compatibility analysis."""
    candidate_id: str
    job_offer_id: str
    compatibility_score: float
    is_compatible: bool
    details: Dict[str, Any]
    
    def __post_init__(self):
        if self.details is None:
            self.details = {}
