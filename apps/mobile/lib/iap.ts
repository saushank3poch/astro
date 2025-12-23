import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG } from '@/constants/Subscriptions';
import { SubscriptionTier } from '@/types';

export const iap = {
  async initialize(userId: string): Promise<void> {
    try {
      const apiKey =
        Platform.OS === 'ios'
          ? REVENUECAT_CONFIG.ios.apiKey
          : REVENUECAT_CONFIG.android.apiKey;

      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
      throw error;
    }
  },

  async getOfferings(): Promise<PurchasesPackage[] | null> {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        return offerings.current.availablePackages;
      }
      return null;
    } catch (error) {
      console.error('Error getting offerings:', error);
      return null;
    }
  },

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled the purchase');
      } else {
        console.error('Error purchasing package:', error);
      }
      throw error;
    }
  },

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  },

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      throw error;
    }
  },

  async getSubscriptionStatus(): Promise<{
    isActive: boolean;
    tier: SubscriptionTier;
    expiresAt: Date | null;
  }> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlements = customerInfo.entitlements.active;

      // Check for Pro tier
      if (entitlements['pro']) {
        const expiration = entitlements['pro'].expirationDate;
        return {
          isActive: true,
          tier: 'pro',
          expiresAt: expiration ? new Date(expiration) : null,
        };
      }

      // Check for Basic tier
      if (entitlements['basic']) {
        const expiration = entitlements['basic'].expirationDate;
        return {
          isActive: true,
          tier: 'basic',
          expiresAt: expiration ? new Date(expiration) : null,
        };
      }

      // Default to free tier
      return {
        isActive: false,
        tier: 'free',
        expiresAt: null,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        isActive: false,
        tier: 'free',
        expiresAt: null,
      };
    }
  },

  async syncPurchases(): Promise<void> {
    try {
      await Purchases.syncPurchases();
      console.log('Purchases synced successfully');
    } catch (error) {
      console.error('Error syncing purchases:', error);
    }
  },

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('RevenueCat user logged out');
    } catch (error) {
      console.error('Error logging out from RevenueCat:', error);
    }
  },

  async setEmail(email: string): Promise<void> {
    try {
      await Purchases.setEmail(email);
    } catch (error) {
      console.error('Error setting email in RevenueCat:', error);
    }
  },
};
