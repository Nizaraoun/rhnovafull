@echo off
REM PROJECT-TASK MANAGEMENT QUICK TEST SCRIPT FOR WINDOWS
REM Run this script to test the new project-task structure

set BASE_URL=http://localhost:8080
set JWT_TOKEN=YOUR_JWT_TOKEN_HERE

echo ===========================================
echo 🚀 Testing Project-Task Management System
echo ===========================================
echo.

echo Step 1: Login as Manager
echo POST /api/auth/login
curl -X POST "%BASE_URL%/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"manager@example.com\", \"password\": \"password123\"}"
echo.
echo.

echo Step 2: Create a New Project
echo POST /api/projets/manager/create
curl -X POST "%BASE_URL%/api/projets/manager/create" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -d "{\"nom\": \"E-commerce Platform\", \"description\": \"Development of a modern e-commerce platform with React and Spring Boot\", \"dateDebut\": \"2025-01-15\", \"dateFin\": \"2025-06-30\", \"statut\": \"PLANIFIE\"}"
echo.
echo.

echo Step 3: Get All Manager Projects
echo GET /api/projets/manager/my-projects
curl -X GET "%BASE_URL%/api/projets/manager/my-projects" ^
  -H "Authorization: Bearer %JWT_TOKEN%"
echo.
echo.

echo Step 4: Create Task for Project
echo POST /api/taches/manager/create
curl -X POST "%BASE_URL%/api/taches/manager/create" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -d "{\"titre\": \"Setup Database Schema\", \"description\": \"Create and configure the database schema for the e-commerce platform\", \"priorite\": \"HAUTE\", \"dateDebut\": \"2025-01-20\", \"dateFin\": \"2025-01-25\", \"statut\": \"A_FAIRE\", \"progression\": 0, \"projetId\": \"PROJECT_ID_FROM_STEP_2\"}"
echo.
echo.

echo Step 5: Get Team Tasks
echo GET /api/taches/manager/my-team-tasks
curl -X GET "%BASE_URL%/api/taches/manager/my-team-tasks" ^
  -H "Authorization: Bearer %JWT_TOKEN%"
echo.
echo.

echo Step 6: Get Team Details
echo GET /api/team-member/my-team
curl -X GET "%BASE_URL%/api/team-member/my-team" ^
  -H "Authorization: Bearer %JWT_TOKEN%"
echo.
echo.

echo Step 7: Get Team Projects
echo GET /api/team-member/my-team/projects
curl -X GET "%BASE_URL%/api/team-member/my-team/projects" ^
  -H "Authorization: Bearer %JWT_TOKEN%"
echo.
echo.

echo ✅ Test completed! Check the responses above.
echo Note: Replace JWT_TOKEN with actual token from login response
echo.
pause
