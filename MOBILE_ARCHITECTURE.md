# Mobile App Architecture

## Overview
This document outlines the technical architecture for the Astro mobile application, built with Expo and React Native. The architecture prioritizes code reusability, performance, offline-first functionality, and maintainability.

---

## Tech Stack

### Core Framework
- **React Native:** 0.74+
- **Expo SDK:** 51+
- **TypeScript:** 5.3+
- **Expo Router:** File-based routing

### Key Libraries

#### Navigation & Routing
- **expo-router:** File-based navigation system
- **react-navigation:** Underlying navigation library (via Expo Router)

#### State Management
- **zustand:** 4.5+ - Lightweight state management
- **react-query / @tanstack/react-query:** 5.0+ - Server state management

#### Authentication
- **expo-auth-session:** OAuth flows (Google, Apple)
- **expo-local-authentication:** Biometric auth (Face ID, Touch ID, Fingerprint)
- **expo-secure-store:** Secure token storage

#### Subscriptions & Payments
- **react-native-purchases:** 7.0+ - RevenueCat SDK
- **expo-in-app-purchases:** Fallback if needed

#### Notifications
- **expo-notifications:** Push notifications
- **expo-device:** Device information for notification setup

#### Offline & Storage
- **@react-native-async-storage/async-storage:** Async storage for cache
- **react-query (offline mode):** Offline-first query caching

#### UI & Animations
- **react-native-reanimated:** 3.0+ - Smooth animations
- **react-native-gesture-handler:** Touch gestures
- **react-native-svg:** SVG rendering for charts
- **expo-linear-gradient:** Gradient backgrounds

#### Media & Sharing
- **expo-image-picker:** Profile photo uploads
- **expo-sharing:** Native share functionality
- **expo-image:** Optimized image component

#### Utilities
- **date-fns:** Date manipulation
- **zod:** Runtime type validation
- **react-hook-form:** Form management
- **axios:** HTTP client

#### Development & Testing
- **jest:** Unit testing
- **@testing-library/react-native:** Component testing
- **detox:** E2E testing (optional)
- **expo-dev-client:** Custom development client

---

## Project Structure

