# Task Management System Documentation

## Overview
This document describes the enhanced task management system that implements role-based access control for managers and team members.

## Key Features

### For Managers (Role: MANAGER)
1. **Create Tasks**: Managers can create new tasks for their team
2. **Assign Tasks**: Managers can assign tasks to team members in their team
3. **Monitor Progress**: Managers can view all tasks assigned to their team members
4. **Filter by Status**: Managers can filter team tasks by status (A_FAIRE, EN_COURS, TERMINEE)
5. **Evaluate Tasks**: Managers can evaluate completed tasks (tasks with status TERMINEE)

### For Team Members (Role: MEMBRE_EQUIPE)
1. **View Own Tasks**: Team members can see tasks assigned to them
2. **View Team Tasks**: Team members can see all tasks in their team (to monitor other members' progress)
3. **Update Progress**: Team members can update the progress percentage (0-100%) of their own tasks
4. **Update Status**: Team members can change the status of their own tasks
5. **Auto Status Update**: Status automatically updates based on progress (0% = A_FAIRE, 1-99% = EN_COURS, 100% = TERMINEE)

## API Endpoints

### Manager Endpoints

#### Create Task
```http
POST /api/taches/manager/create
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "titre": "Task Title",
    "description": "Task description",
    "priorite": "HAUTE",
    "dateDebut": "2025-06-24",
    "dateFin": "2025-06-30"
}
```

#### Assign Task to Team Member
```http
POST /api/taches/manager/assign/{taskId}/{memberId}
Authorization: Bearer {jwt_token}
```

#### Get All Team Tasks
```http
GET /api/taches/manager/my-team-tasks
Authorization: Bearer {jwt_token}
```

#### Get Team Tasks by Status
```http
GET /api/taches/manager/team-tasks/status/{status}
Authorization: Bearer {jwt_token}
```
Available statuses: `A_FAIRE`, `EN_COURS`, `TERMINEE`

#### Evaluate Completed Task
```http
PATCH /api/taches/manager/{taskId}/evaluate?evaluation=8
Authorization: Bearer {jwt_token}
```

### Team Member Endpoints

#### Get My Assigned Tasks
```http
GET /api/taches/member/my-tasks
Authorization: Bearer {jwt_token}
```

#### Get All Team Tasks (to see others' progress)
```http
GET /api/taches/member/team-tasks
Authorization: Bearer {jwt_token}
```

#### Update My Task Progress
```http
PATCH /api/taches/member/{taskId}/progress?progression=75
Authorization: Bearer {jwt_token}
```

#### Update My Task Status
```http
PATCH /api/taches/member/{taskId}/status?status=EN_COURS
Authorization: Bearer {jwt_token}
```

### Common Endpoints

#### Get Task Details
```http
GET /api/taches/details/{taskId}
Authorization: Bearer {jwt_token}
```

## Data Models

### Task DTO (Tachedto)
```json
{
    "id": "string",
    "titre": "string",
    "description": "string",
    "priorite": "BASSE|MOYENNE|HAUTE",
    "dateDebut": "2025-06-24",
    "dateFin": "2025-06-30",
    "statut": "A_FAIRE|EN_COURS|TERMINEE",
    "membreId": "string",
    "membreName": "string",
    "progression": 75,
    "evaluation": 8,
    "createdById": "string",
    "createdByName": "string",
    "dateCreation": "2025-06-24T10:00:00",
    "lastUpdated": "2025-06-24T15:30:00"
}
```

### Priority Levels
- `BASSE`: Low priority
- `MOYENNE`: Medium priority
- `HAUTE`: High priority

### Task Status
- `A_FAIRE`: To do (0% progress)
- `EN_COURS`: In progress (1-99% progress)
- `TERMINEE`: Completed (100% progress)

## Security & Access Control

### Authentication
- All endpoints require JWT authentication
- JWT token must be passed in the Authorization header: `Bearer {token}`

### Authorization Rules

#### Managers can:
- Create tasks for their team
- Assign tasks only to members of their own team
- View all tasks assigned to their team members
- Evaluate completed tasks from their team
- Filter team tasks by status

#### Team Members can:
- View tasks assigned to them
- View all tasks in their team (read-only for others' tasks)
- Update progress and status only for their own tasks
- Cannot create new tasks or assign tasks to others

#### General Rules:
- Users can only access tasks related to their team
- Task creators are automatically tracked
- Task updates are timestamped
- Progress and status are automatically synchronized

## Workflow Example

1. **Manager creates a task**:
   ```http
   POST /api/taches/manager/create
   {
     "titre": "Develop Login Feature",
     "description": "Implement user authentication system",
     "priorite": "HAUTE",
     "dateDebut": "2025-06-24",
     "dateFin": "2025-06-28"
   }
   ```

2. **Manager assigns task to team member**:
   ```http
   POST /api/taches/manager/assign/64f7b1a2c3e4d5f6789012ab/64f7b1a2c3e4d5f6789012cd
   ```

3. **Team member starts working and updates progress**:
   ```http
   PATCH /api/taches/member/64f7b1a2c3e4d5f6789012ab/progress?progression=25
   ```
   Status automatically changes to `EN_COURS`

4. **Team member completes the task**:
   ```http
   PATCH /api/taches/member/64f7b1a2c3e4d5f6789012ab/progress?progression=100
   ```
   Status automatically changes to `TERMINEE`

5. **Manager evaluates the completed task**:
   ```http
   PATCH /api/taches/manager/64f7b1a2c3e4d5f6789012ab/evaluate?evaluation=9
   ```

## Error Handling

The system includes comprehensive error handling for:
- Unauthorized access attempts
- Invalid task assignments (outside team)
- Attempts to modify others' tasks
- Invalid status transitions
- Missing authentication

Common error responses:
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid data or business rule violation
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Task or user not found

## Legacy Endpoints

The original endpoints are maintained for backward compatibility but should be replaced with the new role-based endpoints:
- `/api/taches` (legacy endpoints)
- `/api/taches/legacy` (explicitly legacy)

It's recommended to migrate to the new endpoints for better security and functionality.
