/**
 * Test pour trouver la meilleure stratégie pour avoir UNIQUEMENT des objets avec images
 */

const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Test 1: Search avec hasImages par département
async function testSearchByDepartment(deptId, deptName) {
  console.log(`\n🔍 Testing /search for dept ${deptId} (${deptName})...`);

  try {
    const response = await fetch(`${BASE_URL}/search?hasImages=true&departmentId=${deptId}&q=*`);
    const data = await response.json();

    if (data.objectIDs) {
      console.log(`   ✅ ${data.objectIDs.length.toLocaleString()} objects with images`);
      return data.objectIDs.length;
    } else {
      console.log(`   ⚠️  No results`);
      return 0;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return 0;
  }
}

// Test 2: Search avec hasImages SANS q
async function testSearchWithoutQ() {
  console.log(`\n🔍 Testing /search with hasImages=true (no q)...`);

  try {
    const response = await fetch(`${BASE_URL}/search?hasImages=true`);
    const data = await response.json();

    if (data.objectIDs) {
      console.log(`   ✅ ${data.objectIDs.length.toLocaleString()} objects`);
      return true;
    } else {
      console.log(`   ⚠️  No results`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 3: Search avec hasImages et q='' (vide)
async function testSearchEmptyQ() {
  console.log(`\n🔍 Testing /search with hasImages=true&q='' ...`);

  try {
    const response = await fetch(`${BASE_URL}/search?hasImages=true&q=`);
    const data = await response.json();

    if (data.objectIDs) {
      console.log(`   ✅ ${data.objectIDs.length.toLocaleString()} objects`);
      return data.objectIDs.length;
    } else {
      console.log(`   ⚠️  No results`);
      return 0;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return 0;
  }
}

// Test 4: Vérifier le ratio d'objets avec/sans images dans un département
async function testImageRatio() {
  console.log(`\n🔍 Testing image ratio in department 11 (European Paintings)...`);

  try {
    // Total objets
    const totalResponse = await fetch(`${BASE_URL}/objects?departmentIds=11`);
    const totalData = await totalResponse.json();
    const totalCount = totalData.objectIDs?.length || 0;

    // Objets avec images
    const withImagesResponse = await fetch(`${BASE_URL}/search?hasImages=true&departmentId=11&q=*`);
    const withImagesData = await withImagesResponse.json();
    const withImagesCount = withImagesData.objectIDs?.length || 0;

    const ratio = ((withImagesCount / totalCount) * 100).toFixed(1);

    console.log(`   📊 Total objects: ${totalCount.toLocaleString()}`);
    console.log(`   🖼️  With images: ${withImagesCount.toLocaleString()}`);
    console.log(`   📈 Ratio: ${ratio}% have images`);

    return { totalCount, withImagesCount, ratio };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing Image Strategies for Met Museum API\n');
  console.log('='.repeat(60));

  // Test différentes approches
  await testSearchWithoutQ();
  await testSearchEmptyQ();

  // Test par département avec q=*
  const departments = [
    [11, 'European Paintings'],
    [21, 'Modern Art'],
    [19, 'Photographs'],
    [6, 'Asian Art'],
    [9, 'Drawings and Prints'],
    [1, 'American Decorative Arts'],
  ];

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Testing /search?hasImages=true&q=* by department:');

  let totalWithImages = 0;
  for (const [id, name] of departments) {
    const count = await testSearchByDepartment(id, name);
    totalWithImages += count;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Total objects WITH images across 6 departments: ${totalWithImages.toLocaleString()}`);

  // Test ratio
  console.log('\n' + '='.repeat(60));
  await testImageRatio();

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Recommendation:');
  console.log('   Use /search?hasImages=true&departmentId=X&q=* for each department');
  console.log('   This ensures ALL objects returned have images\n');
}

runTests().catch(console.error);
