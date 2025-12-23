import { useState, useEffect } from 'react';
import { biometric } from '@/lib/biometric';

export function useBiometric() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    setLoading(true);
    try {
      const available = await biometric.isAvailable();
      setIsAvailable(available);

      if (available) {
        const types = await biometric.getSupportedTypes();
        if (types.length > 0) {
          // Map to user-friendly names
          const typeMap: Record<number, string> = {
            1: 'Fingerprint',
            2: 'Face ID',
            3: 'Iris',
          };
          setBiometricType(typeMap[types[0]] || 'Biometric');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (promptMessage?: string) => {
    if (!isAvailable) {
      throw new Error('Biometric authentication is not available');
    }

    try {
      const result = await biometric.authenticate(
        promptMessage || 'Authenticate to continue'
      );
      return result;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  return {
    isAvailable,
    biometricType,
    loading,
    authenticate,
    checkAvailability,
  };
}
