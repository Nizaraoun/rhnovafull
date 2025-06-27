# Leave Management API - cURL Examples

## Prerequisites
- Replace `{BASE_URL}` with your server URL (e.g., `http://localhost:8080`)
- Replace `{JWT_TOKEN}` with your actual JWT authentication token
- Replace `{LEAVE_ID}` with actual leave request IDs
- Adjust date formats as needed (YYYY-MM-DD)

## Manager Endpoints

### 1. Create Manager Leave Request
```bash
curl -X POST "{BASE_URL}/api/conges/manager/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "dateDebut": "2025-07-01",
    "dateFin": "2025-07-05",
    "typeConge": "CONGE_PAYE",
    "raison": "Vacances familiales"
  }'
```

### 2. Get Manager's Own Leave Requests
```bash
curl -X GET "{BASE_URL}/api/conges/manager/my-requests" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### 3. Get Team Leave Requests
```bash
curl -X GET "{BASE_URL}/api/conges/manager/team-requests" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### 4. Approve Team Member Leave Request
```bash
curl -X PATCH "{BASE_URL}/api/conges/manager/{LEAVE_ID}/approve" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -G -d "comments=Demande approuvée, bon repos!"
```

### 5. Approve Team Member Leave Request (without comments)
```bash
curl -X PATCH "{BASE_URL}/api/conges/manager/{LEAVE_ID}/approve" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### 6. Reject Team Member Leave Request
```bash
curl -X PATCH "{BASE_URL}/api/conges/manager/{LEAVE_ID}/reject" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -G -d "comments=Période trop chargée, merci de proposer une autre date"
```

## Team Member Endpoints

### 7. Create Team Member Leave Request
```bash
curl -X POST "{BASE_URL}/api/conges/member/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "dateDebut": "2025-08-15",
    "dateFin": "2025-08-20",
    "typeConge": "CONGE_MALADIE",
    "raison": "Rendez-vous médical"
  }'
```

### 8. Get My Leave Requests
```bash
curl -X GET "{BASE_URL}/api/conges/member/my-requests" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### 9. Get Team Leave Calendar
```bash
curl -X GET "{BASE_URL}/api/conges/member/team-calendar" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### 10. Update My Leave Request
```bash
curl -X PUT "{BASE_URL}/api/conges/member/{LEAVE_ID}/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "dateDebut": "2025-08-16",
    "dateFin": "2025-08-21",
    "typeConge": "CONGE_PAYE",
    "raison": "Modification des dates de vacances"
  }'
```

### 11. Cancel My Leave Request
```bash
curl -X DELETE "{BASE_URL}/api/conges/member/{LEAVE_ID}/cancel" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

## Common Endpoints

### 12. Get Leave Request Details
```bash
curl -X GET "{BASE_URL}/api/conges/details/{LEAVE_ID}" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

## Legacy Endpoints (Backward Compatibility)

### 13. Create Leave Request (Legacy)
```bash
curl -X POST "{BASE_URL}/api/conges/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "employeId": "64a1b2c3d4e5f6789012345",
    "validateurId": "64a1b2c3d4e5f6789012346",
    "dateDebut": "2025-09-01",
    "dateFin": "2025-09-03",
    "typeConge": "CONGE_PAYE",
    "raison": "Congé de courte durée"
  }'
```

### 14. Get All Leave Requests (Legacy)
```bash
curl -X GET "{BASE_URL}/api/conges/all" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### 15. Get Leave Request by ID (Legacy)
```bash
curl -X GET "{BASE_URL}/api/conges/{LEAVE_ID}" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### 16. Delete Leave Request (Legacy)
```bash
curl -X DELETE "{BASE_URL}/api/conges/delete/{LEAVE_ID}" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

## Complete Example Scenarios

