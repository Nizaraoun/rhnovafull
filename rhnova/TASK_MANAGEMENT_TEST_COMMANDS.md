# Task Management System Test Commands

## Setup
Before testing, ensure you have:
1. A running application server
2. Valid JWT tokens for both MANAGER and MEMBRE_EQUIPE roles
3. Test users with appropriate team relationships

## Test Scenarios

### Scenario 1: Manager Creates and Assigns Tasks

#### 1. Login as Manager
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "password123"
  }'
```
Save the JWT token from the response.

#### 2. Create a New Task
```bash
curl -X POST http://localhost:8080/api/taches/manager/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {MANAGER_JWT_TOKEN}" \
  -d '{
    "titre": "Implement User Dashboard",
    "description": "Create a comprehensive user dashboard with analytics",
    "priorite": "HAUTE",
    "dateDebut": "2025-06-24",
    "dateFin": "2025-06-30"
  }'
```

#### 3. Assign Task to Team Member
```bash
curl -X POST http://localhost:8080/api/taches/manager/assign/{TASK_ID}/{MEMBER_ID} \
  -H "Authorization: Bearer {MANAGER_JWT_TOKEN}"
```

#### 4. View All Team Tasks
```bash
curl -X GET http://localhost:8080/api/taches/manager/my-team-tasks \
  -H "Authorization: Bearer {MANAGER_JWT_TOKEN}"
```

#### 5. Filter Tasks by Status
```bash
curl -X GET http://localhost:8080/api/taches/manager/team-tasks/status/EN_COURS \
  -H "Authorization: Bearer {MANAGER_JWT_TOKEN}"
```

### Scenario 2: Team Member Manages Their Tasks

#### 1. Login as Team Member
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "password": "password123"
  }'
```

#### 2. View My Assigned Tasks
```bash
curl -X GET http://localhost:8080/api/taches/member/my-tasks \
  -H "Authorization: Bearer {MEMBER_JWT_TOKEN}"
```

#### 3. View All Team Tasks (to see others' progress)
```bash
curl -X GET http://localhost:8080/api/taches/member/team-tasks \
  -H "Authorization: Bearer {MEMBER_JWT_TOKEN}"
```

#### 4. Start Working on Task (Update Progress to 25%)
```bash
curl -X PATCH http://localhost:8080/api/taches/member/{TASK_ID}/progress?progression=25 \
  -H "Authorization: Bearer {MEMBER_JWT_TOKEN}"
```

#### 5. Update Status to In Progress
```bash
curl -X PATCH http://localhost:8080/api/taches/member/{TASK_ID}/status?status=EN_COURS \
  -H "Authorization: Bearer {MEMBER_JWT_TOKEN}"
```

#### 6. Update Progress to 75%
```bash
curl -X PATCH http://localhost:8080/api/taches/member/{TASK_ID}/progress?progression=75 \
  -H "Authorization: Bearer {MEMBER_JWT_TOKEN}"
```

#### 7. Complete the Task (100% progress)
```bash
curl -X PATCH http://localhost:8080/api/taches/member/{TASK_ID}/progress?progression=100 \
  -H "Authorization: Bearer {MEMBER_JWT_TOKEN}"
```

### Scenario 3: Manager Evaluates Completed Task

#### 1. Manager Evaluates the Completed Task
```bash
curl -X PATCH http://localhost:8080/api/taches/manager/{TASK_ID}/evaluate?evaluation=9 \
  -H "Authorization: Bearer {MANAGER_JWT_TOKEN}"
```

#### 2. Manager Views Updated Task Details
```bash
curl -X GET http://localhost:8080/api/taches/details/{TASK_ID} \
  -H "Authorization: Bearer {MANAGER_JWT_TOKEN}"
```

### Scenario 4: Security Tests (Should Fail)

#### 1. Team Member Tries to Create Task (Should Fail)
```bash
curl -X POST http://localhost:8080/api/taches/manager/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {MEMBER_JWT_TOKEN}" \
  -d '{
    "titre": "Unauthorized Task",
    "description": "This should fail",
    "priorite": "BASSE"
  }'
```
Expected: 403 Forbidden

#### 2. Team Member Tries to Update Another Member's Task (Should Fail)
```bash
curl -X PATCH http://localhost:8080/api/taches/member/{OTHER_MEMBER_TASK_ID}/progress?progression=50 \
  -H "Authorization: Bearer {MEMBER_JWT_TOKEN}"
```
Expected: 400 Bad Request with error message

#### 3. Manager Tries to Assign Task to Member from Different Team (Should Fail)
```bash
curl -X POST http://localhost:8080/api/taches/manager/assign/{TASK_ID}/{OTHER_TEAM_MEMBER_ID} \
  -H "Authorization: Bearer {MANAGER_JWT_TOKEN}"
```
Expected: 400 Bad Request with error message

#### 4. Unauthenticated Request (Should Fail)
```bash
curl -X GET http://localhost:8080/api/taches/member/my-tasks
```
Expected: 401 Unauthorized

## PowerShell Commands (Windows)

For Windows users using PowerShell, use these commands:

### Manager Creates Task
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_MANAGER_JWT_TOKEN"
}

$body = @{
    titre = "Implement User Dashboard"
    description = "Create a comprehensive user dashboard with analytics"
    priorite = "HAUTE"
    dateDebut = "2025-06-24"
    dateFin = "2025-06-30"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/taches/manager/create" -Method POST -Headers $headers -Body $body
```

### Team Member Updates Progress
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_MEMBER_JWT_TOKEN"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/taches/member/TASK_ID/progress?progression=75" -Method PATCH -Headers $headers
```

## Expected Responses

### Successful Task Creation
```json
{
    "id": "64f7b1a2c3e4d5f6789012ab",
    "titre": "Implement User Dashboard",
    "description": "Create a comprehensive user dashboard with analytics",
    "priorite": "HAUTE",
    "dateDebut": "2025-06-24",
    "dateFin": "2025-06-30",
    "statut": "A_FAIRE",
    "membreId": null,
    "membreName": null,
    "progression": 0,
    "evaluation": null,
    "createdById": "64f7b1a2c3e4d5f6789012xy",
    "createdByName": "Manager Name",
    "dateCreation": "2025-06-24T10:00:00",
    "lastUpdated": "2025-06-24T10:00:00"
}
```

### Progress Update Response
```json
{
    "id": "64f7b1a2c3e4d5f6789012ab",
    "titre": "Implement User Dashboard",
    "statut": "EN_COURS",
    "progression": 75,
    "lastUpdated": "2025-06-24T15:30:00"
}
```

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check if the user has the correct role for the operation
2. **400 Bad Request**: Verify that task assignments are within the same team
3. **401 Unauthorized**: Ensure JWT token is valid and not expired
4. **404 Not Found**: Verify that task IDs and user IDs exist

### Debug Tips

1. Check user roles: `GET /api/auth/me` (if available)
2. Verify team memberships: `GET /api/team-member/my-team/members`
3. Check task ownership before updates
4. Ensure date formats are correct (YYYY-MM-DD)
5. Verify progression values are between 0-100
6. Check that evaluation values are appropriate (typically 0-10)
