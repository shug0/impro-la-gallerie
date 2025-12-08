/**
 * Tests pour le service Met Museum API
 * Pour exécuter: node --loader ts-node/esm src/services/__tests__/metMuseumApi.test.ts
 * Ou avec un test runner comme Jest/Vitest
 */

const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Test 1: Vérifier que l'endpoint /departments fonctionne
async function testDepartmentsEndpoint() {
  console.log('\n🧪 Test 1: Fetching departments...');

  try {
    const response = await fetch(`${BASE_URL}/departments`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!data.departments || !Array.isArray(data.departments)) {
      throw new Error('Invalid departments response');
    }

    console.log(`✅ Test 1 passed: ${data.departments.length} departments found`);
    console.log('   Departments:', data.departments.slice(0, 3).map((d: any) => d.displayName).join(', ') + '...');
    return true;
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
    return false;
  }
}

// Test 2: Vérifier que l'endpoint /objects avec départements fonctionne
async function testObjectsWithDepartments() {
  console.log('\n🧪 Test 2: Fetching objects with departments (11|21)...');

  try {
    const response = await fetch(`${BASE_URL}/objects?departmentIds=11|21`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!data.objectIDs || !Array.isArray(data.objectIDs)) {
      throw new Error('Invalid objects response');
    }

    console.log(`✅ Test 2 passed: ${data.objectIDs.length.toLocaleString()} objects found`);
    console.log(`   Sample IDs: ${data.objectIDs.slice(0, 5).join(', ')}...`);
    return data.objectIDs[0]; // Return first ID for next test
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
    return null;
  }
}

// Test 3: Vérifier qu'on peut récupérer les détails d'un objet
async function testObjectDetails(objectId: number) {
  console.log(`\n🧪 Test 3: Fetching details for object ${objectId}...`);

  try {
    const response = await fetch(`${BASE_URL}/objects/${objectId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log(`✅ Test 3 passed: Object details retrieved`);
    console.log(`   Title: ${data.title || 'N/A'}`);
    console.log(`   Artist: ${data.artistDisplayName || 'Unknown'}`);
    console.log(`   Has image: ${data.primaryImage ? 'Yes' : 'No'}`);
    console.log(`   Department: ${data.department || 'N/A'}`);
    return true;
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
    return false;
  }
}

// Test 4: Vérifier l'endpoint /search avec hasImages
async function testSearchWithImages() {
  console.log('\n🧪 Test 4: Searching objects with images...');

  try {
    const response = await fetch(`${BASE_URL}/search?hasImages=true&q=painting`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!data.objectIDs || !Array.isArray(data.objectIDs)) {
      throw new Error('Invalid search response');
    }

    console.log(`✅ Test 4 passed: ${data.objectIDs.length.toLocaleString()} results found`);
    return true;
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
    return false;
  }
}

// Test 5: Comparer /objects vs /search
async function testCompareEndpoints() {
  console.log('\n🧪 Test 5: Comparing /objects vs /search endpoints...');

  try {
    // Fetch avec /objects
    const objectsResponse = await fetch(`${BASE_URL}/objects?departmentIds=11|21|19|6|9|1`);
    const objectsData = await objectsResponse.json();

    // Fetch avec /search
    const searchResponse = await fetch(`${BASE_URL}/search?hasImages=true&q=painting`);
    const searchData = await searchResponse.json();

    console.log(`   /objects with 6 departments: ${objectsData.objectIDs?.length.toLocaleString() || 0} objects`);
    console.log(`   /search (hasImages + painting): ${searchData.objectIDs?.length.toLocaleString() || 0} objects`);
    console.log(`✅ Test 5 passed: Comparison complete`);
    return true;
  } catch (error) {
    console.error('❌ Test 5 failed:', error);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Running Met Museum API Tests\n');
  console.log('='.repeat(50));

  const test1 = await testDepartmentsEndpoint();
  const objectId = await testObjectsWithDepartments();
  const test3 = objectId ? await testObjectDetails(objectId) : false;
  const test4 = await testSearchWithImages();
  const test5 = await testCompareEndpoints();

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`   Test 1 (Departments): ${test1 ? '✅' : '❌'}`);
  console.log(`   Test 2 (Objects): ${objectId ? '✅' : '❌'}`);
  console.log(`   Test 3 (Object Details): ${test3 ? '✅' : '❌'}`);
  console.log(`   Test 4 (Search): ${test4 ? '✅' : '❌'}`);
  console.log(`   Test 5 (Comparison): ${test5 ? '✅' : '❌'}`);

  const allPassed = test1 && objectId && test3 && test4 && test5;
  console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}\n`);
}

// Exécuter si lancé directement
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

export { runAllTests };
