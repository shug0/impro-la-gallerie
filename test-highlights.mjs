/**
 * Test pour comparer hasImages vs isHighlight
 */

const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

const departments = [
  [11, 'European Paintings'],
  [21, 'Modern Art'],
  [19, 'Photographs'],
  [6, 'Asian Art'],
  [9, 'Drawings and Prints'],
  [1, 'American Decorative Arts'],
];

// Test avec hasImages seulement
async function testWithImages() {
  console.log('\n🖼️  Testing /search with hasImages=true only...\n');

  let total = 0;
  for (const [id, name] of departments) {
    try {
      const response = await fetch(`${BASE_URL}/search?hasImages=true&departmentId=${id}&q=*`);
      const data = await response.json();
      const count = data.objectIDs?.length || 0;
      total += count;
      console.log(`   ${name}: ${count.toLocaleString()}`);
    } catch (error) {
      console.log(`   ${name}: Error`);
    }
  }

  console.log(`\n   📊 TOTAL: ${total.toLocaleString()} objects`);
  return total;
}

// Test avec isHighlight ET hasImages
async function testWithHighlights() {
  console.log('\n⭐ Testing /search with isHighlight=true + hasImages=true...\n');

  let total = 0;
  for (const [id, name] of departments) {
    try {
      const response = await fetch(`${BASE_URL}/search?hasImages=true&isHighlight=true&departmentId=${id}&q=*`);
      const data = await response.json();
      const count = data.objectIDs?.length || 0;
      total += count;
      console.log(`   ${name}: ${count.toLocaleString()}`);
    } catch (error) {
      console.log(`   ${name}: Error`);
    }
  }

  console.log(`\n   📊 TOTAL: ${total.toLocaleString()} objects`);
  return total;
}

// Test isHighlight SANS département (toute la collection)
async function testHighlightsGlobal() {
  console.log('\n🌟 Testing /search with isHighlight=true globally (no dept filter)...\n');

  try {
    const response = await fetch(`${BASE_URL}/search?hasImages=true&isHighlight=true&q=*`);
    const data = await response.json();
    const count = data.objectIDs?.length || 0;
    console.log(`   📊 TOTAL: ${count.toLocaleString()} highlighted objects`);
    return count;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return 0;
  }
}

async function runComparison() {
  console.log('🚀 Comparing Search Strategies\n');
  console.log('='.repeat(60));

  const withImages = await testWithImages();

  console.log('\n' + '='.repeat(60));

  const withHighlights = await testWithHighlights();

  console.log('\n' + '='.repeat(60));

  const globalHighlights = await testHighlightsGlobal();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY:\n');
  console.log(`   1️⃣  hasImages only (6 depts):        ${withImages.toLocaleString()} objects`);
  console.log(`   2️⃣  hasImages + isHighlight (6 depts): ${withHighlights.toLocaleString()} objects`);
  console.log(`   3️⃣  hasImages + isHighlight (global):  ${globalHighlights.toLocaleString()} objects`);

  const reductionDept = ((1 - withHighlights / withImages) * 100).toFixed(1);
  const reductionGlobal = ((1 - globalHighlights / withImages) * 100).toFixed(1);

  console.log(`\n   📉 Reduction with highlights (by dept): -${reductionDept}%`);
  console.log(`   📉 Reduction with highlights (global): -${reductionGlobal}%`);

  console.log('\n💡 Recommendation:');
  if (withHighlights > 1000) {
    console.log(`   ✅ Use isHighlight=true: ${withHighlights.toLocaleString()} curated artworks is plenty`);
  } else {
    console.log(`   ⚠️  Use hasImages only: ${withImages.toLocaleString()} for maximum variety`);
  }
  console.log('');
}

runComparison().catch(console.error);
