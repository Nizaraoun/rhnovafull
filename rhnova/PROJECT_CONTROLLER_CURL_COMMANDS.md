# Project Controller API - Curl Commands

This document contains curl commands for all endpoints in the ProjetController.

## Base URL
```
BASE_URL=http://localhost:8080/api/projets
```

## Authentication
Most endpoints require authentication. Include the Authorization header with your JWT token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## MANAGER ENDPOINTS

### 1. Create a New Project
```bash
curl -X POST "$BASE_URL/manager/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nom": "New Project",
    "description": "Project description",
    "dateDebut": "2025-01-01",
    "dateFin": "2025-12-31",
    "budget": 50000.00,
    "statut": "EN_ATTENTE"
  }'
```

### 2. Update a Project
```bash
curl -X PUT "$BASE_URL/manager/{projetId}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nom": "Updated Project Name",
    "description": "Updated description",
    "dateDebut": "2025-01-01",
    "dateFin": "2025-12-31",
    "budget": 60000.00,
    "statut": "EN_COURS"
  }'
```

### 3. Delete a Project
```bash
curl -X DELETE "$BASE_URL/manager/{projetId}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get All Manager's Projects
```bash
curl -X GET "$BASE_URL/manager/my-projects" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```



### 6. Assign Project to Team
```bash
curl -X PATCH "$BASE_URL/manager/{projetId}/assign-team/{equipeId}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```


### 8. Create Task in Project
```bash
curl -X POST "$BASE_URL/manager/{projetId}/tasks/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "titre": "Task Title",
    "description": "Task description",
    "dateDebut": "2025-01-15",
    "dateFin": "2025-02-15",
    "priorite": "MOYENNE",
    "statut": "EN_ATTENTE",
    "assigneeId": "employee_id_here"
  }'
```

---

## TEAM MEMBER ENDPOINTS

### 9. Get Team Projects
```bash
curl -X GET "$BASE_URL/member/my-team-projects" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## COMMON ENDPOINTS


### 11. Get All Tasks for a Project
```bash
curl -X GET "$BASE_URL/{projetId}/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 12. Update Project Progression
```bash
curl -X PATCH "$BASE_URL/{projetId}/update-progression" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Example Usage with Real Data

Replace the placeholders with actual values:

### Complete Example - Create Project
```bash
curl -X POST "http://localhost:8080/api/projets/manager/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "nom": "E-commerce Platform",
    "description": "Development of a modern e-commerce platform with microservices architecture",
    "dateDebut": "2025-01-01",
    "dateFin": "2025-06-30",
    "budget": 100000.00,
    "statut": "EN_ATTENTE"
  }'
```

### Complete Example - Get Project Details
```bash
curl -X GET "http://localhost:8080/api/projets/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Complete Example - Assign Team to Project
```bash
curl -X PATCH "http://localhost:8080/api/projets/manager/507f1f77bcf86cd799439011/assign-team/507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK` - Success
- `400 Bad Request` - Invalid request data
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Notes

1. Replace `{projetId}` and `{equipeId}` with actual MongoDB ObjectIds
2. Replace `YOUR_JWT_TOKEN` with a valid JWT token from authentication
3. Adjust the base URL if your server runs on a different port
4. All dates should be in ISO format (YYYY-MM-DD)
5. Status values are enums: `EN_ATTENTE`, `EN_COURS`, `TERMINE`, `ANNULE`
6. Priority values for tasks: `BASSE`, `MOYENNE`, `HAUTE`

## Testing Script

Here's a bash script to test multiple endpoints:

```bash
#!/bin/bash

# Set your JWT token and base URL
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"
BASE_URL="http://localhost:8080/api/projets"

# Create a new project
echo "Creating new project..."
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/manager/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "nom": "Test Project",
    "description": "Test project description",
    "dateDebut": "2025-01-01",
    "dateFin": "2025-12-31",
    "budget": 50000.00,
    "statut": "EN_ATTENTE"
  }')

echo "Project created: $PROJECT_RESPONSE"

# Get all projects
echo "Getting all projects..."
curl -s -X GET "$BASE_URL/manager/my-projects" \
  -H "Authorization: Bearer $JWT_TOKEN"
```