```
astro-mobile/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Auth flow group
│   │   ├── _layout.tsx           # Auth layout (no tabs)
│   │   ├── login.tsx             # Login screen
│   │   ├── register.tsx          # Register screen
│   │   ├── forgot-password.tsx   # Forgot password
│   │   └── onboarding.tsx        # First-time user onboarding
│   ├── (tabs)/                   # Main app tabs group
│   │   ├── _layout.tsx           # Tab layout
│   │   ├── index.tsx             # Home/Predictions screen
│   │   ├── compatibility.tsx     # Compatibility screen
│   │   ├── profile.tsx           # Profile screen
│   │   └── settings.tsx          # Settings screen
│   ├── prediction/               # Prediction detail screens
│   │   ├── [id].tsx              # View prediction
│   │   └── new.tsx               # Create prediction
│   ├── asset/                    # Asset detail screens
│   │   └── [symbol].tsx          # Asset detail
│   ├── subscription/             # Subscription screens
│   │   ├── paywall.tsx           # Subscription paywall
│   │   └── manage.tsx            # Manage subscription
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404 screen
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   ├── auth/                     # Auth-specific components
│   │   ├── BiometricButton.tsx
│   │   ├── OAuthButtons.tsx
│   │   └── AuthGuard.tsx
│   ├── predictions/              # Prediction components
│   │   ├── PredictionCard.tsx
│   │   ├── PredictionTypeSelector.tsx
│   │   └── PredictionResult.tsx
│   ├── chart/                    # Birth chart components
│   │   ├── ChineseChart.tsx
│   │   ├── WesternChart.tsx
│   │   └── ElementBadge.tsx
│   ├── compatibility/            # Compatibility components
│   │   ├── AssetCard.tsx
│   │   ├── CompatibilityMeter.tsx
│   │   └── AssetSearch.tsx
│   ├── subscription/             # Subscription components
│   │   ├── TierCard.tsx
│   │   ├── CreditDisplay.tsx
│   │   └── UpgradePrompt.tsx
│   └── shared/                   # Shared components
│       ├── Header.tsx
│       ├── TabBar.tsx
│       └── OfflineIndicator.tsx
├── services/                     # API & external services
│   ├── api/
│   │   ├── client.ts             # Axios instance
│   │   ├── auth.ts               # Auth endpoints
│   │   ├── predictions.ts        # Prediction endpoints
│   │   ├── compatibility.ts      # Compatibility endpoints
│   │   ├── profile.ts            # Profile endpoints
│   │   └── subscriptions.ts      # Subscription endpoints
│   ├── storage/
│   │   ├── secure-storage.ts     # Secure token storage
│   │   └── cache.ts              # Async storage cache
│   ├── iap/
│   │   ├── revenue-cat.ts        # RevenueCat integration
│   │   └── products.ts           # Product definitions
│   ├── notifications/
│   │   ├── push.ts               # Push notification setup
│   │   └── handlers.ts           # Notification handlers
│   └── analytics/
│       └── tracker.ts            # Analytics events
├── store/                        # Zustand stores
│   ├── useAuthStore.ts           # Auth state
│   ├── useUserStore.ts           # User profile state
│   ├── useSubscriptionStore.ts   # Subscription state
│   ├── useOfflineStore.ts        # Offline queue
│   └── usePredictionStore.ts     # Prediction cache
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Auth helpers
│   ├── useBiometric.ts           # Biometric auth
│   ├── useSubscription.ts        # Subscription status
│   ├── useOffline.ts             # Offline detection
│   └── usePrediction.ts          # Prediction helpers
├── utils/                        # Utility functions
│   ├── validation.ts             # Form validation
│   ├── formatting.ts             # Data formatting
│   ├── date.ts                   # Date utilities
│   └── deep-linking.ts           # Deep link handling
├── constants/                    # App constants
│   ├── Colors.ts                 # Color palette
│   ├── Layout.ts                 # Layout constants
│   ├── Config.ts                 # App config
│   └── Products.ts               # IAP product IDs
├── types/                        # TypeScript types
│   ├── auth.ts
│   ├── user.ts
│   ├── prediction.ts
│   ├── compatibility.ts
│   └── subscription.ts
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── README.md
```

---

## Navigation Architecture

### Expo Router Structure

Expo Router uses file-based routing similar to Next.js. The folder structure in `app/` defines the navigation structure.

#### Route Groups

**`(auth)` group:** Unauthenticated screens
- No tab bar
- Stack navigation
- Routes: `/login`, `/register`, `/forgot-password`, `/onboarding`

**`(tabs)` group:** Main app with tab navigation
- Tab bar at bottom
- Routes: `/`, `/compatibility`, `/profile`, `/settings`

#### Navigation Flow

```
App Launch
    ↓
Check Auth State (useAuthStore)
    ↓
    ├─→ Not Authenticated → (auth)/login
    │       ↓
    │   Login Success
    │       ↓
    └─→ Authenticated → (tabs)/index
            ↓
        Main App (Tabs)
```

#### Deep Linking Configuration

```typescript
// app.json
{
  "expo": {
    "scheme": "astro",
    "ios": {
      "associatedDomains": ["applinks:astro.app"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "astro.app"
            }
          ]
        }
      ]
    }
  }
}
```

**Deep Link Routes:**
- `astro://prediction/:id` → `/prediction/[id]`
- `astro://asset/:symbol` → `/asset/[symbol]`
- `astro://paywall` → `/subscription/paywall`
- `https://astro.app/prediction/:id` → `/prediction/[id]` (Universal link)

---

## State Management

### Zustand Stores

#### Auth Store (`useAuthStore`)

```typescript
interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  tokens: { access: string; refresh: string } | null;
  biometricEnabled: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  refreshToken: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
}
```

#### User Store (`useUserStore`)

```typescript
interface UserState {
  profile: UserProfile | null;
  birthChart: BirthChart | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateBirthChart: (chart: BirthChart) => Promise<void>;
}
```

#### Subscription Store (`useSubscriptionStore`)

