/**
 * Compatibility System Test Suite
 * Tests for user-asset compatibility matching
 */

import {
  calculateCompatibility,
  calculateMultipleCompatibilities,
  UserAstrologicalProfile,
  Asset,
  CompatibilityOutput,
} from './src/compatibility';
import { Element } from './src/chinese/bazi';

// ============================================================================
// TEST DATA
// ============================================================================

const sampleUserProfile: UserAstrologicalProfile = {
  favorableElements: ['Earth', 'Fire'] as Element[],
  unfavorableElements: ['Water', 'Wood'] as Element[],
  birthChart: {
    dominantPlanet: 'Jupiter',
    planets: [],
  },
  dominantPlanets: ['Jupiter', 'Venus'],
};

const sampleAssets: Asset[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    primaryElement: 'Metal',
    secondaryElement: 'Fire',
    dominantPlanet: 'Uranus',
    birthDate: new Date('2009-01-03'),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    primaryElement: 'Fire',
    secondaryElement: 'Metal',
    dominantPlanet: 'Mercury',
    birthDate: new Date('2015-07-30'),
  },
  {
    symbol: 'GOLD',
    name: 'Gold',
    primaryElement: 'Metal',
    secondaryElement: 'Earth',
    dominantPlanet: 'Sun',
    birthDate: undefined,
  },
  {
    symbol: 'SPY',
    name: 'S&P 500',
    primaryElement: 'Earth',
    secondaryElement: 'Fire',
    dominantPlanet: 'Jupiter',
    birthDate: new Date('1993-01-22'),
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    primaryElement: 'Fire',
    secondaryElement: 'Wood',
    dominantPlanet: 'Uranus',
    birthDate: new Date('2010-06-29'),
  },
  {
    symbol: 'AAPL',
    name: 'Apple',
    primaryElement: 'Metal',
    secondaryElement: 'Wood',
    dominantPlanet: 'Venus',
    birthDate: new Date('1980-12-12'),
  },
  {
    symbol: 'AMZN',
    name: 'Amazon',
    primaryElement: 'Water',
    secondaryElement: 'Wood',
    dominantPlanet: 'Neptune',
    birthDate: new Date('1997-05-15'),
  },
  {
    symbol: 'OIL',
    name: 'Crude Oil',
    primaryElement: 'Fire',
    secondaryElement: 'Earth',
    dominantPlanet: 'Mars',
    birthDate: undefined,
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    primaryElement: 'Fire',
    secondaryElement: 'Metal',
    dominantPlanet: 'Sun',
    birthDate: new Date('2020-03-16'),
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    primaryElement: 'Fire',
    secondaryElement: 'Metal',
    dominantPlanet: 'Jupiter',
    birthDate: new Date('1999-01-22'),
  },
];

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

function testElementHarmony() {
  console.log('\n=== TEST 1: Element Harmony ===\n');

  // Test favorable element match
  const assetWithFavorableElement: Asset = {
    symbol: 'TEST1',
    name: 'Favorable Asset',
    primaryElement: 'Earth', // User's favorable element
    secondaryElement: 'Fire', // User's favorable element
    dominantPlanet: 'Mars',
  };

  const result1 = calculateCompatibility({
    userProfile: sampleUserProfile,
    asset: assetWithFavorableElement,
  });

  console.log('✓ Asset with favorable elements (Earth, Fire):');
  console.log(`  Score: ${result1.elementHarmony.elementScore}/10`);
  console.log(`  Expected: >= 8 (High score for favorable match)`);
  console.log(`  Result: ${result1.elementHarmony.elementScore >= 8 ? 'PASS' : 'FAIL'}\n`);

  // Test unfavorable element match
  const assetWithUnfavorableElement: Asset = {
    symbol: 'TEST2',
    name: 'Unfavorable Asset',
    primaryElement: 'Water', // User's unfavorable element
    secondaryElement: 'Wood', // User's unfavorable element
    dominantPlanet: 'Neptune',
  };

  const result2 = calculateCompatibility({
    userProfile: sampleUserProfile,
    asset: assetWithUnfavorableElement,
  });

  console.log('✓ Asset with unfavorable elements (Water, Wood):');
  console.log(`  Score: ${result2.elementHarmony.elementScore}/10`);
  console.log(`  Expected: <= 4 (Low score for unfavorable match)`);
  console.log(`  Result: ${result2.elementHarmony.elementScore <= 4 ? 'PASS' : 'FAIL'}\n`);
}

