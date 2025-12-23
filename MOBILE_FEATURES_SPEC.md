# Mobile Features Specification

## Overview
This document specifies mobile-specific features for the Astro app including push notifications, widgets, biometric authentication, offline mode, native sharing, and deep linking.

---

## Table of Contents
1. [Push Notifications](#push-notifications)
2. [Home Screen Widgets](#home-screen-widgets)
3. [Biometric Authentication](#biometric-authentication)
4. [Offline Mode](#offline-mode)
5. [Native Share Integration](#native-share-integration)
6. [Deep Linking](#deep-linking)
7. [Platform-Specific Considerations](#platform-specific-considerations)

---

## Push Notifications

### Notification Types

#### 1. Daily Insight
**Trigger:** Scheduled daily at 7am user's local timezone
**Title:** "Your Daily Astro Insight"
**Body:** "[Favorable/Challenging] day ahead. [Chinese Zodiac Element] energy is [strong/weak]."
**Deep Link:** `astro://` (home screen)
**Icon:** Sun/Moon icon based on time

**Example:**
```
Title: Your Daily Astro Insight ☀️
Body: Favorable day ahead! Metal energy is strong. Great for financial decisions.
Tap to see your full forecast.
```

**Backend Implementation:**
```typescript
// Cron job runs daily at 7am for each user's timezone
async function sendDailyInsights() {
  const users = await getUsersWithPushEnabled();

  for (const user of users) {
    const insight = await generateDailyInsight(user.birthChart);

    await sendPushNotification({
      userId: user.id,
      title: 'Your Daily Astro Insight ☀️',
      body: insight.summary,
      data: {
        type: 'daily_insight',
        insightId: insight.id,
      },
      scheduledFor: getNext7AM(user.timezone),
    });
  }
}
```

#### 2. Favorable Period Alert
**Trigger:** When user enters an astrologically favorable day/period
**Title:** "Favorable Period Started!"
**Body:** "Your lucky day has begun. [Element] is aligned in your favor. Good time for [activity]."
**Deep Link:** `astro://` (home screen)
**Icon:** Star icon

**Example:**
```
Title: Favorable Period Started! ⭐
Body: Your lucky day has begun. Fire element is aligned in your favor.
Good time for taking calculated risks.
```

**Backend Logic:**
```typescript
// Calculate favorable periods and send alerts
async function checkFavorablePeriods() {
  const users = await getAllUsers();

  for (const user of users) {
    const today = new Date();
    const isFavorable = await calculateFavorablePeriod(user.birthChart, today);

    if (isFavorable && !user.alertSentToday) {
      await sendPushNotification({
        userId: user.id,
        title: 'Favorable Period Started! ⭐',
        body: `Your lucky day has begun. ${isFavorable.element} is aligned in your favor.`,
        data: {
          type: 'favorable_period',
          element: isFavorable.element,
        },
      });
    }
  }
}
```

#### 3. Low Credit Warning
**Trigger:** When user has 1 credit remaining (for Free/Basic tiers)
**Title:** "Running Low on Predictions"
**Body:** "You have 1 prediction left. Upgrade to Pro for unlimited predictions."
**Deep Link:** `astro://subscription/paywall`
**Icon:** Warning icon

**Example:**
```
Title: Running Low on Predictions ⚠️
Body: You have 1 prediction left this month.
Upgrade to Pro for unlimited predictions with a 7-day free trial.
```

**Backend Trigger:**
```typescript
// After prediction creation
async function afterPredictionCreated(userId: string) {
  const user = await getUser(userId);

  if (user.credits === 1) {
    await sendPushNotification({
      userId: user.id,
      title: 'Running Low on Predictions ⚠️',
      body: 'You have 1 prediction left. Upgrade to Pro for unlimited predictions.',
      data: {
        type: 'low_credit',
        creditsRemaining: 1,
      },
    });
  }
}
```

#### 4. Subscription Expiry Warning
**Trigger:** 3 days before subscription renewal/expiration
**Title:** "Subscription Expiring Soon"
**Body:** "Your [Basic/Pro] subscription expires in 3 days. Renew to keep access."
**Deep Link:** `astro://subscription/manage`
**Icon:** Calendar icon

**Example:**
```
Title: Subscription Expiring Soon 📅
Body: Your Pro subscription expires in 3 days.
Tap to manage your subscription.
```

**Backend Cron:**
```typescript
// Runs daily to check upcoming expirations
async function checkExpiringSubscriptions() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const expiringUsers = await getExpiringSubscriptions(threeDaysFromNow);

  for (const user of expiringUsers) {
    await sendPushNotification({
      userId: user.id,
      title: 'Subscription Expiring Soon 📅',
      body: `Your ${user.tier} subscription expires in 3 days.`,
      data: {
        type: 'subscription_expiry',
        tier: user.tier,
        expiresAt: user.subscriptionRenewalDate,
      },
    });
  }
}
```

#### 5. Custom Asset Alert (Pro Only)
**Trigger:** User-configured alert for specific asset
**Title:** "[Asset] Alert: [Condition Met]"
**Body:** "Your alert for [Asset] has triggered. [Reason]."
**Deep Link:** `astro://asset/[symbol]`
**Icon:** Asset-specific icon

**Example:**
```
Title: BTC Alert: Favorable Period 🪙
Body: Bitcoin is entering a favorable period based on your chart.
Consider reviewing predictions.
```

### Notification Permissions

#### Request Flow
```
App Launch (First Time)
    ↓
Welcome Screen / Onboarding
    ↓
Explain Benefits:
  "Get daily insights and alerts"
  "Never miss favorable trading periods"
  "Stay updated on your predictions"
    ↓
Show Permission Dialog
    ↓
    ├─→ Granted → Register push token → Enable all notifications
    │
    └─→ Denied → Skip for now → Show prompt in Settings later
```

#### Implementation
```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return false;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    console.log('Push notification permission denied');
    return false;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED', // Purple
    });
  }

  return true;
}

export async function registerPushToken() {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    return null;
  }

  // Get Expo push token
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Send to backend
  await api.post('/v1/mobile/push-token', {
    token,
    deviceId: await getDeviceId(),
    platform: Platform.OS,
  });

  return token;
}
```

### Notification Preferences

Users can configure notification preferences in Settings:

```typescript
// Settings Screen UI
interface NotificationPreferences {
  enabled: boolean;
  dailyInsight: boolean;
  favorablePeriod: boolean;
  lowCredit: boolean;
  subscriptionExpiry: boolean;
  customAlerts: boolean;
}

// Store in backend per user
```

---

## Home Screen Widgets

### Widget Requirements (iOS 14+ only)

**Note:** Widgets are iOS-only feature. Android home screen widgets have different architecture and will be phase 2.

### Widget Types

#### Small Widget (2x2 grid)
**Content:**
- Today's outlook (Favorable/Challenging)
- Primary element (e.g., "Fire ⬆️")
- Lucky color (colored circle)

**Design:**
```
┌─────────────────┐
│  TODAY'S VIBE   │
│                 │
│   FAVORABLE     │
│      ⭐         │
│                 │
│  Fire Element   │
│    🔴 Red       │
└─────────────────┘
```

#### Medium Widget (4x2 grid)
**Content:**
- Today's outlook
- Primary & secondary elements
- Lucky color & direction
- Top compatible asset (if available)

**Design:**
```
┌────────────────────────────┐
│  TODAY: FAVORABLE DAY      │
│                            │
│  🔥 Fire ⬆️  💧 Water ⬇️  │
│                            │
│  Lucky: 🔴 Red, East →    │
│  Top Asset: BTC +85%       │
└────────────────────────────┘
```

#### Large Widget (4x4 grid)
**Content:**
- Daily outlook with description
- All five elements status
- Lucky color, direction, number
- Top 3 compatible assets

### Widget Data Requirements

Widgets need to fetch data periodically (iOS updates every 15-60 minutes):

```typescript
// Widget data structure
interface WidgetData {
  outlook: 'favorable' | 'challenging' | 'neutral';
  elements: {
    fire: 'strong' | 'weak' | 'neutral';
    earth: 'strong' | 'weak' | 'neutral';
    metal: 'strong' | 'weak' | 'neutral';
    water: 'strong' | 'weak' | 'neutral';
    wood: 'strong' | 'weak' | 'neutral';
  };
  lucky: {
    color: string; // Hex code
    colorName: string; // "Red"
    direction: string; // "East"
    number: number; // 7
  };
  topAssets: Array<{
    symbol: string;
    compatibilityScore: number;
  }>;
  lastUpdated: Date;
}
```

### Widget Implementation (iOS)

```swift
// iOS/AstroWidget/AstroWidget.swift
import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), data: mockData)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        // Fetch from UserDefaults (shared app group)
        let entry = SimpleEntry(date: Date(), data: fetchWidgetData())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 30, to: currentDate)!

        let entry = SimpleEntry(date: currentDate, data: fetchWidgetData())
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))

        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

struct AstroWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(data: entry.data)
        case .systemMedium:
            MediumWidgetView(data: entry.data)
        case .systemLarge:
            LargeWidgetView(data: entry.data)
        default:
            EmptyView()
        }
    }
}
```

### Widget Data Update (React Native Side)

```typescript
// lib/widget.ts (iOS only)
import { NativeModules } from 'react-native';

export async function updateWidgetData(data: WidgetData) {
  if (Platform.OS !== 'ios') return;

  try {
    // Write to shared UserDefaults (app group)
    await NativeModules.WidgetModule.setWidgetData(JSON.stringify(data));

    // Tell WidgetKit to reload
    await NativeModules.WidgetModule.reloadAllTimelines();
  } catch (error) {
    console.error('Failed to update widget:', error);
  }
}

// Call after daily insight calculation
export async function refreshWidget() {
  const user = await getUser();
  const insight = await calculateDailyInsight(user.birthChart);
  const topAssets = await getTopCompatibleAssets(user.id, 3);

  const widgetData: WidgetData = {
    outlook: insight.outlook,
    elements: insight.elements,
    lucky: insight.lucky,
    topAssets,
    lastUpdated: new Date(),
  };

  await updateWidgetData(widgetData);
}
```

---

## Biometric Authentication

### Supported Methods

**iOS:**
- Face ID (iPhone X and later)
- Touch ID (iPhone 5s through 8, iPad, MacBook)

**Android:**
- Fingerprint (Android 6.0+)
- Face Unlock (Android 10+, device-dependent)
- Iris Scanner (Samsung, device-dependent)

### Authentication Flow

```
User opens app
    ↓
Check if biometric is enabled for user
    ↓
    ├─→ Not Enabled → Show login screen
    │
    └─→ Enabled → Show biometric prompt
            ↓
            ├─→ Success → Auto-login with stored token
            │
            ├─→ Failed → Show retry (up to 3 attempts)
            │
            └─→ Too Many Failures → Fall back to password
```

### Implementation

```typescript
// lib/biometric.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export async function isBiometricAvailable(): Promise<{
  available: boolean;
  type: 'fingerprint' | 'face' | 'iris' | null;
}> {
  const compatible = await LocalAuthentication.hasHardwareAsync();

  if (!compatible) {
    return { available: false, type: null };
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();

  if (!enrolled) {
    return { available: false, type: null };
  }

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  let type: 'fingerprint' | 'face' | 'iris' | null = null;

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    type = 'face';
  } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    type = 'fingerprint';
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    type = 'iris';
  }

  return { available: true, type };
}

export async function authenticateWithBiometric(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Astro',
      cancelLabel: 'Use Password',
      disableDeviceFallback: false, // Allow fallback to device passcode
      fallbackLabel: 'Use Password', // iOS only
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error === 'user_cancel'
          ? 'Authentication cancelled'
          : 'Authentication failed'
      };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### Enable/Disable Biometric Settings

```typescript
// Settings Screen
import { Switch } from 'react-native';
import { isBiometricAvailable, authenticateWithBiometric } from '@/lib/biometric';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_KEY = 'biometric_enabled';

export function BiometricSettings() {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometric();
    loadPreference();
  }, []);

  const checkBiometric = async () => {
    const { available, type } = await isBiometricAvailable();
    setAvailable(available);

    if (type === 'face') {
      setBiometricType('Face ID');
    } else if (type === 'fingerprint') {
      setBiometricType('Fingerprint');
    }
  };

  const loadPreference = async () => {
    const pref = await AsyncStorage.getItem(BIOMETRIC_KEY);
    setEnabled(pref === 'true');
  };

  const handleToggle = async (value: boolean) => {
    if (value) {
      // Authenticate before enabling
      const result = await authenticateWithBiometric();

      if (result.success) {
        await AsyncStorage.setItem(BIOMETRIC_KEY, 'true');
        setEnabled(true);
      } else {
        Alert.alert('Failed', 'Could not enable biometric authentication');
      }
    } else {
      // Disable
      await AsyncStorage.setItem(BIOMETRIC_KEY, 'false');
      setEnabled(false);
    }
  };

  if (!available) {
    return (
      <View>
        <Text>Biometric authentication not available on this device</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Enable {biometricType}</Text>
      <Switch value={enabled} onValueChange={handleToggle} />
    </View>
  );
}
```

### Biometric Login Flow

```typescript
// app/(auth)/login.tsx
export default function LoginScreen() {
  const [showBiometric, setShowBiometric] = useState(false);
  const { login } = useAuthStore();

  useEffect(() => {
    checkBiometricLogin();
  }, []);

  const checkBiometricLogin = async () => {
    // Check if user has biometric enabled
    const biometricEnabled = await AsyncStorage.getItem('biometric_enabled');
    const hasStoredToken = await SecureStore.getItemAsync('refresh_token');

    if (biometricEnabled === 'true' && hasStoredToken) {
      setShowBiometric(true);
      // Auto-trigger biometric
      handleBiometricLogin();
    }
  };

  const handleBiometricLogin = async () => {
    const result = await authenticateWithBiometric();

    if (result.success) {
      // Get stored refresh token
      const refreshToken = await SecureStore.getItemAsync('refresh_token');

      if (refreshToken) {
        // Auto-login with refresh token
        await login({ refreshToken });
        router.replace('/(tabs)');
      }
    } else {
      // Show manual login form
      setShowBiometric(false);
    }
  };

  return (
    <View>
      {showBiometric ? (
        <>
          <Text>Authenticate with Face ID</Text>
          <Button title="Use Password Instead" onPress={() => setShowBiometric(false)} />
        </>
      ) : (
        <LoginForm />
      )}
    </View>
  );
}
```

---

## Offline Mode

### Cache Strategy

#### What Gets Cached

1. **User Profile & Birth Chart** (permanent until logout)
2. **Last 10 Predictions** (30-day expiry)
3. **Top 20 Compatible Assets** (7-day expiry)
4. **Subscription Status** (1-day expiry)

#### What Doesn't Get Cached

1. **Real-time crypto prices** (requires online)
2. **New predictions** (requires AI processing)
3. **Search results** (requires fresh data)

### Implementation

```typescript
// services/storage/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  USER_PROFILE: 'cache:user_profile',
  BIRTH_CHART: 'cache:birth_chart',
  PREDICTIONS: 'cache:predictions',
  COMPATIBILITY: 'cache:compatibility',
  SUBSCRIPTION: 'cache:subscription',
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export const cache = {
  async set<T>(key: string, data: T, ttlSeconds: number = 86400) {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000,
    };

    await AsyncStorage.setItem(key, JSON.stringify(entry));
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);

      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if expired
      if (entry.expiresAt < Date.now()) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },

  async clear() {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith('cache:'));
    await AsyncStorage.multiRemove(cacheKeys);
  },
};

// Usage
export async function cacheUserProfile(profile: UserProfile) {
  await cache.set(CACHE_KEYS.USER_PROFILE, profile, 86400); // 1 day
}

export async function getCachedProfile(): Promise<UserProfile | null> {
  return cache.get(CACHE_KEYS.USER_PROFILE);
}
```

### Offline Queue for Actions

```typescript
// store/useOfflineStore.ts
import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

interface OfflineAction {
  id: string;
  type: 'profile_update' | 'birth_chart_update';
  payload: any;
  timestamp: number;
  retries: number;
}

interface OfflineStore {
  isOnline: boolean;
  queue: OfflineAction[];

  addToQueue: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  isOnline: true,
  queue: [],

  addToQueue: (action) => {
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    };

    set((state) => ({
      queue: [...state.queue, newAction],
    }));

    // Persist queue to AsyncStorage
    const { queue } = get();
    AsyncStorage.setItem('offline_queue', JSON.stringify(queue));
  },

  processQueue: async () => {
    const { queue, isOnline } = get();

    if (!isOnline || queue.length === 0) return;

    const failedActions: OfflineAction[] = [];

    for (const action of queue) {
      try {
        await executeAction(action);
      } catch (error) {
        console.error('Failed to process action:', error);

        // Retry up to 3 times
        if (action.retries < 3) {
          failedActions.push({ ...action, retries: action.retries + 1 });
        }
      }
    }

    set({ queue: failedActions });
    await AsyncStorage.setItem('offline_queue', JSON.stringify(failedActions));
  },

  clearQueue: () => {
    set({ queue: [] });
    AsyncStorage.removeItem('offline_queue');
  },
}));

