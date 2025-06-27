# Leave Management API Documentation

## Manager Endpoints

### Create Manager Leave Request
**POST** `/api/conges/manager/create`
- **Description**: Manager creates a leave request for themselves
- **Authorization**: Requires MANAGER role
- **Request Body**: DemandeCongedto (without employeId and validateurId)
- **Response**: DemandeCongedto with created leave request

### Get Manager's Own Leave Requests
**GET** `/api/conges/manager/my-requests`
- **Description**: Manager views their own leave requests
- **Authorization**: Requires MANAGER role
- **Response**: List of DemandeCongedto

### Get Team Leave Requests
**GET** `/api/conges/manager/team-requests`
- **Description**: Manager views leave requests from their team members
- **Authorization**: Requires MANAGER role
- **Response**: List of DemandeCongedto

### Approve Team Member Leave Request
**PATCH** `/api/conges/manager/{leaveId}/approve`
- **Description**: Manager approves a team member's leave request
- **Authorization**: Requires MANAGER role
- **Parameters**: 
  - `leaveId` (path): ID of the leave request
  - `comments` (query, optional): Approval comments
- **Response**: DemandeCongedto with updated status

### Reject Team Member Leave Request
**PATCH** `/api/conges/manager/{leaveId}/reject`
- **Description**: Manager rejects a team member's leave request
- **Authorization**: Requires MANAGER role
- **Parameters**: 
  - `leaveId` (path): ID of the leave request
  - `comments` (query, required): Rejection reason
- **Response**: DemandeCongedto with updated status

## Team Member Endpoints

### Create Team Member Leave Request
**POST** `/api/conges/member/create`
- **Description**: Team member creates a leave request
- **Authorization**: Requires MEMBRE_EQUIPE or MANAGER role
- **Request Body**: DemandeCongedto (without employeId and validateurId)
- **Response**: DemandeCongedto with created leave request

### Get My Leave Requests
**GET** `/api/conges/member/my-requests`
- **Description**: Team member views their own leave requests
- **Authorization**: Requires MEMBRE_EQUIPE or MANAGER role
- **Response**: List of DemandeCongedto

### Get Team Leave Calendar
**GET** `/api/conges/member/team-calendar`
- **Description**: Team member views approved leaves in their team
- **Authorization**: Requires MEMBRE_EQUIPE or MANAGER role
- **Response**: List of DemandeCongedto (only approved leaves)

### Update My Leave Request
**PUT** `/api/conges/member/{leaveId}/update`
- **Description**: Team member updates their own pending leave request
- **Authorization**: Requires MEMBRE_EQUIPE or MANAGER role
- **Parameters**: `leaveId` (path): ID of the leave request
- **Request Body**: DemandeCongedto with updated information
- **Response**: DemandeCongedto with updated leave request

### Cancel My Leave Request
**DELETE** `/api/conges/member/{leaveId}/cancel`
- **Description**: Team member cancels their own pending leave request
- **Authorization**: Requires MEMBRE_EQUIPE or MANAGER role
- **Parameters**: `leaveId` (path): ID of the leave request
- **Response**: 200 OK if successful

## Common Endpoints

### Get Leave Request Details
**GET** `/api/conges/details/{leaveId}`
- **Description**: Get leave request details by ID (with authorization check)
- **Authorization**: User must be the employee, validator, or HR
- **Parameters**: `leaveId` (path): ID of the leave request
- **Response**: DemandeCongedto

## Request/Response Models

### DemandeCongedto
```json
{
  "id": "string",
  "employeId": "string",
  "validateurId": "string",
  "dateDebut": "2025-01-01",
  "dateFin": "2025-01-05",
  "typeConge": "CONGE_PAYE",
  "statut": "EN_ATTENTE",
  "raison": "string",
  "nombreJours": 5,
  "dateCreation": "2025-01-01",
  "dateValidation": "2025-01-01",
  "commentaireValidateur": "string",
  "employeNom": "string",
  "employePrenom": "string",
  "validateurNom": "string",
  "validateurPrenom": "string"
}
```

### Status Values
- `EN_ATTENTE`: Pending approval
- `ACCEPTEE`: Approved
- `REFUSEE`: Rejected

## Business Rules

1. **Team Members**: Leave requests are automatically assigned to their team manager for approval
2. **Managers**: Leave requests need HR approval (validator will be set by HR)
3. **Authorization**: Users can only see and modify their own requests, plus requests they need to approve
4. **Modification**: Only pending requests can be updated or cancelled
5. **Team Calendar**: Only shows approved leaves for transparency without showing personal details

## Error Responses

All endpoints return appropriate HTTP status codes:
- `200 OK`: Success
- `400 Bad Request`: Invalid request data or business rule violation
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found

Error messages are returned in French and provide clear indication of the issue.