### Scenario 1: Team Member Creates and Updates Leave Request
```bash
# Step 1: Create leave request
LEAVE_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/conges/member/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "dateDebut": "2025-12-20",
    "dateFin": "2025-12-25",
    "typeConge": "CONGE_PAYE",
    "raison": "Vacances de Noël"
  }')

# Extract leave ID from response
LEAVE_ID=$(echo $LEAVE_RESPONSE | jq -r '.id')

# Step 2: Update the leave request
curl -X PUT "http://localhost:8080/api/conges/member/$LEAVE_ID/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "dateDebut": "2025-12-21",
    "dateFin": "2025-12-26",
    "typeConge": "CONGE_PAYE",
    "raison": "Vacances de Noël - dates modifiées"
  }'

# Step 3: Check updated request
curl -X GET "http://localhost:8080/api/conges/details/$LEAVE_ID" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Scenario 2: Manager Approves Team Request
```bash
# Step 1: Manager checks team requests
curl -X GET "http://localhost:8080/api/conges/manager/team-requests" \
  -H "Authorization: Bearer manager_jwt_token_here"

# Step 2: Manager approves a specific request
curl -X PATCH "http://localhost:8080/api/conges/manager/64a1b2c3d4e5f6789012347/approve" \
  -H "Authorization: Bearer manager_jwt_token_here" \
  -G -d "comments=Demande approuvée. Bonnes vacances!"
```

## Testing Different Leave Types

### Annual Leave (Congé Payé)
```bash
curl -X POST "{BASE_URL}/api/conges/member/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "dateDebut": "2025-07-15",
    "dateFin": "2025-07-30",
    "typeConge": "CONGE_PAYE",
    "raison": "Vacances d'\''été"
  }'
```

### Sick Leave (Congé Maladie)
```bash
curl -X POST "{BASE_URL}/api/conges/member/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "dateDebut": "2025-06-26",
    "dateFin": "2025-06-27",
    "typeConge": "CONGE_MALADIE",
    "raison": "Consultation médicale"
  }'
```

### Maternity/Paternity Leave (Congé Maternité/Paternité)
```bash
curl -X POST "{BASE_URL}/api/conges/member/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "dateDebut": "2025-09-01",
    "dateFin": "2025-11-30",
    "typeConge": "CONGE_MATERNITE",
    "raison": "Congé maternité"
  }'
```

## Error Handling Examples

### Testing Unauthorized Access
```bash
# This should return 403 Forbidden
curl -X GET "{BASE_URL}/api/conges/manager/team-requests" \
  -H "Authorization: Bearer invalid_or_member_token"
```

### Testing Invalid Leave ID
```bash
# This should return 400 Bad Request
curl -X GET "{BASE_URL}/api/conges/details/invalid_id_here" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### Testing Update Non-Pending Request
```bash
# This should return 400 Bad Request if request is already approved/rejected
curl -X PUT "{BASE_URL}/api/conges/member/{APPROVED_LEAVE_ID}/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "dateDebut": "2025-08-16",
    "dateFin": "2025-08-21",
    "typeConge": "CONGE_PAYE",
    "raison": "Tentative de modification"
  }'
```

## Response Examples

### Successful Leave Creation Response
```json
{
  "id": "64a1b2c3d4e5f6789012348",
  "employeId": "64a1b2c3d4e5f6789012345",
  "employeNom": "Dupont",
  "validateurId": "64a1b2c3d4e5f6789012346",
  "validateurNom": "Martin",
  "dateDebut": "2025-07-01",
  "dateFin": "2025-07-05",
  "typeConge": "CONGE_PAYE",
  "statut": "EN_ATTENTE",
  "raison": "Vacances familiales",
  "nombreJours": 5,
  "dateCreation": "2025-06-25",
  "dateValidation": null,
  "commentaireValidateur": null
}
```

### Error Response Example
```json
{
  "timestamp": "2025-06-25T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Seuls les managers peuvent voir les demandes de leur équipe",
  "path": "/api/conges/manager/team-requests"
}
```

## Notes
- All dates should be in ISO format (YYYY-MM-DD)
- JWT tokens expire, so refresh them as needed
- Replace placeholder IDs with actual MongoDB ObjectIds
- Check your application.yml for the correct server port
- Use appropriate TypeConge values based on your enum definition
