import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  USER_DATA: 'user_data',
  BIRTH_CHART: 'birth_chart',
  LAST_SYNC: 'last_sync',
  QUEUED_REQUESTS: 'queued_requests',
};

export const storage = {
  // Secure storage for sensitive data
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async removeRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  },

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(KEYS.BIOMETRIC_ENABLED, enabled.toString());
  },

  async getBiometricEnabled(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(KEYS.BIOMETRIC_ENABLED);
    return value === 'true';
  },

  // Non-sensitive data storage
  async setUserData(data: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(data));
  },

  async getUserData(): Promise<any | null> {
    const data = await AsyncStorage.getItem(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  async removeUserData(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER_DATA);
  },

  async setBirthChart(chart: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.BIRTH_CHART, JSON.stringify(chart));
  },

  async getBirthChart(): Promise<any | null> {
    const data = await AsyncStorage.getItem(KEYS.BIRTH_CHART);
    return data ? JSON.parse(data) : null;
  },

  async setLastSync(timestamp: number): Promise<void> {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, timestamp.toString());
  },

  async getLastSync(): Promise<number | null> {
    const value = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    return value ? parseInt(value, 10) : null;
  },

  // Queue for offline requests
  async queueRequest(request: any): Promise<void> {
    const queue = await this.getQueuedRequests();
    queue.push(request);
    await AsyncStorage.setItem(KEYS.QUEUED_REQUESTS, JSON.stringify(queue));
  },

  async getQueuedRequests(): Promise<any[]> {
    const data = await AsyncStorage.getItem(KEYS.QUEUED_REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  async clearQueuedRequests(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.QUEUED_REQUESTS);
  },

  // Clear all data
  async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeRefreshToken();
    await this.removeUserData();
    await AsyncStorage.clear();
  },
};
