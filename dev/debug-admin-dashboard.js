/**
 * Debug script untuk admin dashboard API
 * Run dengan: node debug-admin-dashboard.js
 */

import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

async function debugAdminDashboard() {
  console.log('🔍 Debugging Admin Dashboard API\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      console.log(`   Server status: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ Server tidak dapat diakses: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }

    // Test 2: Check admin dashboard endpoint (tanpa auth)
    console.log('\n2. Testing admin dashboard endpoint (tanpa auth)...');
    try {
      const response = await fetch(`${BASE_URL}/api/admin/dashboard?limit=5`);
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      
      if (response.status === 500) {
        console.log('\n   ❌ Internal Server Error detected');
        console.log('   This indicates a problem in the backend code');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Test 3: Check database connection possibility
    console.log('\n3. Checking possible database connection...');
    try {
      const response = await fetch(`${BASE_URL}/api/debug/db-status`);
      console.log(`   DB Status check: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ Cannot check DB status: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Test 4: Check auth endpoint
    console.log('\n4. Testing auth endpoint...');
    try {
      const response = await fetch(`${BASE_URL}/api/auth/session`);
      console.log(`   Auth session status: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ Auth error: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log('\n📋 Next Steps untuk fix error:');
    console.log('1. Check terminal log untuk error detail');
    console.log('2. Verify database connection');
    console.log('3. Check Prisma client generation');
    console.log('4. Restart development server');

  } catch (error) {
    console.error('❌ Debug failed:', error instanceof Error ? error.message : String(error));
  }
}

debugAdminDashboard();
