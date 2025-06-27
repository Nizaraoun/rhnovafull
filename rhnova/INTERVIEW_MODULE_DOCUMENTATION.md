# Interview Module Documentation

## Overview
This document describes the complete interview module created for the RhNova application. The module handles interview scheduling, management, and tracking for job candidates.

## Structure Created

### 1. Enums
- **TypeEntretien.java**: Defines interview types (TECHNIQUE, RH, COMPORTEMENTAL, DIRECTION, TELEPHONIQUE)
- **StatutEntretien.java**: Defines interview statuses (PLANIFIE, CONFIRME, EN_COURS, TERMINE, ANNULE, REPORTE)

### 2. Entity
- **Entretien.java**: Updated entity with all required fields:
  - candidature (DBRef to Candidature)
  - dateEntretien (LocalDate)
  - heureEntretien (LocalTime)
  - dureeMinutes (Integer)
  - type (TypeEntretien)
  - statut (StatutEntretien)
  - lieu (String)
  - lienVisio (String)
  - objectifs (String)
  - commentaires (String)
  - note (Double - out of 20)
  - dateCreation/dateModification (LocalDateTime)
  - responsableRH (DBRef to User)

### 3. DTOs
- **Entretiendto.java**: Complete DTO with all interview information
- **CreateEntretienDto.java**: DTO for creating interviews with validation
- **CandidatSimpleDto.java**: Simplified candidate info for dropdowns

### 4. Repository
- **EntretienRepository.java**: Updated with comprehensive query methods:
  - findByCandidatureId()
  - findByDateEntretien()
  - findByDateEntretienBetween()
  - findByStatut()
  - findByType()
  - findByResponsableRHId()
  - Custom queries for filtering

### 5. Service
- **EntretienService.java**: Interface with all business methods
- **EntretienServiceImpl.java**: Complete implementation with:
  - CRUD operations
  - Filtering by date, status, type
  - Candidate management
  - Note and status updates
  - Validation logic

### 6. Mapper
- **EntretienMapper.java**: Complete mapping between entities and DTOs
  - toDTO() - Entity to DTO conversion
  - toEntity() - DTO to Entity conversion
  - toCandidatSimpleDto() - Candidature to simple DTO
  - updateEntityFromDto() - Update entity from DTO

### 7. Controller
- **EntretienController.java**: REST API endpoints:

#### Main CRUD Operations:
- POST `/api/entretiens` - Create interview
- PUT `/api/entretiens/{id}` - Update interview
- DELETE `/api/entretiens/{id}` - Delete interview
- GET `/api/entretiens` - Get all interviews
- GET `/api/entretiens/{id}` - Get interview by ID

#### Filtering Endpoints:
- GET `/api/entretiens/date/{date}` - Get by specific date
- GET `/api/entretiens/date-range?startDate&endDate` - Get by date range
- GET `/api/entretiens/statut/{statut}` - Get by status
- GET `/api/entretiens/type/{type}` - Get by type
- GET `/api/entretiens/candidature/{candidatureId}` - Get by candidature
- GET `/api/entretiens/responsable/{responsableRHId}` - Get by HR responsible

#### Special Operations:
- GET `/api/entretiens/candidates/available` - Get available candidates for interview
- PATCH `/api/entretiens/{id}/statut` - Update interview status
- PATCH `/api/entretiens/{id}/note` - Add note and comments
- GET `/api/entretiens/filter` - Flexible filtering (backward compatibility)

## Validation Rules

### CreateEntretienDto Validation:
- candidatureId: Required, not blank
- dateEntretien: Required, must be present or future
- heureEntretien: Required
- dureeMinutes: Required, minimum 15 minutes
- type: Required, defaults to TECHNIQUE
- statut: Required, defaults to PLANIFIE
- note: Optional, between 0 and 20

## Default Values:
- dureeMinutes: 60 minutes
- type: TECHNIQUE
- statut: PLANIFIE

## Integration Points:
- Links to Candidature entity (many-to-one)
- Links to User entity for HR responsible (many-to-one)
- Integrates with existing authentication system

## API Usage Examples:

### Create Interview:
```json
POST /api/entretiens
{
  "candidatureId": "candidate123",
  "dateEntretien": "2025-06-25",
  "heureEntretien": "14:30",
  "dureeMinutes": 60,
  "type": "TECHNIQUE",
  "statut": "PLANIFIE",
  "lieu": "Salle de réunion A",
  "objectifs": "Évaluation technique Java/Spring"
}
```

### Update Status:
```json
PATCH /api/entretiens/{id}/statut
{
  "statut": "TERMINE"
}
```

### Add Note:
```json
PATCH /api/entretiens/{id}/note
{
  "note": 16.5,
  "commentaires": "Excellente maîtrise des concepts"
}
```

## Angular Form Fields (as requested):
The module supports all requested form fields:
- candidatId: Available through /candidates/available endpoint
- dateEntretien: LocalDate field
- heureEntretien: LocalTime field  
- dureeMinutes: Integer with default 60, min 15
- type: Enum selector with default TECHNIQUE
- statut: Enum selector with default PLANIFIE
- lieu: String field
- lienVisio: String field
- objectifs: String field
- commentaires: String field
- note: Number field (0-20)

This complete interview module provides all functionality needed for managing candidate interviews in the HR system.
