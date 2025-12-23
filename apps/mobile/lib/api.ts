import {
  User,
  AuthTokens,
  RegisterInput,
  Prediction,
  MacroPredictionInput,
  TimingPredictionInput,
  DivinationInput,
  CompatibleAsset,
  BirthChart,
  SubscriptionStatus,
  IAPReceipt,
  ApiResponse,
} from '@/types';
import { storage } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  async setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await this.request<ApiResponse<AuthTokens>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = response.data.accessToken;
    await storage.setToken(response.data.accessToken);
    return response.data;
  }

  async register(data: RegisterInput): Promise<AuthTokens> {
    const response = await this.request<ApiResponse<AuthTokens>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.token = response.data.accessToken;
    await storage.setToken(response.data.accessToken);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
    await storage.removeToken();
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.request<ApiResponse<AuthTokens>>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    this.token = response.data.accessToken;
    await storage.setToken(response.data.accessToken);
    return response.data;
  }

  // User endpoints
  async getProfile(): Promise<User> {
    const response = await this.request<ApiResponse<User>>('/users/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.request<ApiResponse<User>>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Birth Chart endpoints
  async getBirthChart(): Promise<BirthChart> {
    const response = await this.request<ApiResponse<BirthChart>>('/birthchart');
    return response.data;
  }

  // Prediction endpoints
  async getPredictions(limit = 10): Promise<Prediction[]> {
    const response = await this.request<ApiResponse<Prediction[]>>(
      `/predictions?limit=${limit}`
    );
    return response.data;
  }

  async getPrediction(id: string): Promise<Prediction> {
    const response = await this.request<ApiResponse<Prediction>>(`/predictions/${id}`);
    return response.data;
  }

  async createMacroPrediction(input: MacroPredictionInput): Promise<Prediction> {
    const response = await this.request<ApiResponse<Prediction>>('/predictions/macro', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.data;
  }

  async createTimingPrediction(input: TimingPredictionInput): Promise<Prediction> {
    const response = await this.request<ApiResponse<Prediction>>('/predictions/timing', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.data;
  }

  async createDivination(input: DivinationInput): Promise<Prediction> {
    const response = await this.request<ApiResponse<Prediction>>('/predictions/divination', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.data;
  }

  // Compatibility endpoints
  async getCompatibilities(): Promise<CompatibleAsset[]> {
    const response = await this.request<ApiResponse<CompatibleAsset[]>>('/compatibility');
    return response.data;
  }

  async getAssetCompatibility(symbol: string): Promise<CompatibleAsset> {
    const response = await this.request<ApiResponse<CompatibleAsset>>(
      `/compatibility/${symbol}`
    );
    return response.data;
  }

  // Subscription endpoints
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await this.request<ApiResponse<SubscriptionStatus>>('/subscription');
    return response.data;
  }

  async validateReceipt(receipt: IAPReceipt): Promise<void> {
    await this.request('/subscription/validate-receipt', {
      method: 'POST',
      body: JSON.stringify(receipt),
    });
  }

  // Mobile-specific endpoints
  async registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    await this.request('/users/push-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  }

  async updateNotificationSettings(settings: any): Promise<void> {
    await this.request('/users/notification-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const api = new ApiClient();
