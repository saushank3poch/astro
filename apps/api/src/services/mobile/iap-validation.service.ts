/**
 * IAP Validation Service
 * Validates In-App Purchase receipts for iOS and Android
 */

import { PrismaClient } from '@astro/database';
import axios from 'axios';
import { CreditsService } from '../credits.service';
import { SUBSCRIPTION_TIERS } from '../../config/mobile-subscriptions';

const prisma = new PrismaClient();
const creditsService = new CreditsService();

export interface IAPReceipt {
  platform: 'ios' | 'android';
  receiptData: string; // Base64 encoded
  productId: string;
  transactionId: string;
}

export interface SubscriptionStatus {
  active: boolean;
  tier: 'free' | 'basic' | 'pro';
  expiresAt?: Date;
  autoRenewing: boolean;
  inGracePeriod: boolean;
}

interface AppleReceiptValidationResponse {
  status: number;
  receipt?: any;
  latest_receipt_info?: any[];
  pending_renewal_info?: any[];
}

interface GoogleReceiptValidationResponse {
  kind: string;
  purchaseTimeMillis: string;
  expiryTimeMillis: string;
  autoRenewing: boolean;
  orderId: string;
}

export class IAPValidationService {
  private readonly APPLE_VERIFY_RECEIPT_URL_PRODUCTION =
    process.env.APPLE_VERIFY_RECEIPT_URL_PRODUCTION ||
    'https://buy.itunes.apple.com/verifyReceipt';

  private readonly APPLE_VERIFY_RECEIPT_URL_SANDBOX =
    process.env.APPLE_VERIFY_RECEIPT_URL_SANDBOX ||
    'https://sandbox.itunes.apple.com/verifyReceipt';

  private readonly APPLE_SHARED_SECRET = process.env.APPLE_SHARED_SECRET;

  /**
   * Validate iOS receipt with Apple
   */
  async validateAppleReceipt(receiptData: string): Promise<{
    valid: boolean;
    productId: string;
    expiresDate: Date;
    transactionId: string;
    autoRenewing: boolean;
  }> {
    try {
      // Try production first
      let response = await this.verifyAppleReceiptWithServer(
        receiptData,
        this.APPLE_VERIFY_RECEIPT_URL_PRODUCTION
      );

      // If sandbox receipt in production, retry with sandbox URL
      if (response.status === 21007) {
        response = await this.verifyAppleReceiptWithServer(
          receiptData,
          this.APPLE_VERIFY_RECEIPT_URL_SANDBOX
        );
      }

      // Status 0 = valid receipt
      if (response.status !== 0) {
        throw new Error(`Apple receipt validation failed with status: ${response.status}`);
      }

      // Get latest subscription info
      const latestReceiptInfo = response.latest_receipt_info?.[0];
      if (!latestReceiptInfo) {
        throw new Error('No subscription info in receipt');
      }

      const pendingRenewal = response.pending_renewal_info?.[0];

      return {
        valid: true,
        productId: latestReceiptInfo.product_id,
        expiresDate: new Date(parseInt(latestReceiptInfo.expires_date_ms)),
        transactionId: latestReceiptInfo.transaction_id,
        autoRenewing: pendingRenewal?.auto_renew_status === '1',
      };
    } catch (error) {
      console.error('Error validating Apple receipt:', error);
      return {
        valid: false,
        productId: '',
        expiresDate: new Date(),
        transactionId: '',
        autoRenewing: false,
      };
    }
  }

  /**
   * Verify receipt with Apple server
   */
  private async verifyAppleReceiptWithServer(
    receiptData: string,
    verifyUrl: string
  ): Promise<AppleReceiptValidationResponse> {
    const response = await axios.post<AppleReceiptValidationResponse>(
      verifyUrl,
      {
        'receipt-data': receiptData,
        'password': this.APPLE_SHARED_SECRET,
        'exclude-old-transactions': true,
      }
    );

    return response.data;
  }

  /**
   * Validate Android receipt with Google Play
   */
  async validateGoogleReceipt(receiptData: string, productId: string): Promise<{
    valid: boolean;
    expiresDate: Date;
    transactionId: string;
    autoRenewing: boolean;
  }> {
    try {
      // In production, you would use Google Play Developer API
      // For now, we'll parse the receipt data (which should be from RevenueCat)
      const receipt = JSON.parse(receiptData);

      return {
        valid: true,
        expiresDate: new Date(parseInt(receipt.expiryTimeMillis)),
        transactionId: receipt.orderId,
        autoRenewing: receipt.autoRenewing,
      };
    } catch (error) {
      console.error('Error validating Google receipt:', error);
      return {
        valid: false,
        expiresDate: new Date(),
        transactionId: '',
        autoRenewing: false,
      };
    }
  }

