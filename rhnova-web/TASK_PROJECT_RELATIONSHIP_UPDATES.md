# Task-Project Relationship Updates

## Overview
Updated the application to support the new architecture where tasks are now associated with projects instead of being standalone entities.

## Changes Made

### 1. Manager Service Updates (`src/app/manager/services/manager.service.ts`)

#### Updated Endpoints:
- **Create Task in Project**: `/manager/{projectId}/tasks/create`
- **Get Project Tasks**: `/{projectId}/tasks`
- **Get Manager's Projects**: `/manager/my-projects`
- **Delete Project**: `/manager/{projectId}`
- **Assign Project to Team**: `/manager/{projectId}/assign-team/{teamId}`
- **Update Project Progression**: `/{projectId}/update-progression`

#### Interface Updates:
- `ManagerTask` interface now requires `projetId` field
- Added `projetName` field for display purposes
- `CreateTaskRequest` interface remains the same but tasks are now created within project context

#### New Methods:
- `createTaskInProject(projectId: string, task: CreateTaskRequest)` - Creates a task within a specific project
- `getProjectTasks(projectId: string)` - Gets all tasks for a specific project

#### Deprecated Methods:
- `createTask()` - Replaced by `createTaskInProject()`
- `assignTask()` - Task assignment now done via `assigneeId` in task creation
- Various other standalone task methods are marked as legacy

### 2. Manager Projects Component Updates (`src/app/manager/projects/manager-projects.component.ts`)

#### New Features:
- Added task management within projects
- Created task form for creating tasks in projects
- Added methods to view project tasks
- Added task status and priority management

#### New Methods:
- `openCreateTaskModal(project: Project)` - Opens modal to create task in project
- `createTaskInProject()` - Creates task using the new API
- `openProjectTasksModal(project: Project)` - Shows all tasks for a project
- `loadProjectTasks(projectId: string)` - Loads tasks for a specific project
- Task utility methods for status and priority display

#### UI Updates:
- Added "Create Task" button to project cards
- Added "View Tasks" button to project cards
- Added task creation modal
- Added project tasks viewing modal
- Enhanced project cards with task management actions

### 3. Manager Projects HTML Updates (`src/app/manager/projects/manager-projects.component.html`)

#### New UI Elements:
- **Create Task Modal**: Form to create tasks within projects
- **Project Tasks Modal**: View all tasks for a specific project
- **Enhanced Project Actions**: Added task management buttons
- **Task Display**: Shows task details with status, priority, and progress
- **Task Assignment**: Dropdown to assign tasks to team members

### 4. Team Member Tasks Component (`src/app/team-member/tasks/my-tasks.component.ts`)

#### Already Prepared:
- Task interface already includes `projectId` and `projectName` fields
- Component ready to display project information with tasks
- No changes needed - already compatible with new architecture

### 5. Manager Dashboard Component (`src/app/manager/dashboard/manager-dashboard.component.ts`)

#### TODO Updates Needed:
- Update to aggregate task statistics from all projects
- Modify task creation to work with project-based system
- Update task loading to fetch from all manager's projects

## New Workflow

### For Managers:
1. **Create Projects First**: Use the existing project creation functionality
2. **Create Tasks in Projects**: Use the new task creation modal within project cards
3. **Assign Tasks**: Select team members when creating tasks via `assigneeId`
4. **View Project Tasks**: Use the "View Tasks" button on project cards
5. **Manage Task Progress**: Update tasks through the project context

### For Team Members:
1. **View Tasks**: Tasks now display associated project information
2. **Update Progress**: Same as before, but with project context
3. **Complete Tasks**: Mark tasks as completed within project scope

## API Integration

The service now properly integrates with your new endpoints:

```typescript
// Create task in project
createTaskInProject(projectId: string, task: CreateTaskRequest): Observable<ManagerTask>

// Get all tasks for a project
getProjectTasks(projectId: string): Observable<ManagerTask[]>

// Updated project management
deleteProject(projectId: string): Observable<void>
assignProjectToTeam(projectId: string, teamId: string): Observable<void>
updateProjectProgression(projectId: string): Observable<Project>
```

## Benefits of New Architecture

1. **Better Organization**: Tasks are now properly organized under projects
2. **Improved Context**: Users can see which project each task belongs to
3. **Enhanced Tracking**: Project progression can be calculated based on task completion
4. **Cleaner Structure**: Tasks have a clear hierarchy (Project → Tasks → Team Members)
5. **Better Reporting**: Can generate project-specific reports and analytics

## Migration Notes

- Legacy task methods are marked as deprecated but still available for backward compatibility
- Existing functionality should continue to work while new features use the project-based approach
- The dashboard component needs updating to aggregate tasks from all projects
- Consider adding project filtering in task views for better user experience

## Testing Recommendations

1. Test task creation within projects
2. Verify task assignment to team members
3. Test project task viewing and management
4. Ensure team members can see project context in their tasks
5. Test project deletion and its impact on associated tasks
