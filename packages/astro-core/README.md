# Astro Core

Astrological calculation library for Chinese and Western astrology. Provides birth chart generation, compatibility analysis, and comprehensive astrological insights.

## Features

### Chinese Astrology
- **Chinese Zodiac**: 12 animal signs based on lunar calendar
- **Bazi (Four Pillars)**: Year, Month, Day, and Hour pillars with Heavenly Stems and Earthly Branches
- **Five Elements**: Wood, Fire, Earth, Metal, Water relationships and analysis
- **Lucky Numbers**: Personalized lucky numbers based on Bazi and zodiac
- **Element Compatibility**: Calculate harmony between different elements

### Western Astrology
- **Sun/Moon/Rising Signs**: Tropical zodiac sign calculations
- **Planetary Positions**: Precise calculations using astronomy-engine
- **House System**: Placidus house system (12 houses)
- **Aspects**: Major and minor planetary aspects (conjunction, trine, square, etc.)
- **Element Analysis**: Fire, Earth, Air, Water distribution
- **Modality Analysis**: Cardinal, Fixed, Mutable distribution

## Installation

```bash
npm install @astro/astro-core
```

## Quick Start

```typescript
import { generateBirthChart, calculateCompatibility } from '@astro/astro-core';

// Generate a birth chart
const birthChart = generateBirthChart(
  new Date('1990-05-15'),  // Birth date
  14,                       // Birth hour (24-hour format)
  30,                       // Birth minute
  {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'USA',
  }
);

console.log('Chinese Zodiac:', birthChart.chinese.zodiacAnimal);
console.log('Sun Sign:', birthChart.western.sunSign);
console.log('Moon Sign:', birthChart.western.moonSign);
console.log('Rising Sign:', birthChart.western.risingSign);
```

## API Reference

### Main Functions

#### `generateBirthChart(birthDate, birthHour, birthMinute, location)`

Generates a complete birth chart with both Chinese and Western astrology calculations.

**Parameters:**
- `birthDate` (Date): Birth date
- `birthHour` (number): Birth hour in 24-hour format (0-23)
- `birthMinute` (number): Birth minute (0-59)
- `location` (object):
  - `latitude` (number): Latitude in degrees
  - `longitude` (number): Longitude in degrees
  - `city` (string, optional): City name
  - `country` (string, optional): Country name

**Returns:** `CompleteBirthChart` object containing:

```typescript
{
  birthDate: Date,
  birthTime: { hour: number, minute: number },
  location: GeoLocation,

  chinese: {
    zodiacAnimal: string,        // e.g., "Horse", "Dragon"
    baziChart: BaziChart,         // Four Pillars data
    luckyNumbers: number[],       // Array of lucky numbers
    unluckyNumbers: number[],     // Array of unlucky numbers
    luckyColors: string[],        // Array of lucky colors
  },

  western: {
    sunSign: ZodiacSign,          // e.g., "Taurus", "Leo"
    moonSign: ZodiacSign,
    risingSign: ZodiacSign,
    planets: PlanetaryPosition[], // All planetary positions
    houses: HouseSystem,          // 12 houses with cusps
    aspects: Aspect[],            // Planetary aspects
    dominantPlanet: string,
    elementDistribution: object,  // Fire, Earth, Air, Water counts
    dominantElement: string,
    dominantModality: string,
  }
}
```

#### `calculateCompatibility(chart1, chart2)`

Calculates compatibility between two birth charts.

**Parameters:**
- `chart1` (CompleteBirthChart): First birth chart
- `chart2` (CompleteBirthChart): Second birth chart

**Returns:**

```typescript
{
  overall: number,              // Overall compatibility score (0-100)
  chinese: {
    zodiacCompatibility: number,
    elementCompatibility: number,
  },
  western: {
    sunSignCompatibility: number,
    moonSignCompatibility: number,
    risingSignCompatibility: number,
  }
}
```

### Chinese Astrology Functions

#### `calculateChineseZodiac(birthDate)`
Returns the Chinese zodiac animal based on birth date.

#### `calculateBaziChart(birthDate, birthHour)`
Calculates the Four Pillars (Bazi) chart.

#### `calculateLuckyNumbers(baziChart, zodiacAnimal)`
Calculates lucky numbers based on Bazi and zodiac.

#### `getElementRelationships(element)`
Returns production and destruction relationships for an element.

### Western Astrology Functions

#### `calculateSunSign(birthDate)`
Returns the tropical zodiac sun sign.

#### `calculateAllPlanets(date, houses)`
Calculates positions of all 10 planets.

#### `calculateHouses(date, latitude, longitude)`
Calculates the 12 houses using Placidus system.

#### `calculateAllAspects(positions)`
Calculates all aspects between planets.

## Examples

### Example 1: Personal Birth Chart