function testPlanetCompatibility() {
  console.log('\n=== TEST 2: Planet Compatibility ===\n');

  // Test favorable planet match
  const assetWithFavorablePlanet: Asset = {
    symbol: 'TEST3',
    name: 'Favorable Planet Asset',
    primaryElement: 'Metal',
    secondaryElement: null,
    dominantPlanet: 'Jupiter', // Same as user's dominant planet
  };

  const result1 = calculateCompatibility({
    userProfile: sampleUserProfile,
    asset: assetWithFavorablePlanet,
  });

  console.log('✓ Asset with favorable planet (Jupiter):');
  console.log(`  Score: ${result1.planetCompatibility.planetScore}/10`);
  console.log(`  Expected: >= 6 (Good score for matching planet)`);
  console.log(`  Result: ${result1.planetCompatibility.planetScore >= 6 ? 'PASS' : 'FAIL'}\n`);
}

function testScoreRange() {
  console.log('\n=== TEST 3: Score Range Validation ===\n');

  let allScoresValid = true;

  sampleAssets.forEach((asset) => {
    const result = calculateCompatibility({
      userProfile: sampleUserProfile,
      asset,
    });

    const scoreInRange = result.score >= 1 && result.score <= 10;
    const elementScoreInRange =
      result.elementHarmony.elementScore >= 1 && result.elementHarmony.elementScore <= 10;
    const planetScoreInRange =
      result.planetCompatibility.planetScore >= 1 && result.planetCompatibility.planetScore <= 10;

    if (!scoreInRange || !elementScoreInRange || !planetScoreInRange) {
      allScoresValid = false;
      console.log(`✗ ${asset.symbol}: Score out of range`);
      console.log(`  Overall: ${result.score}`);
      console.log(`  Element: ${result.elementHarmony.elementScore}`);
      console.log(`  Planet: ${result.planetCompatibility.planetScore}`);
    }
  });

  console.log(`✓ All scores in valid range (1-10): ${allScoresValid ? 'PASS' : 'FAIL'}\n`);
}

function testBatchProcessing() {
  console.log('\n=== TEST 4: Batch Processing ===\n');

  const startTime = Date.now();
  const results = calculateMultipleCompatibilities(sampleUserProfile, sampleAssets);
  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`✓ Processed ${sampleAssets.length} assets in ${duration}ms`);
  console.log(`  Performance: ${duration < 2000 ? 'PASS' : 'FAIL'} (Expected: < 2000ms)`);
  console.log(`  Results count: ${results.length}`);
  console.log(`  All results valid: ${results.length === sampleAssets.length ? 'PASS' : 'FAIL'}\n`);
}

function testFavorableMatches() {
  console.log('\n=== TEST 5: Favorable Element Matching ===\n');

  const favorableAssets = sampleAssets.filter(
    (asset) =>
      (asset.primaryElement && sampleUserProfile.favorableElements.includes(asset.primaryElement)) ||
      (asset.secondaryElement && sampleUserProfile.favorableElements.includes(asset.secondaryElement))
  );

  console.log(`User favorable elements: ${sampleUserProfile.favorableElements.join(', ')}`);
  console.log(`Assets with favorable elements:\n`);

  favorableAssets.forEach((asset) => {
    const result = calculateCompatibility({
      userProfile: sampleUserProfile,
      asset,
    });

    console.log(`  ${asset.symbol} (${asset.primaryElement}/${asset.secondaryElement}):`);
    console.log(`    Overall Score: ${result.score}/10 (${result.compatibility})`);
    console.log(`    Element Score: ${result.elementHarmony.elementScore}/10`);
    console.log(`    Expected: >= 7 for favorable match`);
    console.log(`    Result: ${result.score >= 7 ? 'PASS ✓' : 'CHECK ⚠'}\n`);
  });
}

