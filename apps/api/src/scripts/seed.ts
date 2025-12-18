import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user with email auth
  const emailUser = await prisma.user.upsert({
    where: { email: 'test@astro.app' },
    update: {},
    create: {
      email: 'test@astro.app',
      username: 'testuser',
      passwordHash: await hashPassword('Test1234!'),
      primaryAuthMethod: 'email',
      emailVerified: true,
      subscriptionTier: 'pro',
      birthDate: new Date('1990-05-15'),
      birthTime: new Date('1970-01-01T14:30:00'),
      birthLocation: {
        lat: 40.7128,
        lng: -74.006,
        city: 'New York',
        country: 'USA',
      },
      birthTimezone: 'America/New_York',
    },
  });

  console.log('✅ Created email user:', emailUser.email);

  // Create user credits for email user
  await prisma.userCredits.upsert({
    where: { userId: emailUser.id },
    update: {},
    create: {
      userId: emailUser.id,
      creditsBalance: 100,
      creditsPurchasedLifetime: 100,
    },
  });

  // Create test user with wallet auth
  const walletUser = await prisma.user.upsert({
    where: { email: 'wallet@astro.app' },
    update: {},
    create: {
      email: 'wallet@astro.app',
      username: 'cryptouser',
      primaryAuthMethod: 'wallet',
      subscriptionTier: 'basic',
    },
  });

  console.log('✅ Created wallet user:', walletUser.email);

  // Create wallet connection for wallet user
  await prisma.walletConnection.upsert({
    where: {
      walletAddress_blockchain: {
        walletAddress: '7gxFq9YZVhXvuM5oKB3YvDxH1h2N8kL4pR6tS9uW2vX',
        blockchain: 'solana',
      },
    },
    update: {},
    create: {
      userId: walletUser.id,
      walletAddress: '7gxFq9YZVhXvuM5oKB3YvDxH1h2N8kL4pR6tS9uW2vX',
      blockchain: 'solana',
      walletType: 'phantom',
      isPrimary: true,
      verifiedAt: new Date(),
      label: 'Main Wallet',
    },
  });

  // Create user credits for wallet user
  await prisma.userCredits.upsert({
    where: { userId: walletUser.id },
    update: {},
    create: {
      userId: walletUser.id,
      creditsBalance: 50,
      creditsPurchasedLifetime: 50,
    },
  });

  // Create sample assets
  const btc = await prisma.asset.upsert({
    where: { symbol: 'BTC' },
    update: {},
    create: {
      symbol: 'BTC',
      name: 'Bitcoin',
      assetType: 'crypto',
      category: 'Layer1',
      birthDate: new Date('2009-01-03'),
      birthTime: new Date('1970-01-01T18:15:05'),
      birthDateSource: 'Genesis block timestamp',
      birthDateConfidence: 'high',
      primaryElement: 'water',
      secondaryElement: 'metal',
      chineseZodiac: 'Rat',
      sunSign: 'Capricorn',
      dominantPlanet: 'Uranus',
      elementReasoning:
        'Water represents flow and decentralization; Metal represents digital/technological nature',
      marketCap: 850000000000,
      currentPrice: 42500.0,
      isActive: true,
      isResearched: true,
    },
  });

  console.log('✅ Created asset:', btc.symbol);

  const eth = await prisma.asset.upsert({
    where: { symbol: 'ETH' },
    update: {},
    create: {
      symbol: 'ETH',
      name: 'Ethereum',
      assetType: 'crypto',
      category: 'Layer1',
      birthDate: new Date('2015-07-30'),
      birthTime: new Date('1970-01-01T15:26:13'),
      birthDateSource: 'Genesis block timestamp',
      birthDateConfidence: 'high',
      primaryElement: 'fire',
      secondaryElement: 'air',
      chineseZodiac: 'Goat',
      sunSign: 'Leo',
      dominantPlanet: 'Sun',
      elementReasoning:
        'Fire represents innovation and energy; Air represents smart contract flexibility',
      marketCap: 280000000000,
      currentPrice: 2300.0,
      isActive: true,
      isResearched: true,
    },
  });

  console.log('✅ Created asset:', eth.symbol);

  const sol = await prisma.asset.upsert({
    where: { symbol: 'SOL' },
    update: {},
    create: {
      symbol: 'SOL',
      name: 'Solana',
      assetType: 'crypto',
      category: 'Layer1',
      birthDate: new Date('2020-03-16'),
      birthTime: new Date('1970-01-01T12:00:00'),
      birthDateSource: 'Mainnet launch',
      birthDateConfidence: 'high',
      primaryElement: 'fire',
      secondaryElement: 'metal',
      chineseZodiac: 'Rat',
      sunSign: 'Pisces',
      dominantPlanet: 'Neptune',
      elementReasoning:
        'Fire represents speed and energy; Metal represents precision and technology',
      marketCap: 45000000000,
      currentPrice: 105.0,
      isActive: true,
      isResearched: true,
    },
  });

  console.log('✅ Created asset:', sol.symbol);

  // Create astrological profile for email user
  await prisma.userAstrologicalProfile.upsert({
    where: { userId: emailUser.id },
    update: {},
    create: {
      userId: emailUser.id,
      chineseZodiac: 'Horse',
      chineseElement: 'Metal',
      baziChart: {
        year: { stem: '庚', branch: '午' },
        month: { stem: '辛', branch: '巳' },
        day: { stem: '壬', branch: '寅' },
        hour: { stem: '丁', branch: '未' },
      },
      favorableElements: {
        primary: 'earth',
        secondary: 'fire',
      },
      unfavorableElements: {
        primary: 'water',
      },
      luckyNumbers: [2, 7, 9],
      luckyColors: ['yellow', 'red', 'brown'],
      sunSign: 'Taurus',
      moonSign: 'Leo',
      risingSign: 'Capricorn',
      birthChart: {
        sun: { sign: 'Taurus', degree: 24.5, house: 5 },
        moon: { sign: 'Leo', degree: 12.3, house: 8 },
        mercury: { sign: 'Gemini', degree: 5.7, house: 6 },
      },
      dominantElements: {
        earth: 40,
        fire: 30,
        water: 20,
        air: 10,
      },
      chartPatterns: ['grand_trine', 'stellium'],
    },
  });

  console.log('✅ Created astrological profile for email user');

  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('Test Accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email User:');
  console.log('  Email: test@astro.app');
  console.log('  Password: Test1234!');
  console.log('  Tier: pro');
  console.log('  Credits: 100');
  console.log('');
  console.log('Wallet User:');
  console.log('  Email: wallet@astro.app');
  console.log('  Wallet: 7gxFq9YZVhXvuM5oKB3YvDxH1h2N8kL4pR6tS9uW2vX');
  console.log('  Blockchain: solana');
  console.log('  Tier: basic');
  console.log('  Credits: 50');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
