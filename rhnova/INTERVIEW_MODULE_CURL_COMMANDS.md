# Interview Module CURL Commands

## Base URL
All requests are made to: `http://localhost:8080`

## Headers
For all requests, include:
```
Content-Type: application/json
```

---

## 1. CRUD Operations

### 1.1 Create Interview
```bash
curl -X POST http://localhost:8080/api/entretiens \
  -H "Content-Type: application/json" \
  -d '{
    "candidatureId": "60d1b1234567890123456789",
    "dateEntretien": "2025-06-25",
    "heureEntretien": "14:30",
    "dureeMinutes": 60,
    "type": "TECHNIQUE",
    "statut": "PLANIFIE",
    "lieu": "Salle de réunion A",
    "lienVisio": "https://meet.google.com/abc-xyz-123",
    "objectifs": "Évaluation technique Java/Spring",
    "commentaires": "Premier entretien technique"
  }'
```

### 1.2 Update Interview
```bash
curl -X PUT http://localhost:8080/api/entretiens/{interviewId} \
  -H "Content-Type: application/json" \
  -d '{
    "candidatureId": "60d1b1234567890123456789",
    "dateEntretien": "2025-06-26",
    "heureEntretien": "15:00",
    "dureeMinutes": 90,
    "type": "RH",
    "statut": "CONFIRME",
    "lieu": "Bureau RH",
    "objectifs": "Entretien RH et culture d entreprise",
    "commentaires": "Suivi après entretien technique"
  }'
```

### 1.3 Delete Interview
```bash
curl -X DELETE http://localhost:8080/api/entretiens/{interviewId}
```

### 1.4 Get All Interviews
```bash
curl -X GET http://localhost:8080/api/entretiens
```

### 1.5 Get Interview by ID
```bash
curl -X GET http://localhost:8080/api/entretiens/{interviewId}
```

---

## 2. Filtering Operations

### 2.1 Get Interviews by Date
```bash
curl -X GET http://localhost:8080/api/entretiens/date/2025-06-25
```

### 2.2 Get Interviews by Date Range
```bash
curl -X GET "http://localhost:8080/api/entretiens/date-range?startDate=2025-06-20&endDate=2025-06-30"
```

### 2.3 Get Interviews by Status
```bash
# Available statuses: PLANIFIE, CONFIRME, EN_COURS, TERMINE, ANNULE, REPORTE
curl -X GET http://localhost:8080/api/entretiens/statut/PLANIFIE
curl -X GET http://localhost:8080/api/entretiens/statut/CONFIRME
curl -X GET http://localhost:8080/api/entretiens/statut/TERMINE
```

### 2.4 Get Interviews by Type
```bash
# Available types: TECHNIQUE, RH, COMPORTEMENTAL, DIRECTION, TELEPHONIQUE
curl -X GET http://localhost:8080/api/entretiens/type/TECHNIQUE
curl -X GET http://localhost:8080/api/entretiens/type/RH
curl -X GET http://localhost:8080/api/entretiens/type/COMPORTEMENTAL
```

### 2.5 Get Interviews by Candidature
```bash
curl -X GET http://localhost:8080/api/entretiens/candidature/{candidatureId}
```

### 2.6 Get Interviews by HR Responsible
```bash
curl -X GET http://localhost:8080/api/entretiens/responsable/{responsableRHId}
```

### 2.7 Flexible Filter (Backward Compatibility)
```bash
# Filter by date
curl -X GET "http://localhost:8080/api/entretiens/filter?date=2025-06-25"

# Filter by candidature
curl -X GET "http://localhost:8080/api/entretiens/filter?candidatureId=60d1b1234567890123456789"

# Filter by HR responsible
curl -X GET "http://localhost:8080/api/entretiens/filter?responsableRHId=60d1b1234567890123456789"

# Get all (no filters)
curl -X GET http://localhost:8080/api/entretiens/filter
```

---

## 3. Special Operations

### 3.1 Get Available Candidates for Interview
```bash
curl -X GET http://localhost:8080/api/entretiens/candidates/available
```

### 3.2 Update Interview Status
```bash
curl -X PATCH http://localhost:8080/api/entretiens/{interviewId}/statut \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "TERMINE"
  }'
```

### 3.3 Add Note and Comments to Interview
```bash
curl -X PATCH http://localhost:8080/api/entretiens/{interviewId}/note \
  -H "Content-Type: application/json" \
  -d '{
    "note": 16.5,
    "commentaires": "Excellent candidat, bonnes compétences techniques et bonne communication"
  }'
```

### 3.4 Add Only Comments (without note)
```bash
curl -X PATCH http://localhost:8080/api/entretiens/{interviewId}/note \
  -H "Content-Type: application/json" \
  -d '{
    "commentaires": "Candidat motivé mais manque d expérience sur certaines technologies"
  }'
```

---

## 4. Complete Workflow Example

### Step 1: Get Available Candidates
```bash
curl -X GET http://localhost:8080/api/entretiens/candidates/available
```

### Step 2: Create Interview for Selected Candidate
```bash
curl -X POST http://localhost:8080/api/entretiens \
  -H "Content-Type: application/json" \
  -d '{
    "candidatureId": "CANDIDATURE_ID_FROM_STEP1",
    "dateEntretien": "2025-06-25",
    "heureEntretien": "14:30",
    "dureeMinutes": 60,
    "type": "TECHNIQUE",
    "statut": "PLANIFIE",
    "lieu": "Salle de réunion A",
    "objectifs": "Évaluation technique Java/Spring"
  }'
```

