// Test GraphQL Endpoint Accessibility
// Run this in browser console to debug connection issues

async function testGraphQLEndpoint() {
  console.log('🔍 Testing GraphQL Endpoint...');
  
  const baseURL = 'https://testauction.ankuaru.com';
  const graphqlURL = `${baseURL}/graphql`;
  const healthURL = `${baseURL}/health`;
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint:', healthURL);
    const healthResponse = await fetch(healthURL);
    const healthStatus = healthResponse.ok ? '✅ OK' : `❌ ${healthResponse.status}`;
    console.log(`Health Status: ${healthStatus}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health Response:', healthData);
    }
    
    // Test 2: GraphQL endpoint with simple query
    console.log('\n2. Testing GraphQL endpoint:', graphqlURL);
    
    const simpleQuery = {
      query: `
        query Health {
          health
        }
      `
    };
    
    const graphqlResponse = await fetch(graphqlURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    
    // Test 3: Check CORS headers
    console.log('\n3. CORS Headers:', graphqlResponse.headers.get('access-control-allow-origin'));
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('Possible causes:');
    console.log('- Backend server is not running');
    console.log('- Network connectivity issues');
    console.log('- CORS policy blocking requests');
    console.log('- Firewall or proxy blocking requests');
  }
}

// Run the test
testGraphQLEndpoint();
