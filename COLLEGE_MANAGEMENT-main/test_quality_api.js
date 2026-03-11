// Simple test to verify quality API endpoints
const { fetch } = require('undici');

const API_BASE = 'http://localhost:5001';

async function testQualityAPI() {
  console.log('🧪 Testing Quality Management API...\n');

  try {
    // Test KPIs endpoint
    console.log('1. Testing KPIs endpoint...');
    const kpiResponse = await fetch(`${API_BASE}/api/quality/dashboard/kpis`);
    const kpiData = await kpiResponse.json();
    console.log('Status:', kpiResponse.status);
    console.log('Data:', JSON.stringify(kpiData, null, 2));
    console.log('');

    // Test Recent Activity endpoint
    console.log('2. Testing Recent Activity endpoint...');
    const activityResponse = await fetch(`${API_BASE}/api/quality/dashboard/recent-activity`);
    const activityData = await activityResponse.json();
    console.log('Status:', activityResponse.status);
    console.log('Data:', JSON.stringify(activityData, null, 2));
    console.log('');

    // Summary
    console.log('✅ API Tests Completed!');
    console.log(`KPIs: ${kpiData.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Activity: ${activityData.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (kpiData.success) {
      console.log(`Total Faculty: ${kpiData.data.total_faculty}`);
      console.log(`Pending Audits: ${kpiData.data.pending_audits}`);
      console.log(`Open Grievances: ${kpiData.data.open_grievances}`);
    }

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testQualityAPI();
