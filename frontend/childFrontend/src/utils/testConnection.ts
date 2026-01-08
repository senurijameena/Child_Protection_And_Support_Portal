import { API_BASE_URL } from './constants';

export interface ConnectionTestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const testBackendConnection = async (): Promise<ConnectionTestResult[]> => {
  const results: ConnectionTestResult[] = [];

  try {
    const response = await fetch(`${API_BASE_URL}/api/cases/public/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    results.push({
      testName: 'Backend Connectivity',
      success: response.ok,
      message: response.ok 
        ? `✅ Backend is reachable (Status: ${response.status})`
        : `❌ Backend returned error (Status: ${response.status})`,
      data: response.ok ? await response.json() : null,
    });
  } catch (error: any) {
    results.push({
      testName: 'Backend Connectivity',
      success: false,
      message: '❌ Cannot reach backend',
      error: error.message,
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    results.push({
      testName: 'CORS Configuration',
      success: !!corsHeader,
      message: corsHeader 
        ? `✅ CORS is configured (Origin: ${corsHeader})`
        : '❌ CORS headers missing',
      data: { corsHeader },
    });
  } catch (error: any) {
    results.push({
      testName: 'CORS Configuration',
      success: false,
      message: '❌ CORS test failed',
      error: error.message,
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/statistics/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    results.push({
      testName: 'Statistics API',
      success: response.ok,
      message: response.ok 
        ? '✅ Statistics endpoint working'
        : `❌ Statistics endpoint failed (Status: ${response.status})`,
      data: response.ok ? await response.json() : null,
    });
  } catch (error: any) {
    results.push({
      testName: 'Statistics API',
      success: false,
      message: '❌ Statistics endpoint error',
      error: error.message,
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'wrongpassword'
      }),
    });
    
    const data = await response.json();
    results.push({
      testName: 'Auth Endpoint',
      success: response.status === 200 || response.status === 401,
      message: response.status === 200 
        ? '✅ Auth endpoint working'
        : response.status === 401
        ? '✅ Auth endpoint working (expected 401 for wrong credentials)'
        : `❌ Unexpected status: ${response.status}`,
      data: data,
    });
  } catch (error: any) {
    results.push({
      testName: 'Auth Endpoint',
      success: false,
      message: '❌ Auth endpoint error',
      error: error.message,
    });
  }

  return results;
};

export const logConnectionTest = async () => {
  console.log('🔍 Testing Backend Connection...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log('─'.repeat(50));
  
  const results = await testBackendConnection();
  
  results.forEach(result => {
    console.log(`${result.message}`);
    if (result.error) {
      console.error('   Error:', result.error);
    }
  });
  
  console.log('─'.repeat(50));
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  console.log(`✅ ${successCount}/${totalCount} tests passed`);
  
  return results;
};

