/**
 * Test script for prediction engines
 * Run with: npx ts-node test-predictions.ts
 */

import {
  generateMacroPrediction,
  generateTimingPrediction,
  generateTarotPrediction,
  generateIChingPrediction,
  generateBirthChart,
} from './src/index';

console.log('🔮 Testing Astro Prediction Engines\n');
console.log('═'.repeat(80));

// ============================================================================
// Test 1: Macro Prediction
// ============================================================================
console.log('\n📊 TEST 1: MACRO PREDICTION FOR 2026');
console.log('─'.repeat(80));

try {
  const macroResult = generateMacroPrediction({
    year: 2026,
    assetClasses: ['crypto', 'US_stocks', 'HK_stocks', 'DeFi', 'RWA'],
    method: 'combined',
  });

  console.log(`Year: ${macroResult.year}`);
  console.log(`Chinese Year: ${macroResult.chineseYearAnimal} (${macroResult.chineseYearElement})`);
  console.log(`Overall Market Energy: ${macroResult.overallMarketEnergy}\n`);

  console.log('Asset Class Predictions:');
  macroResult.predictions.forEach(p => {
    console.log(`  ${p.assetClass}: ${p.score}/10`);
    console.log(`    ${p.reasoning}`);
  });

  console.log(`\n✅ Best Performers: ${macroResult.bestPerformers.join(', ')}`);
  console.log(`❌ Worst Performers: ${macroResult.worstPerformers.join(', ')}`);

  console.log('\n✓ Macro prediction test PASSED');
} catch (error) {
  console.error('✗ Macro prediction test FAILED:', error);
}

// ============================================================================
// Test 2: Timing Prediction
// ============================================================================
console.log('\n\n⏰ TEST 2: TIMING PREDICTION FOR BITCOIN');
console.log('─'.repeat(80));

try {
  // Create a sample birth chart for Bitcoin (genesis block: Jan 3, 2009)
  const btcBirthDate = new Date(2009, 0, 3);
  const btcBirthChart = generateBirthChart(
    btcBirthDate,
    18,
    15,
    {
      latitude: 40.7128, // New York (hypothetical)
      longitude: -74.0060,
      name: 'New York, NY',
    }
  );

  const timingResult = generateTimingPrediction({
    assetId: 'btc-test',
    assetSymbol: 'BTC',
    assetBirthChart: btcBirthChart,
    timeframe: 'medium_term',
  });

  console.log(`Asset: ${timingResult.assetSymbol}`);
  console.log(`Current Score: ${timingResult.currentScore}/10`);
  console.log(`\nInterpretation: ${timingResult.currentInterpretation.substring(0, 200)}...`);

  console.log(`\n📈 Favorable Periods: ${timingResult.favorablePeriods.length}`);
  if (timingResult.favorablePeriods.length > 0) {
    const first = timingResult.favorablePeriods[0];
    console.log(`  Next: ${first.start.toDateString()} - ${first.end.toDateString()}`);
    console.log(`  Score: ${first.score}/10`);
  }

  console.log(`\n📉 Challenging Periods: ${timingResult.challengingPeriods.length}`);

  console.log(`\n🎯 Best Entry Date: ${timingResult.bestEntryDate.toDateString()}`);

  console.log('\n✓ Timing prediction test PASSED');
} catch (error) {
  console.error('✗ Timing prediction test FAILED:', error);
}

// ============================================================================
// Test 3: Tarot Prediction
// ============================================================================
console.log('\n\n🃏 TEST 3: TAROT PREDICTION');
console.log('─'.repeat(80));

try {
  const tarotResult = generateTarotPrediction({
    question: 'Should I invest in Bitcoin now?',
    userId: 'test-user-123',
    spread: 'three_card',
    context: {
      position: 'long',
      assetSymbol: 'BTC',
      amount: 1000,
    },
  });

  console.log(`Question: ${tarotResult.question}`);
  console.log(`Spread: ${tarotResult.spread}`);
  console.log(`Confidence Score: ${tarotResult.confidenceScore}/10\n`);

  console.log('Cards:');
  tarotResult.cards.forEach(c => {
    console.log(`  ${c.position}:`);
    console.log(`    ${c.card.name} ${c.card.reversed ? '(Reversed)' : ''}`);
    console.log(`    ${c.card.reversed ? c.card.financialReversed : c.card.financialInterpretation}`);
  });

  console.log(`\n📖 Overall: ${tarotResult.overallInterpretation.substring(0, 150)}...`);
  console.log(`\n💡 Action Advice: ${tarotResult.actionAdvice.substring(0, 100)}...`);

  console.log('\n✓ Tarot prediction test PASSED');
} catch (error) {
  console.error('✗ Tarot prediction test FAILED:', error);
}

// ============================================================================
// Test 4: I Ching Prediction
// ============================================================================
console.log('\n\n☯️  TEST 4: I CHING PREDICTION');
console.log('─'.repeat(80));

try {
  const ichingResult = generateIChingPrediction({
    question: 'Is this a good time to enter the market?',
    userId: 'test-user-123',
    context: {
      position: 'long',
      assetSymbol: 'ETH',
      amount: 5000,
    },
  });

  console.log(`Question: ${ichingResult.question}`);
  console.log(`Hexagram: ${ichingResult.hexagram.chineseName} - ${ichingResult.hexagram.englishName}`);
  console.log(`Binary: ${ichingResult.hexagram.binarySequence}`);
  console.log(`Confidence Score: ${ichingResult.confidenceScore}/10\n`);

  console.log(`Judgement: ${ichingResult.hexagram.judgement}`);
  console.log(`\nInterpretation: ${ichingResult.hexagram.interpretation}`);
  console.log(`\nFinancial Guidance: ${ichingResult.hexagram.financialGuidance}`);

  if (ichingResult.hexagram.changingLines.length > 0) {
    console.log(`\n🔄 Changing Lines: ${ichingResult.hexagram.changingLines.join(', ')}`);
    if (ichingResult.futureHexagram) {
      console.log(`   Transforms to: ${ichingResult.futureHexagram.chineseName} - ${ichingResult.futureHexagram.englishName}`);
    }
  }

  if (ichingResult.keyDates && ichingResult.keyDates.length > 0) {
    console.log(`\n📅 Key Dates:`);
    ichingResult.keyDates.forEach(date => {
      console.log(`   ${date.toDateString()}`);
    });
  }

  console.log(`\n💡 Action Advice: ${ichingResult.actionAdvice.substring(0, 100)}...`);

  console.log('\n✓ I Ching prediction test PASSED');
} catch (error) {
  console.error('✗ I Ching prediction test FAILED:', error);
}

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '═'.repeat(80));
console.log('✅ ALL PREDICTION ENGINE TESTS COMPLETED');
console.log('═'.repeat(80));
console.log('\nNext steps:');
console.log('1. Test API endpoints with curl or Postman');
console.log('2. Initialize user credits in database');
console.log('3. Research asset birth dates and add to database');
console.log('4. Integrate with frontend');
console.log('\n');