```typescript
interface SubscriptionState {
  tier: 'free' | 'basic' | 'pro';
  credits: number;
  creditsLimit: number;
  renewalDate: Date | null;
  isActive: boolean;

  fetchStatus: () => Promise<void>;
  purchaseSubscription: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  useCredit: () => void;
  resetCredits: () => void;
}
```

#### Offline Store (`useOfflineStore`)

```typescript
interface OfflineState {
  isOnline: boolean;
  queue: OfflineAction[];

  addToQueue: (action: OfflineAction) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

interface OfflineAction {
  id: string;
  type: 'prediction' | 'profile_update' | 'etc';
  payload: any;
  timestamp: number;
}
```

### React Query for Server State

React Query handles server state with built-in caching, background refetching, and offline support.

```typescript
// hooks/usePrediction.ts
export function usePrediction(id: string) {
  return useQuery({
    queryKey: ['prediction', id],
    queryFn: () => api.predictions.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
  });
}

export function useCreatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.predictions.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['predictions']);
    },
  });
}
```

---

## API Integration

### API Client Setup

```typescript
// services/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import Config from '@/constants/Config';

const apiClient = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState();
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        await refreshToken();
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Endpoints

#### Auth Service
```typescript
// services/api/auth.ts
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/v1/auth/login', { email, password }),

  register: (data: RegisterData) =>
    apiClient.post('/v1/auth/register', data),

  loginWithGoogle: (idToken: string) =>
    apiClient.post('/v1/auth/google', { idToken }),

  loginWithApple: (identityToken: string) =>
    apiClient.post('/v1/auth/apple', { identityToken }),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/v1/auth/refresh', { refreshToken }),

  logout: () =>
    apiClient.post('/v1/auth/logout'),
};
```

#### Mobile-Specific Endpoints
```typescript
// services/api/subscriptions.ts
export const subscriptionsApi = {
  // Validate IAP receipt with backend
  validateReceipt: (receipt: string, platform: 'ios' | 'android') =>
    apiClient.post('/v1/mobile/validate-receipt', { receipt, platform }),

  // Get current subscription status
  getStatus: () =>
    apiClient.get('/v1/mobile/subscription-status'),

  // Register push token
  registerPushToken: (token: string, deviceId: string) =>
    apiClient.post('/v1/mobile/push-token', { token, deviceId }),
};
```

---

## Offline-First Strategy

### Architecture

1. **Cache Layer:** React Query + AsyncStorage
2. **Offline Queue:** Zustand store for pending actions
3. **Network Detection:** NetInfo listener
4. **Sync Logic:** Process queue when online

### Implementation

#### Cache Strategy

```typescript
// services/storage/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  BIRTH_CHART: 'cache:birth_chart',
  PREDICTIONS: 'cache:predictions',
  COMPATIBILITY: 'cache:compatibility',
};

export const cache = {
  // Save to cache
  async set(key: string, data: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  },

  // Get from cache
  async get<T>(key: string): Promise<T | null> {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // Remove from cache
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  // Clear all cache
  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache:'));
    await AsyncStorage.multiRemove(cacheKeys);
  },
};
```

#### Offline Queue

```typescript
// store/useOfflineStore.ts
import NetInfo from '@react-native-community/netinfo';

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  queue: [],

  addToQueue: (action) => {
    set((state) => ({
      queue: [...state.queue, action],
    }));
  },

  processQueue: async () => {
    const { queue, isOnline } = get();

    if (!isOnline || queue.length === 0) return;

    for (const action of queue) {
      try {
        await executeAction(action);
        set((state) => ({
          queue: state.queue.filter((a) => a.id !== action.id),
        }));
      } catch (error) {
        console.error('Failed to process offline action:', error);
        // Keep in queue to retry later
      }
    }
  },

  clearQueue: () => set({ queue: [] }),
}));

