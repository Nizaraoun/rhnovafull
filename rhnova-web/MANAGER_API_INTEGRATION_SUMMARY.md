# Manager-Specific Leave Request API Integration - Implementation Summary

## Overview
Updated the leave request system to use the new role-based API endpoints that follow proper authorization patterns. Managers now use dedicated endpoints for team management while team members use their own endpoints.

## API Endpoints Integration

### Manager Endpoints Implemented

1. **Get Team Leave Requests**
   - **Endpoint**: `GET /api/conges/manager/team-requests`
   - **Usage**: Manager views leave requests from their team members
   - **Component**: `LeaveRequestsComponent.loadLeaveRequests()`

2. **Approve Team Member Request**
   - **Endpoint**: `PATCH /api/conges/manager/{leaveId}/approve`
   - **Parameters**: Optional comments via query parameter
   - **Usage**: Manager approves team member requests
   - **Component**: `LeaveRequestsComponent.approveRequest()`

3. **Reject Team Member Request**
   - **Endpoint**: `PATCH /api/conges/manager/{leaveId}/reject`
   - **Parameters**: Required comments via query parameter
   - **Usage**: Manager rejects team member requests with mandatory reason
   - **Component**: `LeaveRequestsComponent.rejectRequest()`

### Team Member Endpoints Implemented

1. **Create Leave Request**
   - **Endpoint**: `POST /api/conges/member/create`
   - **Usage**: Team member creates new leave request
   - **Component**: `RequestLeaveFormComponent.onSubmit()`

2. **Get My Requests** (Available for future use)
   - **Endpoint**: `GET /api/conges/member/my-requests`
   - **Usage**: Team member views their own requests

3. **Team Calendar** (Available for future use)
   - **Endpoint**: `GET /api/conges/member/team-calendar`
   - **Usage**: View approved team leaves for planning

## Service Updates (`LeaveManagementService`)

### New Manager Methods
```typescript
// Get team requests (replaces getAllLeaveRequests for managers)
getTeamLeaveRequests(): Observable<LeaveRequest[]>

// Manager-specific approve with optional comments
approveTeamMemberRequest(leaveId: string, comments?: string): Observable<LeaveRequest>

// Manager-specific reject with required comments
rejectTeamMemberRequest(leaveId: string, comments: string): Observable<LeaveRequest>

// Manager creates own requests
createManagerLeaveRequest(requestData: Omit<CreateLeaveRequest, 'employeId'>): Observable<LeaveRequest>

// Manager views own requests
getManagerOwnRequests(): Observable<LeaveRequest[]>
```

### New Team Member Methods
```typescript
// Team member creates requests (no employeId needed - auto-assigned)
createTeamMemberLeaveRequest(requestData: Omit<CreateLeaveRequest, 'employeId'>): Observable<LeaveRequest>

// Team member views own requests
getMyLeaveRequests(): Observable<LeaveRequest[]>

// Team member views team calendar
getTeamLeaveCalendar(): Observable<LeaveRequest[]>

// Team member updates own pending requests
updateMyLeaveRequest(leaveId: string, requestData: UpdateLeaveRequest): Observable<LeaveRequest>

// Team member cancels own pending requests
cancelMyLeaveRequest(leaveId: string): Observable<any>
```

### Technical Implementation Details

#### API Base URL Updated
- **Old**: `/api/hr/leaves`
- **New**: `/api/conges`

#### Query Parameter Handling
- Implemented `patchWithParams()` helper for PATCH requests with query parameters
- Handles optional comments for approvals
- Handles required comments for rejections

#### Error Handling Enhancement
- Explicit error typing with `(error: any)`
- Proper error propagation to UI components
- Graceful fallbacks with meaningful error messages

## Component Updates

### Manager Leave Requests Component

#### Data Loading
```typescript
// Before: Used general HR endpoint
this.leaveManagementService.getAllLeaveRequests()

// After: Uses manager-specific team endpoint
this.leaveManagementService.getTeamLeaveRequests()
```

#### Approval Flow
```typescript
// Enhanced with comments and proper error handling
approveRequest(request: LeaveRequest): void {
  const comments = 'Demande approuvée';
  this.leaveManagementService.approveTeamMemberRequest(request.id, comments)
    .subscribe({
      next: () => { /* Update UI and reload data */ },
      error: (error: any) => { /* Show error to user */ }
    });
}
```

#### Rejection Flow
```typescript
// Now requires mandatory reason
rejectRequest(request: LeaveRequest): void {
  const reason = prompt('Raison du refus (obligatoire):');
  if (!reason || reason.trim() === '') {
    alert('La raison du refus est obligatoire');
    return;
  }
  // ... API call with required reason
}
```

### Team Member Request Form Component

#### Request Creation
```typescript
// Before: Required employeId in request
const leaveRequest: CreateLeaveRequest = {
  employeId: this.getCurrentEmployeeId(),
  // ... other fields
};

// After: employeId auto-assigned by backend
const leaveRequest: Omit<CreateLeaveRequest, 'employeId'> = {
  // ... only required fields
};
this.leaveManagementService.createTeamMemberLeaveRequest(leaveRequest)
```

## Security & Authorization Benefits

### Role-Based Access Control
- **Managers**: Can only see and manage their team's requests
- **Team Members**: Can only see and manage their own requests
- **Automatic Assignment**: Employee and validator IDs assigned by backend based on authentication

### Improved Security
- No need to pass employee IDs in requests (prevents impersonation)
- Backend validates team relationships automatically
- Proper authorization checks for all operations

## Business Logic Improvements

### Automatic Workflow
1. **Team Member** creates request → Auto-assigned to their **Manager**
2. **Manager** creates request → Auto-assigned to **HR** for approval
3. **Proper Comments**: Approval comments optional, rejection comments mandatory

### Data Consistency
- Employee and validator information automatically populated
- Team relationships maintained by backend
- Consistent status mapping between API and UI

## Future Enhancements Available

### Manager Features
- View own leave requests (`getManagerOwnRequests()`)
- Create own leave requests (`createManagerLeaveRequest()`)

### Team Member Features
- View personal leave history (`getMyLeaveRequests()`)
- View team calendar for planning (`getTeamLeaveCalendar()`)
- Update pending requests (`updateMyLeaveRequest()`)
- Cancel pending requests (`cancelMyLeaveRequest()`)

### Additional Endpoints Ready
- Get specific request details (`getLeaveRequestDetails()`)
- Legacy endpoints maintained for backward compatibility

## Testing & Development

### Error Handling
- Comprehensive error catching and user feedback
- Fallback to mock data for development
- Clear error messages in French

### Logging & Debugging
- Enhanced console logging for API calls
- Request/response tracking
- Error state management

### Type Safety
- Proper TypeScript interfaces
- Generic type handling for HTTP operations
- Explicit error typing

This implementation provides a complete, role-based leave management system that follows proper authorization patterns and provides a smooth user experience for both managers and team members.
