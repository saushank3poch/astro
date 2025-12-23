# In-App Purchase Integration Guide

## Overview
This guide covers the complete implementation of in-app purchases (IAP) using RevenueCat for both iOS and Android platforms. RevenueCat abstracts platform differences and provides a unified API for subscription management.

---

## Table of Contents
1. [RevenueCat Setup](#revenuecat-setup)
2. [Product Configuration](#product-configuration)
3. [Subscription Tiers](#subscription-tiers)
4. [Purchase Flow](#purchase-flow)
5. [Receipt Validation](#receipt-validation)
6. [Restore Purchases](#restore-purchases)
7. [Subscription Status Sync](#subscription-status-sync)
8. [Grace Period Handling](#grace-period-handling)
9. [Free Trial Setup](#free-trial-setup)
10. [Webhook Configuration](#webhook-configuration)

---

## RevenueCat Setup

### 1. Create RevenueCat Account
1. Go to [RevenueCat](https://www.revenuecat.com/)
2. Sign up for free Starter plan (free up to $2.5k MRR)
3. Create a new project: "Astro Mobile"

### 2. Configure iOS App

#### App Store Connect Setup
```
1. Login to App Store Connect (appstoreconnect.apple.com)
2. Go to My Apps → Create New App
3. Fill in app information:
   - Name: Astro - Crypto Predictions
   - Bundle ID: com.astro.mobile
   - SKU: astro-mobile-001
   - Language: English (US)

4. Navigate to App → Features → In-App Purchases
5. Click "+" to create new subscription group
   - Group Name: "Astro Subscriptions"
   - Reference Name: astro_subscriptions

6. Create subscription products (see Product Configuration below)
```

#### RevenueCat iOS Configuration
```
1. In RevenueCat Dashboard → Projects → Astro Mobile
2. Click "Apps" → Add App → iOS
3. Fill in:
   - App Name: Astro iOS
   - Bundle ID: com.astro.mobile
   - Shared Secret: Get from App Store Connect
     (App Store Connect → My Apps → Astro → App Information → Shared Secret)
   - In-App Purchase Key: Upload from App Store Connect
     (Users & Access → Keys → In-App Purchase → Generate New Key)

4. Copy iOS API Key for later use
```

### 3. Configure Android App

#### Google Play Console Setup
```
1. Login to Google Play Console (play.google.com/console)
2. Create new app
3. Fill in app details:
   - App name: Astro - Crypto Predictions
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free

4. Navigate to Monetize → Subscriptions
5. Create subscription products (see Product Configuration below)
```

#### RevenueCat Android Configuration
```
1. In RevenueCat Dashboard → Projects → Astro Mobile
2. Click "Apps" → Add App → Android
3. Fill in:
   - App Name: Astro Android
   - Package Name: com.astro.mobile
   - Service Account Key: Upload JSON file from Google Play Console
     (Google Play Console → Setup → API access → Create credentials)

4. Copy Android API Key for later use
```

### 4. Install SDK

```bash
# Install RevenueCat SDK
npm install react-native-purchases

# iOS: Install pods
cd ios && pod install && cd ..
```

### 5. Initialize SDK

```typescript
// lib/iap.ts
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUE_CAT_KEYS = {
  ios: 'appl_XXXXXXXXXXXXX', // Replace with your iOS API key
  android: 'goog_XXXXXXXXXXXXX', // Replace with your Android API key
};

export async function initializeRevenueCat(userId?: string) {
  try {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG); // Set to INFO in production

    // Configure with platform-specific key
    const apiKey = Platform.OS === 'ios'
      ? REVENUE_CAT_KEYS.ios
      : REVENUE_CAT_KEYS.android;

    await Purchases.configure({ apiKey });

    // Identify user (if logged in)
    if (userId) {
      await Purchases.logIn(userId);
    }

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

// Call in App.tsx on launch
// initializeRevenueCat();
```

---

## Product Configuration

### iOS Products (App Store Connect)

#### Basic Monthly Subscription
```
Product ID: com.astro.basic.monthly
Reference Name: Astro Basic Monthly
Subscription Group: astro_subscriptions

Pricing:
  - Price: $9.99 USD
  - Price Template: All regions equivalent to $9.99 USD

Free Trial:
  - Duration: 7 days
  - Type: Pay as you go (trial converts after 7 days)

Renewal:
  - Auto-renewable: Yes
  - Duration: 1 month

Localizations:
  - Display Name: "Basic Plan"
  - Description: "50 predictions per month with 7-day free trial"
```

#### Pro Monthly Subscription
```
Product ID: com.astro.pro.monthly
Reference Name: Astro Pro Monthly
Subscription Group: astro_subscriptions

Pricing:
  - Price: $29.99 USD
  - Price Template: All regions equivalent to $29.99 USD

Free Trial:
  - Duration: 7 days
  - Type: Pay as you go

Renewal:
  - Auto-renewable: Yes
  - Duration: 1 month

Localizations:
  - Display Name: "Pro Plan"
  - Description: "Unlimited predictions with 7-day free trial"
```

### Android Products (Google Play Console)

#### Basic Monthly Subscription
```
Product ID: basic_monthly
Name: Astro Basic Monthly

Base plan:
  - Base plan ID: basic-monthly
  - Billing period: 1 month (P1M)
  - Price: $9.99 USD

Free trial offer:
  - Offer ID: basic-trial
  - Eligibility: New customers
  - Duration: 7 days (P7D)
  - Price: $0.00

Auto-renewing: Yes
```

#### Pro Monthly Subscription
```
Product ID: pro_monthly
Name: Astro Pro Monthly

Base plan:
  - Base plan ID: pro-monthly
  - Billing period: 1 month (P1M)
  - Price: $29.99 USD

Free trial offer:
  - Offer ID: pro-trial
  - Eligibility: New customers
  - Duration: 7 days (P7D)
  - Price: $0.00

Auto-renewing: Yes
```

### RevenueCat Product Setup

```typescript
// In RevenueCat Dashboard:
// 1. Go to Products
// 2. Add iOS products:
//    - Identifier: com.astro.basic.monthly → Type: Subscription
//    - Identifier: com.astro.pro.monthly → Type: Subscription
// 3. Add Android products:
//    - Identifier: basic_monthly → Type: Subscription
//    - Identifier: pro_monthly → Type: Subscription
// 4. Create Offerings:
//    - Offering: default
//    - Packages:
//      - basic: com.astro.basic.monthly (iOS), basic_monthly (Android)
//      - pro: com.astro.pro.monthly (iOS), pro_monthly (Android)
```

---

## Subscription Tiers

### Free Tier
```
Name: Free
Credits: 3 predictions/month
Expiration: Never (always available)
Features:
  - 3 predictions per month
  - Basic prediction types only (Macro, Timing)
  - No compatibility analysis
  - No push notifications
  - Ads (future enhancement)

Cost: $0
```

### Basic Tier
```
Name: Basic
Credits: 50 predictions/month
Renewal: Monthly
Free Trial: 7 days
Features:
  - 50 predictions per month
  - All prediction types (Macro, Timing, Divination)
  - Compatibility analysis
  - Daily push notifications
  - No ads

Cost: $9.99/month
Product IDs:
  - iOS: com.astro.basic.monthly
  - Android: basic_monthly
```

### Pro Tier
```
Name: Pro
Credits: Unlimited
Renewal: Monthly
Free Trial: 7 days
Features:
  - Unlimited predictions
  - All prediction types
  - Advanced compatibility analysis
  - Priority push notifications
  - Custom asset alerts
  - Priority support
  - No ads
  - Early access to new features

Cost: $29.99/month
Product IDs:
  - iOS: com.astro.pro.monthly
  - Android: pro_monthly
```

### Entitlements Configuration

```typescript
// constants/Subscriptions.ts
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    credits: 3,
    features: [
      '3 predictions per month',
      'Basic prediction types',
      'Limited features',
    ],
    price: null,
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    credits: 50,
    features: [
      '50 predictions per month',
      'All prediction types',
      'Compatibility analysis',
      'Daily notifications',
      '7-day free trial',
    ],
    price: '$9.99/mo',
    productId: Platform.select({
      ios: 'com.astro.basic.monthly',
      android: 'basic_monthly',
    }),
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    credits: -1, // Unlimited
    features: [
      'Unlimited predictions',
      'Advanced compatibility',
      'Custom alerts',
      'Priority support',
      '7-day free trial',
    ],
    price: '$29.99/mo',
    productId: Platform.select({
      ios: 'com.astro.pro.monthly',
      android: 'pro_monthly',
    }),
  },
};

// RevenueCat Entitlement IDs
export const ENTITLEMENTS = {
  BASIC: 'basic_access',
  PRO: 'pro_access',
};
```

---

## Purchase Flow

### Flow Diagram (Text-Based)

```
User taps "Upgrade to Basic/Pro"
    ↓
Navigate to Paywall Screen
    ↓
Display subscription options
    ↓
User selects Basic or Pro
    ↓
User taps "Start Free Trial"
    ↓
Show native payment sheet (iOS/Android)
    ↓
User authenticates (Face ID/Fingerprint/Password)
    ↓
    ├─→ Purchase Successful
    │       ↓
    │   RevenueCat processes purchase
    │       ↓
    │   Update local subscription state
    │       ↓
    │   Send receipt to backend for validation
    │       ↓
    │   Backend updates user tier in database
    │       ↓
    │   Show success message
    │       ↓
    │   Navigate to home screen
    │
    └─→ Purchase Failed/Cancelled
            ↓
        Show error message or dismiss
            ↓
        Stay on paywall
```

### Implementation

```typescript
// lib/iap.ts
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { subscriptionsApi } from './api';

export async function purchaseSubscription(
  packageIdentifier: 'basic' | 'pro'
): Promise<{ success: boolean; tier?: string; error?: string }> {
  try {
    // 1. Fetch available offerings
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering) {
      return { success: false, error: 'No subscription offerings available' };
    }

    // 2. Get the selected package
    const selectedPackage = currentOffering.availablePackages.find(
      (pkg) => pkg.identifier === packageIdentifier
    );

    if (!selectedPackage) {
      return { success: false, error: 'Selected package not found' };
    }

    // 3. Purchase the package
    const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

    // 4. Check active entitlements
    const activeEntitlements = customerInfo.entitlements.active;
    let tier: string;

    if (activeEntitlements[ENTITLEMENTS.PRO]) {
      tier = 'pro';
    } else if (activeEntitlements[ENTITLEMENTS.BASIC]) {
      tier = 'basic';
    } else {
      tier = 'free';
    }

    // 5. Validate with backend
    await subscriptionsApi.validateReceipt({
      userId: customerInfo.originalAppUserId,
      platform: Platform.OS,
    });

    // 6. Return success
    return { success: true, tier };
  } catch (error: any) {
    // Handle user cancellation
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }

    // Handle other errors
    console.error('Purchase failed:', error);
    return { success: false, error: error.message || 'Purchase failed' };
  }
}

export async function getSubscriptionStatus() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlements = customerInfo.entitlements.active;

    let tier: 'free' | 'basic' | 'pro' = 'free';
    let renewalDate: Date | null = null;

    if (activeEntitlements[ENTITLEMENTS.PRO]) {
      tier = 'pro';
      renewalDate = new Date(activeEntitlements[ENTITLEMENTS.PRO].expirationDate!);
    } else if (activeEntitlements[ENTITLEMENTS.BASIC]) {
      tier = 'basic';
      renewalDate = new Date(activeEntitlements[ENTITLEMENTS.BASIC].expirationDate!);
    }

    return { tier, renewalDate, customerInfo };
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    return { tier: 'free', renewalDate: null, customerInfo: null };
  }
}
```

### Paywall Screen Component

```typescript
// app/subscription/paywall.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { purchaseSubscription } from '@/lib/iap';
import { useRouter } from 'expo-router';

export default function PaywallScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async (tier: 'basic' | 'pro') => {
    setLoading(true);
    const result = await purchaseSubscription(tier);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Success!',
        `You're now subscribed to the ${result.tier} plan. Enjoy unlimited predictions!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else if (result.error !== 'Purchase cancelled') {
      Alert.alert('Purchase Failed', result.error || 'Something went wrong');
    }
  };

  return (
    <View>
      {/* Basic Tier Card */}
      <TouchableOpacity onPress={() => handlePurchase('basic')} disabled={loading}>
        <Text>Basic Plan - $9.99/mo</Text>
        <Text>7-day free trial</Text>
        <Text>50 predictions/month</Text>
      </TouchableOpacity>

      {/* Pro Tier Card */}
      <TouchableOpacity onPress={() => handlePurchase('pro')} disabled={loading}>
        <Text>Pro Plan - $29.99/mo</Text>
        <Text>7-day free trial</Text>
        <Text>Unlimited predictions</Text>
      </TouchableOpacity>

      <Text>Restore Purchases</Text>
    </View>
  );
}
```

---

## Receipt Validation

### Backend Endpoint

```typescript
// apps/api/src/services/mobile/iap-validation.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IapValidationService {
  private readonly revenueCatApiKey = process.env.REVENUE_CAT_API_KEY;

  async validateReceipt(userId: string, platform: 'ios' | 'android') {
    try {
      // Fetch subscriber info from RevenueCat
      const response = await axios.get(
        `https://api.revenuecat.com/v1/subscribers/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${this.revenueCatApiKey}`,
          },
        }
      );

      const subscriber = response.data.subscriber;
      const entitlements = subscriber.entitlements;

      // Determine tier
      let tier: 'free' | 'basic' | 'pro' = 'free';
      let credits = 3;
      let renewalDate: Date | null = null;

      if (entitlements.pro_access?.expires_date) {
        tier = 'pro';
        credits = -1; // Unlimited
        renewalDate = new Date(entitlements.pro_access.expires_date);
      } else if (entitlements.basic_access?.expires_date) {
        tier = 'basic';
        credits = 50;
        renewalDate = new Date(entitlements.basic_access.expires_date);
      }

      // Update user in database
      await this.updateUserSubscription(userId, {
        tier,
        credits,
        renewalDate,
        revenueCatId: subscriber.original_app_user_id,
      });

      return { tier, credits, renewalDate };
    } catch (error) {
      console.error('Receipt validation failed:', error);
      throw new Error('Failed to validate receipt');
    }
  }

  private async updateUserSubscription(
    userId: string,
    data: { tier: string; credits: number; renewalDate: Date | null; revenueCatId: string }
  ) {
    // Update user in database (implement based on your ORM)
    // Example with Prisma:
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     subscriptionTier: data.tier,
    //     credits: data.credits,
    //     subscriptionRenewalDate: data.renewalDate,
    //     revenueCatId: data.revenueCatId,
    //   },
    // });
  }
}
```

### Mobile API Call

```typescript
// services/api/subscriptions.ts
export const subscriptionsApi = {
  validateReceipt: async (data: { userId: string; platform: 'ios' | 'android' }) => {
    return apiClient.post('/v1/mobile/validate-receipt', data);
  },

  getSubscriptionStatus: async () => {
    return apiClient.get('/v1/mobile/subscription-status');
  },
};
```

---

## Restore Purchases

### Implementation

```typescript
// lib/iap.ts
export async function restorePurchases(): Promise<{
  success: boolean;
  tier?: string;
  error?: string;
}> {
  try {
    // Restore purchases via RevenueCat
    const { customerInfo } = await Purchases.restorePurchases();

    // Check active entitlements
    const activeEntitlements = customerInfo.entitlements.active;
    let tier: string = 'free';

    if (activeEntitlements[ENTITLEMENTS.PRO]) {
      tier = 'pro';
    } else if (activeEntitlements[ENTITLEMENTS.BASIC]) {
      tier = 'basic';
    }

    // Sync with backend
    await subscriptionsApi.validateReceipt({
      userId: customerInfo.originalAppUserId,
      platform: Platform.OS,
    });

    return { success: true, tier };
  } catch (error: any) {
    console.error('Restore failed:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
}
```

### UI Component

```typescript
// components/subscription/RestoreButton.tsx
import { TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { restorePurchases } from '@/lib/iap';

export function RestoreButton() {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    setLoading(true);
    const result = await restorePurchases();
    setLoading(false);

    if (result.success) {
      if (result.tier === 'free') {
        Alert.alert('No Purchases Found', 'You have no active subscriptions to restore.');
      } else {
        Alert.alert('Success!', `Your ${result.tier} subscription has been restored.`);
      }
    } else {
      Alert.alert('Restore Failed', result.error || 'Could not restore purchases');
    }
  };

  return (
    <TouchableOpacity onPress={handleRestore} disabled={loading}>
      {loading ? <ActivityIndicator /> : <Text>Restore Purchases</Text>}
    </TouchableOpacity>
  );
}
```

---

## Subscription Status Sync

### Sync Strategy

1. **On App Launch:** Check RevenueCat for latest status
2. **After Purchase:** Immediately sync
3. **On App Resume:** Refresh if >1 hour since last check
4. **Via Webhook:** Backend receives real-time updates from RevenueCat

### Implementation

```typescript
// hooks/useSubscriptionSync.ts
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { getSubscriptionStatus } from '@/lib/iap';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';

export function useSubscriptionSync() {
  const { setTier, setCredits, setRenewalDate } = useSubscriptionStore();

  // Sync on mount
  useEffect(() => {
    syncSubscription();
  }, []);

  // Sync when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        syncSubscription();
      }
    });

    return () => subscription.remove();
  }, []);

  const syncSubscription = async () => {
    const { tier, renewalDate } = await getSubscriptionStatus();

    // Update local state
    setTier(tier);
    setRenewalDate(renewalDate);

    // Set credits based on tier
    if (tier === 'pro') {
      setCredits(-1); // Unlimited
    } else if (tier === 'basic') {
      setCredits(50);
    } else {
      setCredits(3);
    }

    // Also fetch from backend to sync usage
    // await subscriptionsApi.getSubscriptionStatus();
  };
}
```

---

## Grace Period Handling

### Grace Period Definition
When a subscription renewal fails (e.g., expired credit card), Apple/Google provide a grace period (typically 16 days) where the user retains access while they update their payment method.

### Implementation

```typescript
// lib/iap.ts
export async function checkGracePeriod() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlements = customerInfo.entitlements.active;

    for (const [key, entitlement] of Object.entries(activeEntitlements)) {
      // Check if in billing retry period (grace period)
      if (entitlement.billingIssueDetectedAt) {
        const gracePeriodStart = new Date(entitlement.billingIssueDetectedAt);
        const daysInGracePeriod = Math.floor(
          (Date.now() - gracePeriodStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          inGracePeriod: true,
          daysRemaining: Math.max(0, 16 - daysInGracePeriod),
          entitlement: key,
        };
      }
    }

    return { inGracePeriod: false };
  } catch (error) {
    console.error('Grace period check failed:', error);
    return { inGracePeriod: false };
  }
}
```

### UI Warning

```typescript
// components/subscription/GracePeriodWarning.tsx
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { checkGracePeriod } from '@/lib/iap';
import { Linking } from 'react-native';

export function GracePeriodWarning() {
  const [gracePeriod, setGracePeriod] = useState<any>(null);

  useEffect(() => {
    checkGracePeriod().then(setGracePeriod);
  }, []);

  if (!gracePeriod?.inGracePeriod) return null;

  const handleUpdatePayment = () => {
    // Deep link to subscription management
    const url = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: 'https://play.google.com/store/account/subscriptions',
    });
    Linking.openURL(url!);
  };

  return (
    <View style={{ backgroundColor: '#FFF3CD', padding: 16 }}>
      <Text>⚠️ Payment Issue Detected</Text>
      <Text>
        Your subscription renewal failed. You have {gracePeriod.daysRemaining} days
        remaining to update your payment method.
      </Text>
      <TouchableOpacity onPress={handleUpdatePayment}>
        <Text>Update Payment Method</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Free Trial Setup

### iOS Free Trial Configuration

```
1. App Store Connect → In-App Purchases → Basic/Pro Subscription
2. Subscription Pricing → Add Free Trial
3. Configure:
   - Duration: 7 days
   - Introductory Offer Eligibility: New subscribers only
   - After trial: Full price ($9.99 or $29.99)
```

### Android Free Trial Configuration

```
1. Google Play Console → Monetize → Subscriptions → Basic/Pro
2. Add offer → Free trial
3. Configure:
   - Offer ID: basic-trial / pro-trial
   - Duration: 7 days (P7D)
   - Eligibility: New customers only
   - After trial: Base plan price
```

### Trial Eligibility Check

```typescript
// lib/iap.ts
export async function checkTrialEligibility(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();

    // Check if user has never subscribed
    const hasNeverSubscribed =
      !customerInfo.entitlements.all[ENTITLEMENTS.BASIC] &&
      !customerInfo.entitlements.all[ENTITLEMENTS.PRO];

    return hasNeverSubscribed;
  } catch (error) {
    console.error('Trial eligibility check failed:', error);
    return false; // Default to not eligible
  }
}
```

### Trial Display in UI

```typescript
// components/subscription/TierCard.tsx
export function TierCard({ tier }: { tier: 'basic' | 'pro' }) {
  const [isTrialEligible, setIsTrialEligible] = useState(false);

  useEffect(() => {
    checkTrialEligibility().then(setIsTrialEligible);
  }, []);

  return (
    <View>
      <Text>{tier === 'basic' ? 'Basic Plan' : 'Pro Plan'}</Text>
      <Text>{tier === 'basic' ? '$9.99/mo' : '$29.99/mo'}</Text>

      {isTrialEligible && (
        <Text>7-day free trial</Text>
      )}

      <TouchableOpacity>
        <Text>{isTrialEligible ? 'Start Free Trial' : 'Subscribe'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Webhook Configuration

### RevenueCat Webhook Setup

```
1. In RevenueCat Dashboard → Integrations → Webhooks
2. Add new webhook:
   - URL: https://api.astro.app/v1/webhooks/revenuecat
   - Authorization Header: Bearer <your-webhook-secret>
   - Events to send:
     ✓ INITIAL_PURCHASE
     ✓ RENEWAL
     ✓ CANCELLATION
     ✓ EXPIRATION
     ✓ BILLING_ISSUE
     ✓ PRODUCT_CHANGE
     ✓ TRIAL_STARTED
     ✓ TRIAL_CONVERTED
     ✓ TRIAL_CANCELLED
```

### Backend Webhook Handler

```typescript
// apps/api/src/controllers/webhooks/revenuecat.controller.ts
import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';

@Controller('webhooks/revenuecat')
export class RevenueCatWebhookController {
  @Post()
  async handleWebhook(
    @Headers('authorization') auth: string,
    @Body() payload: any
  ) {
    // Verify webhook secret
    const expectedAuth = `Bearer ${process.env.REVENUE_CAT_WEBHOOK_SECRET}`;
    if (auth !== expectedAuth) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    const { event } = payload;

    switch (event.type) {
      case 'INITIAL_PURCHASE':
        await this.handleInitialPurchase(event);
        break;

      case 'RENEWAL':
        await this.handleRenewal(event);
        break;

      case 'CANCELLATION':
        await this.handleCancellation(event);
        break;

      case 'EXPIRATION':
        await this.handleExpiration(event);
        break;

      case 'BILLING_ISSUE':
        await this.handleBillingIssue(event);
        break;

      case 'TRIAL_STARTED':
        await this.handleTrialStarted(event);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return { received: true };
  }

  private async handleInitialPurchase(event: any) {
    const userId = event.app_user_id;
    const productId = event.product_id;
    const tier = productId.includes('pro') ? 'pro' : 'basic';

    // Update user subscription
    // await prisma.user.update({
    //   where: { revenueCatId: userId },
    //   data: {
    //     subscriptionTier: tier,
    //     credits: tier === 'pro' ? -1 : 50,
    //     subscriptionStartDate: new Date(),
    //   },
    // });

    // Send welcome email or push notification
  }

  private async handleRenewal(event: any) {
    // Reset monthly credits
    const userId = event.app_user_id;
    const tier = event.product_id.includes('pro') ? 'pro' : 'basic';

    // await prisma.user.update({
    //   where: { revenueCatId: userId },
    //   data: {
    //     credits: tier === 'pro' ? -1 : 50,
    //     subscriptionRenewalDate: new Date(event.expiration_at_ms),
    //   },
    // });
  }

  private async handleCancellation(event: any) {
    // User cancelled but still has access until expiration
    // Send cancellation confirmation email
  }

  private async handleExpiration(event: any) {
    // Subscription expired, downgrade to free
    const userId = event.app_user_id;

    // await prisma.user.update({
    //   where: { revenueCatId: userId },
    //   data: {
    //     subscriptionTier: 'free',
    //     credits: 3,
    //   },
    // });

    // Send expiration notification
  }

  private async handleBillingIssue(event: any) {
    // Payment failed, user is in grace period
    // Send email/push notification to update payment
  }

  private async handleTrialStarted(event: any) {
    // User started trial
    // Send welcome message with tips
  }
}
```

---

## Testing

### Sandbox Testing (iOS)

```
1. Create sandbox test account:
   - App Store Connect → Users & Access → Sandbox Testers
   - Add new tester with unique email

2. Sign in to sandbox account on device:
   - Settings → App Store → Sandbox Account
   - Sign in with test account

3. Test purchases:
   - Purchases are free in sandbox
   - Subscriptions auto-renew every 5 minutes (instead of monthly)
   - Can cancel/renew multiple times for testing
```

### Sandbox Testing (Android)

```
1. Add test accounts:
   - Google Play Console → Setup → License Testing
   - Add Gmail accounts as testers

2. Install test build:
   - Upload internal testing build
   - Add testers to internal testing track

3. Test purchases:
   - Purchases are free for test accounts
   - Subscriptions renew every 5 minutes
```

### Test Checklist

- [ ] Purchase Basic subscription (with trial)
- [ ] Purchase Pro subscription (with trial)
- [ ] Cancel trial before it converts
- [ ] Let trial convert to paid
- [ ] Restore purchases
- [ ] Upgrade from Basic to Pro
- [ ] Downgrade from Pro to Basic
- [ ] Cancel subscription (access until expiration)
- [ ] Subscription expiration (downgrade to free)
- [ ] Billing issue (grace period)
- [ ] Family sharing (if applicable)

---

## Troubleshooting

### Common Issues

#### "No products found"
- Ensure products are configured in App Store Connect / Google Play Console
- Ensure products are approved (iOS) or activated (Android)
- Ensure product IDs match exactly in RevenueCat and app code
- Clear app data and reinstall

#### "Purchase failed with error code X"
- Check sandbox account is signed in (iOS Settings → App Store)
- Ensure test account is licensed (Android)
- Check RevenueCat API keys are correct
- Check bundle ID / package name matches

#### "Receipt validation failed"
- Ensure backend webhook is set up correctly
- Check RevenueCat API key on backend
- Verify user ID mapping between app and backend
- Check network connectivity

#### "Subscription not restoring"
- Ensure user is signed in to same Apple ID / Google account
- Call `Purchases.restorePurchases()` explicitly
- Check RevenueCat logs for restore events

---

## Production Checklist

- [ ] RevenueCat account created and configured
- [ ] iOS app configured in App Store Connect
- [ ] Android app configured in Google Play Console
- [ ] Products created in both stores (approved/activated)
- [ ] Products added to RevenueCat
- [ ] Offerings configured with correct package identifiers
- [ ] Free trial configured (7 days)
- [ ] Pricing set correctly ($9.99 Basic, $29.99 Pro)
- [ ] Webhook configured and tested
- [ ] Receipt validation endpoint implemented
- [ ] Sandbox testing completed for all flows
- [ ] Terms of Service includes subscription terms
- [ ] Privacy Policy includes data usage
- [ ] Restore purchases button visible
- [ ] Subscription management deep links working
- [ ] RevenueCat log level set to INFO (not DEBUG)

---

## Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [RevenueCat React Native SDK](https://github.com/RevenueCat/react-native-purchases)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console)
- [Apple Subscription Guidelines](https://developer.apple.com/app-store/subscriptions/)
- [Google Play Billing](https://developer.android.com/google/play/billing)