// Listen for network changes
NetInfo.addEventListener((state) => {
  useOfflineStore.setState({ isOnline: state.isConnected ?? false });

  if (state.isConnected) {
    // Process queue when coming back online
    useOfflineStore.getState().processQueue();
  }
});

async function executeAction(action: OfflineAction) {
  switch (action.type) {
    case 'profile_update':
      await api.put('/v1/profile', action.payload);
      break;
    case 'birth_chart_update':
      await api.put('/v1/birth-chart', action.payload);
      break;
  }
}
```

### Offline UI Indicators

```typescript
// components/shared/OfflineIndicator.tsx
import { View, Text } from 'react-native';
import { useOfflineStore } from '@/store/useOfflineStore';

export function OfflineIndicator() {
  const { isOnline, queue } = useOfflineStore();

  if (isOnline) return null;

  return (
    <View style={{ backgroundColor: '#FFA500', padding: 8 }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>
        Offline Mode {queue.length > 0 && `(${queue.length} pending)`}
      </Text>
    </View>
  );
}
```

---

## Native Share Integration

### Share Prediction Results

```typescript
// lib/share.ts
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

export async function sharePrediction(predictionRef: any, prediction: Prediction) {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      Alert.alert('Error', 'Sharing is not available on this device');
      return;
    }

    // Capture prediction as image
    const uri = await captureRef(predictionRef, {
      format: 'png',
      quality: 1.0,
    });

    // Share image
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share Prediction',
      UTI: 'public.png',
    });
  } catch (error) {
    console.error('Share failed:', error);
    Alert.alert('Error', 'Failed to share prediction');
  }
}

