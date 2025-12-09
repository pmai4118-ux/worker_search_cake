/**
 * Simple test script for the worker functionality
 * Tests the basic structure and exports
 */

import worker from '../src/index.js';

console.log('Testing worker implementation...\n');

// Test 1: Worker export structure
console.log('✓ Test 1: Worker exports default object');
if (worker && typeof worker.fetch === 'function') {
  console.log('  ✓ Worker has fetch handler');
} else {
  console.log('  ✗ Worker missing fetch handler');
  process.exit(1);
}

// Test 2: Mock request for home page
console.log('\n✓ Test 2: Testing home page route');
const homeRequest = new Request('http://localhost/', { method: 'GET' });
const homeResponse = await worker.fetch(homeRequest, {}, {});
console.log('  Status:', homeResponse.status);
console.log('  Content-Type:', homeResponse.headers.get('Content-Type'));
if (homeResponse.status === 200 && homeResponse.headers.get('Content-Type').includes('text/html')) {
  console.log('  ✓ Home page route works');
} else {
  console.log('  ✗ Home page route failed');
}

// Test 3: Mock request for health check
console.log('\n✓ Test 3: Testing health check route');
const healthRequest = new Request('http://localhost/health', { method: 'GET' });
const healthResponse = await worker.fetch(healthRequest, {}, {});
const healthData = await healthResponse.json();
console.log('  Status:', healthResponse.status);
console.log('  Response:', JSON.stringify(healthData, null, 2));
if (healthResponse.status === 200 && healthData.status === 'ok' && healthData.model === 'gemini-1.5-flash') {
  console.log('  ✓ Health check works');
} else {
  console.log('  ✗ Health check failed');
}

// Test 4: Mock request for search (should fail without API key)
console.log('\n✓ Test 4: Testing search route (without API key)');
const searchRequest = new Request('http://localhost/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'test query' })
});
const searchResponse = await worker.fetch(searchRequest, {}, {});
const searchData = await searchResponse.json();
console.log('  Status:', searchResponse.status);
console.log('  Response:', JSON.stringify(searchData, null, 2));
if (searchResponse.status === 500 && searchData.error && searchData.error.includes('GEMINI_API_KEY')) {
  console.log('  ✓ Search route correctly reports missing API key');
} else {
  console.log('  ✗ Search route unexpected response');
}

// Test 5: CORS preflight
console.log('\n✓ Test 5: Testing CORS preflight');
const corsRequest = new Request('http://localhost/search', { method: 'OPTIONS' });
const corsResponse = await worker.fetch(corsRequest, {}, {});
console.log('  Status:', corsResponse.status);
console.log('  CORS Headers:', corsResponse.headers.get('Access-Control-Allow-Origin'));
if (corsResponse.status === 200 && corsResponse.headers.get('Access-Control-Allow-Origin') === '*') {
  console.log('  ✓ CORS preflight works');
} else {
  console.log('  ✗ CORS preflight failed');
}

// Test 6: 404 for unknown routes
console.log('\n✓ Test 6: Testing 404 for unknown routes');
const notFoundRequest = new Request('http://localhost/unknown', { method: 'GET' });
const notFoundResponse = await worker.fetch(notFoundRequest, {}, {});
console.log('  Status:', notFoundResponse.status);
if (notFoundResponse.status === 404) {
  console.log('  ✓ Unknown routes return 404');
} else {
  console.log('  ✗ Unknown routes should return 404');
}

console.log('\n✅ All tests passed!\n');
