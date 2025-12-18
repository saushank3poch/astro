/**
 * Test Birth Chart Generation
 * Test script to verify astrological calculations
 */

import { generateBirthChart, calculateCompatibility } from './src/index';

console.log('='.repeat(80));
console.log('ASTRO CORE - Birth Chart Engine Test');
console.log('='.repeat(80));
console.log();

// Test Case 1: Sample User
console.log('TEST CASE 1: Sample User Birth Chart');
console.log('-'.repeat(80));

const testUser = {
  name: 'Test User',
  birthDate: new Date('1990-05-15'),
  birthHour: 14,
  birthMinute: 30,
  location: {
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
    country: 'USA',
  },
};

console.log('Input:');
console.log(`  Name: ${testUser.name}`);
console.log(`  Birth Date: ${testUser.birthDate.toDateString()}`);
console.log(`  Birth Time: ${testUser.birthHour}:${testUser.birthMinute}`);
console.log(`  Location: ${testUser.location.city}, ${testUser.location.country}`);
console.log();

const userChart = generateBirthChart(
  testUser.birthDate,
  testUser.birthHour,
  testUser.birthMinute,
  testUser.location
);

console.log('Chinese Astrology:');
console.log(`  Zodiac Animal: ${userChart.chinese.zodiacAnimal}`);
console.log(`  Day Master (Element): ${userChart.chinese.baziChart.dayMaster}`);
console.log(`  Dominant Element: ${userChart.chinese.baziChart.dominantElement}`);
console.log(`  Favorable Elements: ${userChart.chinese.baziChart.favorableElements.join(', ')}`);
console.log(`  Unfavorable Elements: ${userChart.chinese.baziChart.unfavorableElements.join(', ')}`);
console.log(`  Lucky Numbers: ${userChart.chinese.luckyNumbers.join(', ')}`);
console.log(`  Lucky Colors: ${userChart.chinese.luckyColors.slice(0, 5).join(', ')}`);
console.log();

console.log('Western Astrology:');
console.log(`  Sun Sign: ${userChart.western.sunSign}`);
console.log(`  Moon Sign: ${userChart.western.moonSign}`);
console.log(`  Rising Sign: ${userChart.western.risingSign}`);
console.log(`  Dominant Element: ${userChart.western.dominantElement}`);
console.log(`  Dominant Modality: ${userChart.western.dominantModality}`);
console.log(`  Dominant Planet: ${userChart.western.dominantPlanet || 'N/A'}`);
console.log();

console.log('Planetary Positions:');
userChart.western.planets.slice(0, 5).forEach((planet) => {
  console.log(`  ${planet.planet}: ${planet.sign} at ${planet.degree.toFixed(2)}°${planet.retrograde ? ' (R)' : ''}`);
});
console.log();

console.log('='.repeat(80));
console.log();

// Test Case 2: Sample Asset (Bitcoin)
console.log('TEST CASE 2: Sample Asset Birth Chart (Bitcoin)');
console.log('-'.repeat(80));

const testAsset = {
  name: 'Bitcoin (BTC)',
  birthDate: new Date('2009-01-03'), // Bitcoin genesis block
  birthHour: 18,
  birthMinute: 15,
  location: {
    latitude: 51.5074, // London (Satoshi's location unknown, using symbolic)
    longitude: -0.1278,
    city: 'London',
    country: 'UK',
  },
};

console.log('Input:');
console.log(`  Name: ${testAsset.name}`);
console.log(`  Birth Date: ${testAsset.birthDate.toDateString()}`);
console.log(`  Birth Time: ${testAsset.birthHour}:${testAsset.birthMinute}`);
console.log(`  Location: ${testAsset.location.city}, ${testAsset.location.country}`);
console.log();

const assetChart = generateBirthChart(
  testAsset.birthDate,
  testAsset.birthHour,
  testAsset.birthMinute,
  testAsset.location
);

console.log('Chinese Astrology:');
console.log(`  Zodiac Animal: ${assetChart.chinese.zodiacAnimal}`);
console.log(`  Day Master (Element): ${assetChart.chinese.baziChart.dayMaster}`);
console.log(`  Dominant Element: ${assetChart.chinese.baziChart.dominantElement}`);
console.log(`  Lucky Numbers: ${assetChart.chinese.luckyNumbers.join(', ')}`);
console.log();

console.log('Western Astrology:');
console.log(`  Sun Sign: ${assetChart.western.sunSign}`);
console.log(`  Moon Sign: ${assetChart.western.moonSign}`);
console.log(`  Rising Sign: ${assetChart.western.risingSign}`);
console.log();

console.log('='.repeat(80));
console.log();

// Test Case 3: Compatibility
console.log('TEST CASE 3: User-Asset Compatibility');
console.log('-'.repeat(80));

const compatibility = calculateCompatibility(userChart, assetChart);

console.log(`Overall Compatibility: ${compatibility.overall}/100`);
console.log();

console.log('Chinese Compatibility:');
console.log(`  Zodiac Compatibility: ${compatibility.chinese.zodiacCompatibility}/100`);
console.log(`  Element Compatibility: ${compatibility.chinese.elementCompatibility}/100`);
console.log();

console.log('Western Compatibility:');
console.log(`  Sun Sign Compatibility: ${compatibility.western.sunSignCompatibility}/100`);
console.log(`  Moon Sign Compatibility: ${compatibility.western.moonSignCompatibility}/100`);
console.log(`  Rising Sign Compatibility: ${compatibility.western.risingSignCompatibility}/100`);
console.log();

// Interpretation
if (compatibility.overall >= 75) {
  console.log('Interpretation: Highly favorable alignment - strong investment potential');
} else if (compatibility.overall >= 60) {
  console.log('Interpretation: Positive indicators with some challenges - moderate potential');
} else if (compatibility.overall >= 45) {
  console.log('Interpretation: Mixed signals - requires careful analysis');
} else {
  console.log('Interpretation: Challenging aspects - approach with caution');
}

console.log();
console.log('='.repeat(80));
console.log('TEST COMPLETED SUCCESSFULLY!');
console.log('='.repeat(80));
