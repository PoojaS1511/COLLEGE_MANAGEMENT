/**
 * Authentication Debugging Utility
 * Run this in browser console to diagnose auth issues
 */

export const debugAuth = () => {
  console.group('🔍 Authentication Debug Info');
  
  // Check localStorage tokens
  console.group('📦 LocalStorage Tokens');
  const accessToken = localStorage.getItem('access_token');
  const legacyToken = localStorage.getItem('token');
  const allKeys = Object.keys(localStorage);
  
  console.log('access_token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT FOUND');
  console.log('token (legacy):', legacyToken ? `${legacyToken.substring(0, 20)}...` : 'NOT FOUND');
  console.log('All localStorage keys:', allKeys.filter(k => k.includes('auth') || k.includes('token') || k.includes('supabase')));
  console.groupEnd();
  
  // Check Supabase auth keys
  console.group('🔐 Supabase Auth Keys');
  const supabaseKeys = allKeys.filter(k => k.startsWith('sb-'));
  supabaseKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`${key}:`, {
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000).toISOString() : 'N/A'
        });
      } catch (e) {
        console.log(`${key}:`, 'Could not parse');
      }
    }
  });
  console.groupEnd();
  
  // Test API call
  console.group('🌐 Test API Call');
  const testToken = accessToken || legacyToken;
  if (testToken) {
    console.log('Making test call to /api/health');
    fetch('/api/health', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(r => {
      console.log('Response status:', r.status);
      return r.json();
    })
    .then(data => {
      console.log('Response data:', data);
    })
    .catch(err => {
      console.error('Request failed:', err);
    });
  } else {
    console.error('❌ No token found to test with!');
  }
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    hasAccessToken: !!accessToken,
    hasLegacyToken: !!legacyToken,
    supabaseKeys: supabaseKeys.length,
    recommendation: !accessToken && !legacyToken ? 'Please login again' : 'Check console output above'
  };
};

// Auto-run when imported in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.debugAuth = debugAuth;
  console.log('💡 Auth debug utility loaded. Run debugAuth() in console to check authentication.');
}

export default debugAuth;