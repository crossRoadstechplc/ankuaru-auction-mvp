// Network Diagnostic Tool
// Run this in browser console to diagnose connectivity issues

async function diagnoseConnectivity() {
  console.log('🔍 Diagnosing GraphQL Connectivity...');
  
  const baseURL = 'https://testauction.ankuaru.com';
  const graphqlURL = `${baseURL}/graphql`;
  const restURL = `${baseURL}/health`;
  
  console.log(`Base URL: ${baseURL}`);
  console.log(`GraphQL URL: ${graphqlURL}`);
  console.log(`Health URL: ${restURL}`);
  
  try {
    // Test 1: Basic connectivity to base URL
    console.log('\n1. Testing base URL connectivity...');
    const baseResponse = await fetch(baseURL, { method: 'HEAD' });
    console.log(`Base URL Status: ${baseResponse.ok ? '✅ OK' : `❌ ${baseResponse.status}`}`);
    
    // Test 2: REST health endpoint
    console.log('\n2. Testing REST health endpoint...');
    const healthResponse = await fetch(restURL);
    console.log(`Health Status: ${healthResponse.ok ? '✅ OK' : `❌ ${healthResponse.status}`}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health Response:', healthData);
    }
    
    // Test 3: GraphQL endpoint with simple query
    console.log('\n3. Testing GraphQL endpoint...');
    const simpleQuery = {
      query: `query Health { health }`
    };
    
    const graphqlResponse = await fetch(graphqlURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simpleQuery)
    });
    
    console.log(`GraphQL Status: ${graphqlResponse.ok ? '✅ OK' : `❌ ${graphqlResponse.status}`}`);
    
    if (graphqlResponse.ok) {
      const graphqlData = await graphqlResponse.json();
      console.log('GraphQL Response:', graphqlData);
    } else {
      const errorText = await graphqlResponse.text();
      console.log('GraphQL Error:', errorText);
    }
    
    // Test 4: Check CORS headers
    console.log('\n4. Checking CORS headers...');
    console.log('Access-Control-Allow-Origin:', graphqlResponse.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Methods:', graphqlResponse.headers.get('access-control-allow-methods'));
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('\nPossible Solutions:');
    console.log('1. Check if the GraphQL backend is running');
    console.log('2. Verify the base URL is correct');
    console.log('3. Check for network connectivity issues');
    console.log('4. Look for CORS policy issues');
    console.log('5. Check if firewall/proxy is blocking requests');
  }
}

// Run the diagnostic
diagnoseConnectivity();