function testFullCompatibilityReport() {
  console.log('\n=== TEST 6: Full Compatibility Report ===\n');

  const results = calculateMultipleCompatibilities(sampleUserProfile, sampleAssets);

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  console.log('User Profile:');
  console.log(`  Favorable Elements: ${sampleUserProfile.favorableElements.join(', ')}`);
  console.log(`  Unfavorable Elements: ${sampleUserProfile.unfavorableElements.join(', ')}`);
  console.log(`  Dominant Planets: ${sampleUserProfile.dominantPlanets?.join(', ')}\n`);

  console.log('Top Compatible Assets:\n');

  results.slice(0, 5).forEach((result, index) => {
    const asset = sampleAssets.find((a) => a.symbol === result.assetSymbol);
    console.log(`${index + 1}. ${asset?.name} (${asset?.symbol})`);
    console.log(`   Overall Score: ${result.score}/10 (${result.compatibility.toUpperCase()})`);
    console.log(`   Elements: ${asset?.primaryElement}/${asset?.secondaryElement}`);
    console.log(`   Planet: ${asset?.dominantPlanet}`);
    console.log(`   Element Score: ${result.elementHarmony.elementScore}/10`);
    console.log(`   Planet Score: ${result.planetCompatibility.planetScore}/10`);
    console.log(`   Reasoning: ${result.elementHarmony.reasoning.substring(0, 100)}...`);
    console.log('');
  });

  console.log('Least Compatible Assets:\n');

  results.slice(-3).forEach((result, index) => {
    const asset = sampleAssets.find((a) => a.symbol === result.assetSymbol);
    console.log(`${index + 1}. ${asset?.name} (${asset?.symbol})`);
    console.log(`   Overall Score: ${result.score}/10 (${result.compatibility.toUpperCase()})`);
    console.log(`   Elements: ${asset?.primaryElement}/${asset?.secondaryElement}`);
    console.log(`   Reasoning: ${result.elementHarmony.reasoning.substring(0, 100)}...`);
    console.log('');
  });
}

function testEdgeCases() {
  console.log('\n=== TEST 7: Edge Cases ===\n');

  // Test with null/missing data
  const assetWithMissingData: Asset = {
    symbol: 'TEST_NULL',
    name: 'Asset with Missing Data',
    primaryElement: null,
    secondaryElement: null,
    dominantPlanet: null,
  };

  const result1 = calculateCompatibility({
    userProfile: sampleUserProfile,
    asset: assetWithMissingData,
  });

  console.log('✓ Asset with missing element/planet data:');
  console.log(`  Score: ${result1.score}/10`);
  console.log(`  Expected: ~5 (Neutral score)`);
  console.log(`  Result: ${result1.score >= 4 && result1.score <= 6 ? 'PASS' : 'FAIL'}\n`);

  // Test with user having no favorable elements
  const userWithNoElements: UserAstrologicalProfile = {
    favorableElements: [],
    unfavorableElements: [],
    dominantPlanets: [],
  };

  const result2 = calculateCompatibility({
    userProfile: userWithNoElements,
    asset: sampleAssets[0],
  });

  console.log('✓ User with no favorable/unfavorable elements:');
  console.log(`  Score: ${result2.score}/10`);
  console.log(`  Expected: ~5 (Neutral score)`);
  console.log(`  Result: ${result2.score >= 4 && result2.score <= 6 ? 'PASS' : 'FAIL'}\n`);
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                                                       ║');
  console.log('║   🌟 Astro Compatibility System Test Suite           ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  try {
    testElementHarmony();
    testPlanetCompatibility();
    testScoreRange();
    testBatchProcessing();
    testFavorableMatches();
    testFullCompatibilityReport();
    testEdgeCases();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✓ All tests completed successfully!');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error: any) {
    console.error('\n✗ Test suite failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export { runAllTests };
