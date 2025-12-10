# Astro Mobile App

React Native mobile application built with Expo.

## Features

- Native iOS and Android apps
- In-app purchases (subscriptions)
- Push notifications
- Offline support
- Biometric authentication
- All prediction types
- Personalized dashboard
- Daily astro widget

## Tech Stack

- Expo SDK 50+
- React Native
- TypeScript
- Expo Router (navigation)
- RevenueCat (IAP)
- Expo Notifications
- Expo SecureStore

## Getting Started

```bash
cd apps/mobile
npm install
npx expo start
```

## Run on Devices

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Physical device (Expo Go)
npx expo start
# Scan QR code with Expo Go app
```

## Environment Variables

Create `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_REVENUECAT_IOS_KEY=...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=...
```

## Project Structure

```
mobile/
├── app/              # Expo Router
│   ├── (tabs)/      # Tab navigation
│   ├── (auth)/      # Auth stack
│   └── _layout.tsx  # Root layout
├── components/      # React components
├── hooks/           # Custom hooks
├── services/        # API services
├── store/           # State management
├── utils/           # Utilities
├── assets/          # Images, fonts, etc.
└── app.json         # Expo config
```

## Subscription Tiers

- **Free**: 3 predictions/month
- **Basic** ($9.99/mo): 50 predictions/month
- **Pro** ($29.99/mo): Unlimited predictions + alerts

## Build & Deploy

```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Development

```bash
npm run start         # Start Expo dev server
npm run android       # Run on Android
npm run ios           # Run on iOS
npm run lint          # Lint code
npm run test          # Run tests
```