// Network listener
NetInfo.addEventListener((state) => {
  useOfflineStore.setState({ isOnline: state.isConnected ?? false });

  if (state.isConnected) {
    useOfflineStore.getState().processQueue();
  }
});
```

#### React Query Offline Config

```typescript
// utils/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst', // Try cache first if offline
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});
```

### What Gets Cached Offline

1. **Birth Chart:** Full user birth chart data
2. **Last 10 Predictions:** Most recent prediction results
3. **Compatibility Data:** Top 20 compatible assets
4. **User Profile:** Profile data for offline viewing
5. **Subscription Status:** Current tier and credits

### What Gets Queued for Sync

1. **Profile Updates:** Changes to user profile
2. **Birth Chart Updates:** New/edited birth chart
3. **Prediction Requests:** Queued but not created (requires credits check)

**Note:** Prediction creation is NOT queued offline because it requires:
- Credit deduction (must verify on server)
- AI processing (must run on backend)
- Real-time crypto data (may be stale offline)

Instead, show a message: "You're offline. Connect to create predictions."

---

## Push Notification Architecture

### Setup Flow

```
App Launch
    ↓
Request Permission (expo-notifications)
    ↓
Permission Granted?
    ├─→ Yes → Get Push Token
    │           ↓
    │      Send Token to Backend
    │           ↓
    │      Store in Database (with user ID, device ID)
    │
    └─→ No → Skip notifications (can enable in settings)
```

### Notification Types & Triggers

| Type | Trigger | Time | Deep Link |
|------|---------|------|-----------|
| Daily Insight | Cron job (daily) | 7am user's timezone | `/` (home) |
| Favorable Period | When user's astrologically favorable day | 8am on favorable day | `/` (home) |
| Low Credit Warning | When credits === 1 | Immediately | `/subscription/paywall` |
| Subscription Expiry | 3 days before renewal | 9am | `/subscription/manage` |
| Custom Asset Alert | When user sets custom alert | As configured | `/asset/:symbol` |

### Implementation

#### Register for Notifications

```typescript
// services/notifications/push.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { subscriptionsApi } from '@/services/api/subscriptions';

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Get push token
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Send to backend
  const deviceId = await getDeviceId();
  await subscriptionsApi.registerPushToken(token, deviceId);

  // Android-specific: Set notification channel
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
```

#### Handle Notifications

```typescript
// services/notifications/handlers.ts
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    // Notification received while app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Could show a toast or in-app notification
      }
    );

    // Notification tapped (opens app)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationTap(data, router);
      }
    );

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);
}

function handleNotificationTap(data: any, router: any) {
  switch (data.type) {
    case 'daily_insight':
      router.push('/');
      break;
    case 'favorable_period':
      router.push('/');
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
    default:
      router.push('/');
  }
}
```

### Backend Integration

The backend needs to:
1. Store push tokens in database (user_id, device_id, push_token)
2. Schedule notifications via cron jobs
3. Send notifications via Expo's push service

```typescript
// Backend example (Node.js)
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

async function sendDailyInsight(userId: string) {
  const user = await getUserWithPushTokens(userId);

  const messages = user.pushTokens.map((token) => ({
    to: token,
    sound: 'default',
    title: 'Your Daily Insight',
    body: `Today is a ${user.favorableDay ? 'favorable' : 'challenging'} day for you. Tap to see more.`,
    data: { type: 'daily_insight' },
  }));

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
}
```

---

## IAP Integration Architecture

### RevenueCat Setup

```typescript
// services/iap/revenue-cat.ts
import Purchases from 'react-native-purchases';
import Config from '@/constants/Config';

export async function initializeRevenueCat() {
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

  if (Platform.OS === 'ios') {
    await Purchases.configure({ apiKey: Config.REVENUE_CAT_IOS_KEY });
  } else if (Platform.OS === 'android') {
    await Purchases.configure({ apiKey: Config.REVENUE_CAT_ANDROID_KEY });
  }
}

// Call on app launch
initializeRevenueCat();
```

### Product IDs

```typescript
// constants/Products.ts
export const PRODUCT_IDS = {
  BASIC_MONTHLY: Platform.select({
    ios: 'astro_basic_monthly',
    android: 'astro_basic_monthly',
  })!,
  PRO_MONTHLY: Platform.select({
    ios: 'astro_pro_monthly',
    android: 'astro_pro_monthly',
  })!,
};