```typescript
import { generateBirthChart } from '@astro/astro-core';

const myChart = generateBirthChart(
  new Date('1990-05-15'),
  14,
  30,
  {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'USA',
  }
);

console.log('=== Chinese Astrology ===');
console.log('Animal:', myChart.chinese.zodiacAnimal);
console.log('Element:', myChart.chinese.baziChart.dayMaster);
console.log('Lucky Numbers:', myChart.chinese.luckyNumbers);

console.log('\n=== Western Astrology ===');
console.log('Sun:', myChart.western.sunSign);
console.log('Moon:', myChart.western.moonSign);
console.log('Rising:', myChart.western.risingSign);
console.log('Dominant Element:', myChart.western.dominantElement);
```

### Example 2: Asset Birth Chart (Cryptocurrency)

```typescript
import { generateBirthChart } from '@astro/astro-core';

// Bitcoin genesis block
const btcChart = generateBirthChart(
  new Date('2009-01-03'),
  18,
  15,
  {
    latitude: 51.5074,
    longitude: -0.1278,
    city: 'London',
    country: 'UK',
  }
);

console.log('Bitcoin Astrology:');
console.log('Zodiac:', btcChart.chinese.zodiacAnimal);
console.log('Element:', btcChart.chinese.baziChart.dayMaster);
console.log('Sun Sign:', btcChart.western.sunSign);
```

### Example 3: Compatibility Analysis

```typescript
import { generateBirthChart, calculateCompatibility } from '@astro/astro-core';

const userChart = generateBirthChart(
  new Date('1990-05-15'),
  14,
  30,
  { latitude: 40.7128, longitude: -74.0060 }
);

const assetChart = generateBirthChart(
  new Date('2009-01-03'),
  18,
  15,
  { latitude: 51.5074, longitude: -0.1278 }
);

const compatibility = calculateCompatibility(userChart, assetChart);

console.log('Overall Compatibility:', compatibility.overall, '/100');
console.log('Chinese Zodiac:', compatibility.chinese.zodiacCompatibility, '/100');
console.log('Elements:', compatibility.chinese.elementCompatibility, '/100');
console.log('Sun Signs:', compatibility.western.sunSignCompatibility, '/100');

// Interpretation
if (compatibility.overall >= 75) {
  console.log('Strong alignment - highly favorable');
} else if (compatibility.overall >= 60) {
  console.log('Good compatibility with some challenges');
} else {
  console.log('Proceed with caution');
}
```

## Testing

Run the test script:

```bash
npm run build
npx tsx test-birth-chart.ts
```

This will generate sample birth charts and demonstrate the library's capabilities.

## Architecture

```
astro-core/
├── src/
│   ├── chinese/          # Chinese astrology modules
│   │   ├── bazi.ts       # Four Pillars calculator
│   │   ├── zodiac.ts     # Chinese zodiac
│   │   ├── elements.ts   # Five elements logic
│   │   └── lucky-numbers.ts
│   ├── western/          # Western astrology modules
│   │   ├── zodiac.ts     # Tropical zodiac
│   │   ├── planets.ts    # Planetary positions
│   │   ├── houses.ts     # House system
│   │   └── aspects.ts    # Planetary aspects
│   ├── utils/            # Utility functions
│   │   ├── date-utils.ts
│   │   └── coordinates.ts
│   └── index.ts          # Main exports
├── dist/                 # Compiled output
└── test-birth-chart.ts   # Test script
```

## Dependencies

- **astronomy-engine**: For precise planetary position calculations
- **TypeScript**: For type safety and development

## Algorithms & References

### Chinese Astrology
- **Bazi Calculation**: Based on sexagenary cycle (60-year cycle of Heavenly Stems and Earthly Branches)
- **Chinese New Year**: Uses lunar calendar calculations
- **Element Theory**: Five Elements production and destruction cycles

### Western Astrology
- **Planetary Positions**: Uses astronomy-engine for precise geocentric coordinates
- **House System**: Placidus house division (most common in Western astrology)
- **Aspects**: Traditional major aspects (0°, 60°, 90°, 120°, 180°) with standard orbs

## Accuracy

- **Planetary Positions**: Accurate to within 0.1° using JPL ephemeris data
- **Chinese Calendar**: Simplified lunar calendar calculation (for production, use dedicated library)
- **Time Zones**: Requires accurate timezone data for precise house/rising sign calculations

## Limitations

- Chinese New Year calculation uses simplified approximation (for years not in lookup table)
- Rising sign calculation is simplified (full calculation requires precise obliquity and nutation)
- Bazi month pillar uses approximate solar terms

For production use with high accuracy requirements, consider:
- Integrating Swiss Ephemeris for ultimate precision
- Using dedicated Chinese calendar library
- Implementing full IAU standards for house calculations

## License

MIT

## Contributing

This is a core library for the Astro Prediction Platform. For contributions, please follow the project's coding standards and include tests for new features.
