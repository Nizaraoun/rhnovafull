#!/bin/bash

# PROJECT-TASK MANAGEMENT QUICK TEST SCRIPT
# Run this script to test the new project-task structure

BASE_URL="http://localhost:8080"

echo "🚀 Testing Project-Task Management System"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Login as Manager${NC}"
echo "POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "password123"
  }')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract JWT token (assuming it's in the response)
# JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
# For now, use placeholder
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

echo -e "${YELLOW}Step 2: Create a New Project${NC}"
echo "POST /api/projets/manager/create"
CREATE_PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/projets/manager/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "nom": "E-commerce Platform",
    "description": "Development of a modern e-commerce platform with React and Spring Boot",
    "dateDebut": "2025-01-15",
    "dateFin": "2025-06-30",
    "statut": "PLANIFIE"
  }')

echo "Response: $CREATE_PROJECT_RESPONSE"
echo ""

echo -e "${YELLOW}Step 3: Get All Manager Projects${NC}"
echo "GET /api/projets/manager/my-projects"
curl -s -X GET "$BASE_URL/api/projets/manager/my-projects" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}Step 4: Create Task for Project${NC}"
echo "POST /api/taches/manager/create"
CREATE_TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/taches/manager/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "titre": "Setup Database Schema",
    "description": "Create and configure the database schema for the e-commerce platform",
    "priorite": "HAUTE",
    "dateDebut": "2025-01-20",
    "dateFin": "2025-01-25",
    "statut": "A_FAIRE",
    "progression": 0,
    "projetId": "PROJECT_ID_FROM_STEP_2"
  }')

echo "Response: $CREATE_TASK_RESPONSE"
echo ""

echo -e "${YELLOW}Step 5: Get Team Tasks${NC}"
echo "GET /api/taches/manager/my-team-tasks"
curl -s -X GET "$BASE_URL/api/taches/manager/my-team-tasks" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}Step 6: Get Team Details${NC}"
echo "GET /api/team-member/my-team"
curl -s -X GET "$BASE_URL/api/team-member/my-team" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}Step 7: Get Team Projects${NC}"
echo "GET /api/team-member/my-team/projects"
curl -s -X GET "$BASE_URL/api/team-member/my-team/projects" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✅ Test completed! Check the responses above.${NC}"
echo -e "${YELLOW}Note: Replace JWT_TOKEN with actual token from login response${NC}"
