# PROJECT-TASK MANAGEMENT TEST SCRIPT (PowerShell)
# Run with: PowerShell -ExecutionPolicy Bypass -File test_project_task.ps1

$baseUrl = "http://localhost:8080"
$jwtToken = "YOUR_JWT_TOKEN_HERE"  # Replace with actual token

Write-Host "🚀 Testing Project-Task Management System" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Step 1: Login
Write-Host "`nStep 1: Login as Manager" -ForegroundColor Yellow
$loginData = @{
    email = "manager@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host $loginResponse
    
    # Extract token if available
    if ($loginResponse.token) {
        $jwtToken = $loginResponse.token
        Write-Host "🔑 JWT Token extracted: $($jwtToken.Substring(0, 20))..." -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 2: Create Project
Write-Host "`nStep 2: Create a New Project" -ForegroundColor Yellow
$projectData = @{
    nom = "E-commerce Platform"
    description = "Development of a modern e-commerce platform with React and Spring Boot"
    dateDebut = "2025-01-15"
    dateFin = "2025-06-30"
    statut = "PLANIFIE"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $jwtToken"
    'Content-Type' = "application/json"
}

try {
    $projectResponse = Invoke-RestMethod -Uri "$baseUrl/api/projets/manager/create" -Method Post -Body $projectData -Headers $headers
    Write-Host "✅ Project created successfully" -ForegroundColor Green
    Write-Host $projectResponse
    $projectId = $projectResponse.id
} catch {
    Write-Host "❌ Project creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Get Manager Projects
Write-Host "`nStep 3: Get All Manager Projects" -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "$baseUrl/api/projets/manager/my-projects" -Method Get -Headers @{Authorization = "Bearer $jwtToken"}
    Write-Host "✅ Projects retrieved successfully" -ForegroundColor Green
    Write-Host ($projects | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Failed to get projects: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Create Task
Write-Host "`nStep 4: Create Task for Project" -ForegroundColor Yellow
$taskData = @{
    titre = "Setup Database Schema"
    description = "Create and configure the database schema for the e-commerce platform"
    priorite = "HAUTE"
    dateDebut = "2025-01-20"
    dateFin = "2025-01-25"
    statut = "A_FAIRE"
    progression = 0
    projetId = $projectId
} | ConvertTo-Json

try {
    $taskResponse = Invoke-RestMethod -Uri "$baseUrl/api/taches/manager/create" -Method Post -Body $taskData -Headers $headers
    Write-Host "✅ Task created successfully" -ForegroundColor Green
    Write-Host $taskResponse
} catch {
    Write-Host "❌ Task creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Get Team Tasks
Write-Host "`nStep 5: Get Team Tasks" -ForegroundColor Yellow
try {
    $teamTasks = Invoke-RestMethod -Uri "$baseUrl/api/taches/manager/my-team-tasks" -Method Get -Headers @{Authorization = "Bearer $jwtToken"}
    Write-Host "✅ Team tasks retrieved successfully" -ForegroundColor Green
    Write-Host ($teamTasks | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Failed to get team tasks: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Get Team Details
Write-Host "`nStep 6: Get Team Details" -ForegroundColor Yellow
try {
    $teamDetails = Invoke-RestMethod -Uri "$baseUrl/api/team-member/my-team" -Method Get -Headers @{Authorization = "Bearer $jwtToken"}
    Write-Host "✅ Team details retrieved successfully" -ForegroundColor Green
    Write-Host ($teamDetails | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Failed to get team details: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 7: Get Team Projects
Write-Host "`nStep 7: Get Team Projects" -ForegroundColor Yellow
try {
    $teamProjects = Invoke-RestMethod -Uri "$baseUrl/api/team-member/my-team/projects" -Method Get -Headers @{Authorization = "Bearer $jwtToken"}
    Write-Host "✅ Team projects retrieved successfully" -ForegroundColor Green
    Write-Host ($teamProjects | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Failed to get team projects: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Test completed!" -ForegroundColor Green
Write-Host "Note: If you see authentication errors, make sure to:" -ForegroundColor Yellow
Write-Host "1. Start your Spring Boot application" -ForegroundColor Yellow
Write-Host "2. Use valid credentials in the login step" -ForegroundColor Yellow
Write-Host "3. Check that the JWT token is properly extracted" -ForegroundColor Yellow