  /**
   * Process webhook from RevenueCat
   */
  async processRevenueCatWebhook(event: any): Promise<void> {
    try {
      const { type, app_user_id, product_id, expiration_at_ms, auto_renew_status } = event;

      console.log(`Processing RevenueCat webhook: ${type} for user ${app_user_id}`);

      switch (type) {
        case 'INITIAL_PURCHASE':
          await this.handleInitialPurchase(app_user_id, product_id, expiration_at_ms);
          break;

        case 'RENEWAL':
          await this.handleRenewal(app_user_id, product_id, expiration_at_ms);
          break;

        case 'CANCELLATION':
          await this.handleCancellation(app_user_id);
          break;

        case 'EXPIRATION':
          await this.handleExpiration(app_user_id);
          break;

        case 'BILLING_ISSUE':
          await this.handleBillingIssue(app_user_id);
          break;

        default:
          console.log(`Unhandled webhook type: ${type}`);
      }
    } catch (error) {
      console.error('Error processing RevenueCat webhook:', error);
      throw error;
    }
  }

  /**
   * Handle initial purchase
   */
  private async handleInitialPurchase(
    userId: string,
    productId: string,
    expiresAtMs: number
  ): Promise<void> {
    const tier = this.getTierFromProductId(productId);
    const expiresAt = new Date(expiresAtMs);

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt,
        subscriptionProvider: 'revenuecat',
      },
    });

    // Create or update mobile subscription record
    await prisma.mobileSubscription.upsert({
      where: { userId },
      create: {
        userId,
        platform: productId.includes('ios') || productId.includes('com.astro') ? 'ios' : 'android',
        tier,
        productId,
        expiresAt,
        autoRenewing: true,
        inGracePeriod: false,
      },
      update: {
        tier,
        productId,
        expiresAt,
        autoRenewing: true,
        inGracePeriod: false,
      },
    });

    // Grant subscription credits
    await this.grantSubscriptionCredits(userId, tier);

    console.log(`Initial purchase processed for user ${userId}: ${tier}`);
  }

  /**
   * Handle subscription renewal
   */
  private async handleRenewal(
    userId: string,
    productId: string,
    expiresAtMs: number
  ): Promise<void> {
    const tier = this.getTierFromProductId(productId);
    const expiresAt = new Date(expiresAtMs);

    // Update subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt,
      },
    });

    await prisma.mobileSubscription.update({
      where: { userId },
      data: {
        tier,
        expiresAt,
        autoRenewing: true,
        inGracePeriod: false,
      },
    });

    // Grant credits for new billing period
    await this.grantSubscriptionCredits(userId, tier);

    console.log(`Renewal processed for user ${userId}: ${tier}`);
  }

  /**
   * Handle subscription cancellation
   */
  private async handleCancellation(userId: string): Promise<void> {
    // Don't immediately downgrade - let them keep access until expiry
    await prisma.mobileSubscription.update({
      where: { userId },
      data: {
        autoRenewing: false,
      },
    });

    console.log(`Cancellation processed for user ${userId}`);
  }

  /**
   * Handle subscription expiration
   */
  private async handleExpiration(userId: string): Promise<void> {
    // Downgrade to free tier
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'free',
        subscriptionStatus: 'expired',
      },
    });

    await prisma.mobileSubscription.update({
      where: { userId },
      data: {
        tier: 'free',
        autoRenewing: false,
        inGracePeriod: false,
      },
    });

    console.log(`Expiration processed for user ${userId}`);
  }

  /**
   * Handle billing issue
   */
  private async handleBillingIssue(userId: string): Promise<void> {
    // Set grace period
    await prisma.mobileSubscription.update({
      where: { userId },
      data: {
        inGracePeriod: true,
      },
    });

    console.log(`Billing issue flagged for user ${userId}`);
  }

  /**
   * Get user subscription status
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const subscription = await prisma.mobileSubscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        return {
          active: false,
          tier: 'free',
          autoRenewing: false,
          inGracePeriod: false,
        };
      }

      const now = new Date();
      const active = subscription.expiresAt ? subscription.expiresAt > now : false;

      return {
        active,
        tier: subscription.tier as 'free' | 'basic' | 'pro',
        expiresAt: subscription.expiresAt || undefined,
        autoRenewing: subscription.autoRenewing,
        inGracePeriod: subscription.inGracePeriod,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        active: false,
        tier: 'free',
        autoRenewing: false,
        inGracePeriod: false,
      };
    }
  }

  /**
   * Sync subscription from RevenueCat
   */
  async syncSubscription(userId: string): Promise<void> {
    // In production, this would call RevenueCat API to fetch latest subscription status
    // For now, we rely on webhooks
    console.log(`Syncing subscription for user ${userId}`);
  }

  /**
   * Grant subscription credits based on tier
   */
  async grantSubscriptionCredits(userId: string, tier: 'basic' | 'pro'): Promise<void> {
    const tierConfig = SUBSCRIPTION_TIERS[tier];

    if (!tierConfig) {
      console.error(`Invalid tier: ${tier}`);
      return;
    }

    const creditsToGrant = tierConfig.creditsPerMonth;

    // Unlimited credits for pro tier
    if (creditsToGrant === -1) {
      // Set a very high number to represent unlimited
      await creditsService.addCredits(userId, 999999, 'purchase');
    } else {
      await creditsService.addCredits(userId, creditsToGrant, 'purchase');
    }

    console.log(`Granted ${creditsToGrant} credits to user ${userId} (${tier} tier)`);
  }

  /**
   * Get tier from product ID
   */
  private getTierFromProductId(productId: string): 'basic' | 'pro' {
    if (productId.includes('basic')) {
      return 'basic';
    } else if (productId.includes('pro')) {
      return 'pro';
    }
    return 'basic'; // default
  }

  /**
   * Validate and process receipt
   */
  async validateAndProcessReceipt(receipt: IAPReceipt, userId: string): Promise<{
    success: boolean;
    error?: string;
    subscription?: SubscriptionStatus;
  }> {
    try {
      let validationResult;

      if (receipt.platform === 'ios') {
        validationResult = await this.validateAppleReceipt(receipt.receiptData);
      } else {
        validationResult = await this.validateGoogleReceipt(receipt.receiptData, receipt.productId);
      }

      if (!validationResult.valid) {
        return {
          success: false,
          error: 'Invalid receipt',
        };
      }

      // Store transaction
      await prisma.transaction.create({
        data: {
          userId,
          amount: 0, // Will be filled by actual amount
          currency: 'USD',
          paymentMethod: 'iap',
          productId: receipt.productId,
          receiptData: receipt.receiptData,
          appStoreTransactionId: receipt.transactionId,
          originalTransactionId: validationResult.transactionId,
          status: 'completed',
          confirmedAt: new Date(),
          completedAt: new Date(),
        },
      });

      // Process the purchase
      const tier = this.getTierFromProductId(receipt.productId);
      await this.handleInitialPurchase(
        userId,
        receipt.productId,
        validationResult.expiresDate.getTime()
      );

      const status = await this.getSubscriptionStatus(userId);

      return {
        success: true,
        subscription: status,
      };
    } catch (error) {
      console.error('Error validating and processing receipt:', error);
      return {
        success: false,
        error: 'Failed to process receipt',
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(userId: string, receiptData: string, platform: 'ios' | 'android'): Promise<{
    success: boolean;
    error?: string;
    subscription?: SubscriptionStatus;
  }> {
    try {
      let validationResult;

      if (platform === 'ios') {
        validationResult = await this.validateAppleReceipt(receiptData);
      } else {
        // For Android, we need the product ID which should be in receipt data
        const receipt = JSON.parse(receiptData);
        validationResult = await this.validateGoogleReceipt(receiptData, receipt.productId);
      }

      if (!validationResult.valid) {
        return {
          success: false,
          error: 'No valid purchases found',
        };
      }

      // Restore the subscription
      const tier = this.getTierFromProductId(validationResult.productId);
      await this.handleRenewal(userId, validationResult.productId, validationResult.expiresDate.getTime());

      const status = await this.getSubscriptionStatus(userId);

      return {
        success: true,
        subscription: status,
      };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return {
        success: false,
        error: 'Failed to restore purchases',
      };
    }
  }
}

export default IAPValidationService;