### Step 3: Confirm Interview
```bash
curl -X PATCH http://localhost:8080/api/entretiens/{INTERVIEW_ID}/statut \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "CONFIRME"
  }'
```

### Step 4: Mark as In Progress
```bash
curl -X PATCH http://localhost:8080/api/entretiens/{INTERVIEW_ID}/statut \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "EN_COURS"
  }'
```

### Step 5: Complete Interview with Note
```bash
curl -X PATCH http://localhost:8080/api/entretiens/{INTERVIEW_ID}/statut \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "TERMINE"
  }'

curl -X PATCH http://localhost:8080/api/entretiens/{INTERVIEW_ID}/note \
  -H "Content-Type: application/json" \
  -d '{
    "note": 15.0,
    "commentaires": "Bon niveau technique, expérience pertinente"
  }'
```

---

## 5. Data Formats

### 5.1 Enum Values

#### Interview Types (type):
- `TECHNIQUE`
- `RH`
- `COMPORTEMENTAL`
- `DIRECTION`
- `TELEPHONIQUE`

#### Interview Status (statut):
- `PLANIFIE`
- `CONFIRME`
- `EN_COURS`
- `TERMINE`
- `ANNULE`
- `REPORTE`

### 5.2 Date/Time Formats
- **Date**: `YYYY-MM-DD` (e.g., "2025-06-25")
- **Time**: `HH:MM` (e.g., "14:30")

### 5.3 Validation Rules
- `candidatureId`: Required, must exist in database
- `dateEntretien`: Required, must be present or future date
- `heureEntretien`: Required
- `dureeMinutes`: Required, minimum 15 minutes, default 60
- `type`: Required, default "TECHNIQUE"
- `statut`: Required, default "PLANIFIE"
- `note`: Optional, must be between 0 and 20

---

## 6. Response Examples

### Successful Interview Creation Response:
```json
{
  "id": "60d1b1234567890123456790",
  "candidatureId": "60d1b1234567890123456789",
  "candidatId": "60d1b1234567890123456788",
  "candidatNom": "John Doe",
  "candidatEmail": "john.doe@example.com",
  "offreId": "60d1b1234567890123456787",
  "titreOffre": "Développeur Java Senior",
  "dateEntretien": "2025-06-25",
  "heureEntretien": "14:30",
  "dureeMinutes": 60,
  "type": "TECHNIQUE",
  "statut": "PLANIFIE",
  "lieu": "Salle de réunion A",
  "lienVisio": "https://meet.google.com/abc-xyz-123",
  "objectifs": "Évaluation technique Java/Spring",
  "commentaires": "Premier entretien technique",
  "note": null,
  "dateCreation": "2025-06-22T10:30:00",
  "dateModification": null,
  "responsableRHId": "60d1b1234567890123456786",
  "responsableRHNom": "HR Manager"
}
```

### Available Candidates Response:
```json
[
  {
    "candidatureId": "60d1b1234567890123456789",
    "candidatId": "60d1b1234567890123456788",
    "nom": "John Doe",
    "prenom": "",
    "email": "john.doe@example.com",
    "nomComplet": "John Doe",
    "titreOffre": "Développeur Java Senior",
    "offreId": "60d1b1234567890123456787"
  }
]
```

---

## 7. Error Handling

### Common Error Responses:
- **400 Bad Request**: Invalid data or validation error
- **404 Not Found**: Interview or related entity not found
- **500 Internal Server Error**: Server error

### Example Error Response:
```json
{
  "timestamp": "2025-06-22T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "La note doit être comprise entre 0 et 20",
  "path": "/api/entretiens/123/note"
}
```

---

## Notes:
- Replace `{interviewId}`, `{candidatureId}`, etc. with actual IDs from your database
- All dates should be in ISO format (YYYY-MM-DD)
- Times should be in HH:MM format
- Authentication headers may be required depending on your security configuration
- The server runs on port 8080 by default

---

## Team Member Endpoints

### Get My Team Details
Get complete information about the current user's team including members and manager.

```bash
curl -X GET http://localhost:8080/api/team-member/my-team \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example:**
```json
{
  "id": "60d1b1234567890123456789",
  "nom": "Équipe Développement Frontend",
  "description": "Équipe responsable du développement des interfaces utilisateur",
  "manager": {
    "id": "60d1b1234567890123456788",
    "name": "Jean Dupont",
    "email": "jean.dupont@company.com",
    "role": "MANAGER"
  },
  "membres": [
    {
      "id": "60d1b1234567890123456787",
      "name": "Marie Martin",
      "email": "marie.martin@company.com",
      "role": "MEMBRE_EQUIPE"
    },
    {
      "id": "60d1b1234567890123456786",
      "name": "Pierre Durand",
      "email": "pierre.durand@company.com",
      "role": "MEMBRE_EQUIPE"
    }
  ],
  "nombreMembres": 2
}
```

### Get My Team Members Only
Get only the list of team members for the current user's team.

```bash
curl -X GET http://localhost:8080/api/team-member/my-team/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get My Team Manager
Get the manager information for the current user's team.

```bash
curl -X GET http://localhost:8080/api/team-member/my-team/manager \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Authentication Note:**
- All team member endpoints require JWT authentication
- The JWT token should contain the user's email
- Users can only access information about their own team
