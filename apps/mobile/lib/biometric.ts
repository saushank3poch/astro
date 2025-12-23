import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from './storage';

export const biometric = {
  async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  async getSupportedTypes(): Promise<string[]> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types.map((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Unknown';
      }
    });
  },

  async authenticate(reason?: string): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Authenticate to access Astro',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  },

  async isEnabled(): Promise<boolean> {
    return await storage.getBiometricEnabled();
  },

  async setEnabled(enabled: boolean): Promise<void> {
    await storage.setBiometricEnabled(enabled);
  },

  async authenticateIfEnabled(): Promise<boolean> {
    const isEnabled = await this.isEnabled();
    if (!isEnabled) {
      return true; // Skip if not enabled
    }

    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      return true; // Skip if not available
    }

    return await this.authenticate();
  },
};