// Alternative: Share text
export async function sharePredictionText(prediction: Prediction) {
  const text = `
${prediction.asset} Prediction
Outlook: ${prediction.result}
Compatibility: ${prediction.compatibilityScore}%

Powered by Astro - astro.app
  `.trim();

  try {
    await Sharing.shareAsync(text);
  } catch (error) {
    console.error('Share text failed:', error);
  }
}
```

### Share Button Component

```typescript
// components/predictions/ShareButton.tsx
import { TouchableOpacity, Text } from 'react-native';
import { useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import { sharePrediction } from '@/lib/share';

export function ShareButton({ prediction }: { prediction: Prediction }) {
  const viewShotRef = useRef(null);

  return (
    <>
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
        <PredictionCard prediction={prediction} />
      </ViewShot>

      <TouchableOpacity onPress={() => sharePrediction(viewShotRef, prediction)}>
        <Text>Share</Text>
      </TouchableOpacity>
    </>
  );
}
```

---

## Deep Linking

### URL Scheme Configuration

**Custom Scheme:** `astro://`
**Universal Links (iOS):** `https://astro.app/*`
**App Links (Android):** `https://astro.app/*`

### Deep Link Routes

| Route | Deep Link | Description |
|-------|-----------|-------------|
| Home | `astro://` | Home screen (predictions) |
| Prediction Detail | `astro://prediction/:id` | View specific prediction |
| New Prediction | `astro://prediction/new` | Create prediction screen |
| Asset Detail | `astro://asset/:symbol` | View asset compatibility |
| Paywall | `astro://subscription/paywall` | Subscription purchase |
| Manage Subscription | `astro://subscription/manage` | Subscription settings |
| Profile | `astro://profile` | User profile screen |
| Settings | `astro://settings` | App settings |

### Implementation

#### app.json Configuration

```json
{
  "expo": {
    "scheme": "astro",
    "ios": {
      "bundleIdentifier": "com.astro.mobile",
      "associatedDomains": ["applinks:astro.app", "applinks:www.astro.app"]
    },
    "android": {
      "package": "com.astro.mobile",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "astro.app"
            },
            {
              "scheme": "astro"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

#### Deep Link Handler

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url, router);
    });

    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url, router);
      }
    });

    // Handle notification taps
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationDeepLink(data, router);
      }
    );

    return () => {
      subscription.remove();
      notificationSubscription.remove();
    };
  }, []);

  return <Stack />;
}

function handleDeepLink(url: string, router: any) {
  const { hostname, path, queryParams } = Linking.parse(url);

  // astro://prediction/123
  if (path === '/prediction/:id') {
    router.push(`/prediction/${queryParams.id}`);
  }
  // astro://asset/BTC
  else if (path === '/asset/:symbol') {
    router.push(`/asset/${queryParams.symbol}`);
  }
  // astro://subscription/paywall
  else if (path === '/subscription/paywall') {
    router.push('/subscription/paywall');
  }
  // astro:// (home)
  else {
    router.push('/(tabs)');
  }
}

function handleNotificationDeepLink(data: any, router: any) {
  switch (data.type) {
    case 'daily_insight':
      router.push('/(tabs)');
      break;
    case 'low_credit':
      router.push('/subscription/paywall');
      break;
    case 'subscription_expiry':
      router.push('/subscription/manage');
      break;
    case 'asset_alert':
      router.push(`/asset/${data.symbol}`);
      break;
  }
}
```

---

## Platform-Specific Considerations

### iOS vs Android Differences

| Feature | iOS | Android | Notes |
|---------|-----|---------|-------|
| **Push Notifications** | APNs | FCM | Use Expo Notifications for unified API |
| **Biometric** | Face ID, Touch ID | Fingerprint, Face | expo-local-authentication handles both |
| **IAP** | StoreKit | Google Play Billing | RevenueCat abstracts differences |
| **Widgets** | WidgetKit (native) | Not supported yet | iOS only for now |
| **Deep Linking** | Universal Links | App Links | Different setup, same result |
| **Share Sheet** | UIActivityViewController | Intent.ACTION_SEND | expo-sharing handles both |
| **Permissions** | Info.plist | AndroidManifest.xml | Expo config handles both |
| **Navigation** | Modal presentation | Activity transitions | Different animations |
| **Haptics** | Taptic Engine | Vibration | Different implementations |

### iOS-Specific Features

```typescript
// iOS Only: Haptic Feedback
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'ios') {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
```

### Android-Specific Features

```typescript
// Android Only: Back button handling
import { BackHandler } from 'react-native';

useEffect(() => {
  if (Platform.OS !== 'android') return;

  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    // Custom back button logic
    router.back();
    return true; // Prevent default behavior
  });

  return () => backHandler.remove();
}, []);
```

---

## Summary

This specification covers all mobile-specific features:

✅ **5 Push Notification Types** with triggers, examples, and backend implementation
✅ **Home Screen Widgets** (iOS) with 3 sizes and data requirements
✅ **Biometric Authentication** with Face ID, Touch ID, and Fingerprint support
✅ **Offline Mode** with caching strategy and sync queue
✅ **Native Share** for predictions as images or text
✅ **Deep Linking** with 8 routes and notification integration
✅ **Platform Differences** between iOS and Android

These features provide a native, polished mobile experience that goes beyond a simple web wrapper.