export const ENTITLEMENTS = {
  BASIC: 'predictions_basic',
  PRO: 'predictions_pro',
};
```

### Purchase Flow

```typescript
// hooks/useSubscription.ts
export function useSubscription() {
  const { tier, fetchStatus } = useSubscriptionStore();

  const purchaseSubscription = async (productId: string) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(productId);

      // Check entitlements
      const isBasic = customerInfo.entitlements.active[ENTITLEMENTS.BASIC];
      const isPro = customerInfo.entitlements.active[ENTITLEMENTS.PRO];

      // Sync with backend
      await subscriptionsApi.validateReceipt(
        customerInfo.originalAppUserId,
        Platform.OS
      );

      // Update local state
      await fetchStatus();

      return { success: true, tier: isPro ? 'pro' : isBasic ? 'basic' : 'free' };
    } catch (error) {
      if (error.userCancelled) {
        return { success: false, cancelled: true };
      }
      throw error;
    }
  };

  const restorePurchases = async () => {
    const { customerInfo } = await Purchases.restorePurchases();
    await fetchStatus();
  };

  return { tier, purchaseSubscription, restorePurchases };
}
```

---

## Performance Optimization

### Bundle Size Optimization
- Use Expo's built-in optimizations
- Lazy load screens with `React.lazy()`
- Optimize images (compress, use WebP)
- Remove unused dependencies

### Launch Time Optimization
- Minimize initial API calls
- Use splash screen to hide loading
- Preload critical data only
- Lazy load non-critical screens

### Runtime Performance
- Use `React.memo()` for expensive components
- Use `FlatList` for long lists (virtualization)
- Use `useNativeDriver: true` for animations
- Optimize re-renders (avoid inline functions, use `useCallback`)

### Memory Management
- Clean up listeners in `useEffect` cleanup
- Limit cache size (e.g., last 10 predictions)
- Clear old AsyncStorage data periodically

---

## Security Considerations

### Secure Storage
- Store tokens in Expo SecureStore (encrypted)
- Never log sensitive data
- Clear tokens on logout

### API Security
- Always use HTTPS
- Validate API responses
- Handle 401/403 gracefully
- Optional: SSL pinning for extra security

### IAP Security
- Validate receipts on backend
- Never trust client-side entitlement checks alone
- Use RevenueCat webhooks for server-side updates

### Data Privacy
- Request minimal permissions
- Explain permission usage
- Allow users to delete data
- Follow GDPR/COPPA guidelines

---

## Testing Strategy

### Unit Tests (Jest)
- Test utility functions
- Test state management (Zustand stores)
- Test API services (mock responses)

### Component Tests (React Native Testing Library)
- Test component rendering
- Test user interactions
- Test conditional rendering

### Integration Tests (Detox, optional)
- Test full user flows
- Test auth flow
- Test prediction creation
- Test purchase flow

### Manual Testing
- Test on real devices (iOS + Android)
- Test different screen sizes
- Test offline scenarios
- Test push notifications
- Test IAP in sandbox

---

## Deployment

### EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure build
eas build:configure

# Build for iOS (development)
eas build --platform ios --profile development

# Build for Android (development)
eas build --platform android --profile development

# Build for production (App Store)
eas build --platform ios --profile production

# Build for production (Google Play)
eas build --platform android --profile production
```

### App Store Submission
1. Build with production profile
2. Download .ipa / .aab
3. Upload to App Store Connect / Google Play Console
4. Fill store listing
5. Submit for review

---

## Conclusion

This architecture provides a solid foundation for building a performant, offline-first mobile app with Expo and React Native. Key highlights:

- **File-based routing** with Expo Router for intuitive navigation
- **Zustand** for lightweight client state management
- **React Query** for server state with built-in offline support
- **RevenueCat** for cross-platform IAP management
- **Expo Notifications** for reliable push notifications
- **Offline-first** strategy with caching and sync queue
- **TypeScript** for type safety and better DX
- **Performance** optimizations for smooth UX

This architecture ensures the mobile app has feature parity with the web app while providing a native, performant mobile experience.
