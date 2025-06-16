#!/usr/bin/env node

/**
 * Test script for User Creation API
 * This script demonstrates how to create internal users using the API
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Sample data for testing
const testUsers = [
  {
    name: "maryem OS",
    email: "maryem@rh.com",
    password: "password123",
    role: "RESPONSABLERH"
  },
  {
    name: "John Manager",
    email: "john.manager@rhnova.com",
    password: "manager123",
    role: "MANAGER"
  },
  {
    name: "Alice Developer",
    email: "alice.dev@rhnova.com",
    password: "dev123456",
    role: "MEMBRE_EQUIPE"
  }
];

/**
 * Create a user using the internal user creation endpoint
 */
async function createInternalUser(userData, token) {
  try {
    console.log(`\n🔄 Creating user: ${userData.name}`);
    
    const response = await fetch(`${API_BASE_URL}/auth/create-internal-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ User created successfully: ${userData.name}`);
      console.log(`   ID: ${result.id || 'N/A'}`);
      console.log(`   Email: ${result.email}`);
      console.log(`   Role: ${result.role}`);
      return result;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to create user ${userData.name}: ${response.status} - ${error}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Network error creating user ${userData.name}:`, error.message);
    return null;
  }
}

/**
 * Get all users (for verification)
 */
async function getAllUsers(token) {
  try {
    console.log('\n📋 Fetching all users...');
    
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const users = await response.json();
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
      return users;
    } else {
      console.error(`❌ Failed to fetch users: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Network error fetching users:', error.message);
    return [];
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Starting User Creation API Test');
  console.log('=====================================');

  // Get JWT token from command line argument or prompt for it
  const token = process.argv[2] || process.env.JWT_TOKEN;
  
  if (!token) {
    console.log('\n⚠️  No JWT token provided!');
    console.log('Usage: node test-user-creation.js <jwt-token>');
    console.log('Or set JWT_TOKEN environment variable');
    console.log('\nTo get a token:');
    console.log('1. Login through the web application');
    console.log('2. Open browser DevTools > Application > Local Storage');
    console.log('3. Copy the value of "auth_token"');
    process.exit(1);
  }

  console.log(`🔑 Using JWT token: ${token.substring(0, 20)}...`);

  // Test creating users
  let successCount = 0;
  for (const userData of testUsers) {
    const result = await createInternalUser(userData, token);
    if (result) {
      successCount++;
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Summary: ${successCount}/${testUsers.length} users created successfully`);

  // Fetch and display all users
  await getAllUsers(token);

  console.log('\n✨ Test completed!');
}

// Run the test
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = { createInternalUser, getAllUsers };
