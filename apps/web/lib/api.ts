import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  WalletNonceRequest,
  WalletNonceResponse,
  WalletVerifyRequest,
  WalletVerifyResponse,
  User,
  AuthTokens,
  LinkedAccountsResponse,
  EmailLinkingRequest,
  EmailLinkingResponse,
  EmailVerifyRequest,
  Asset,
  Prediction,
  CreatePredictionRequest,
  CreatePredictionResponse,
  CompatibilityResult,
  CryptoPaymentRequest,
  CryptoPaymentResponse,
  Transaction,
  PolymarketEvent,
  PaginatedResponse,
  APIError,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

class APIClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<APIError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = await this.refreshAccessToken();
            this.setTokens(tokens);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<{ accessToken: string; expiresIn: number }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      return {
        accessToken: response.data.accessToken,
        refreshToken: refreshToken,
        expiresIn: response.data.expiresIn,
      };
    })();

    try {
      const tokens = await this.refreshPromise;
      return tokens;
    } finally {
      this.refreshPromise = null;
    }
  }

  // Authentication endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', data);
    this.setTokens(response.data.tokens);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.client.post<RegisterResponse>('/auth/register', data);
    this.setTokens(response.data.tokens);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  // Wallet authentication
  async requestWalletNonce(data: WalletNonceRequest): Promise<WalletNonceResponse> {
    const response = await this.client.post<WalletNonceResponse>('/auth/wallet/nonce', data);
    return response.data;
  }

  async verifyWalletSignature(data: WalletVerifyRequest): Promise<WalletVerifyResponse> {
    const response = await this.client.post<WalletVerifyResponse>('/auth/wallet/verify', data);
    this.setTokens(response.data.tokens);
    return response.data;
  }

  // Account linking
  async getLinkedAccounts(): Promise<LinkedAccountsResponse> {
    const response = await this.client.get<LinkedAccountsResponse>('/account/linked');
    return response.data;
  }

  async requestEmailLinking(data: EmailLinkingRequest): Promise<EmailLinkingResponse> {
    const response = await this.client.post<EmailLinkingResponse>('/account/link/email', data);
    return response.data;
  }

  async verifyEmailLinking(data: EmailVerifyRequest): Promise<{ success: boolean; user: User }> {
    const response = await this.client.post('/account/link/email/verify', data);
    return response.data;
  }

  async requestWalletLinkingNonce(data: WalletNonceRequest): Promise<WalletNonceResponse> {
    const response = await this.client.post<WalletNonceResponse>('/account/link/wallet/nonce', data);
    return response.data;
  }

  async verifyWalletLinking(data: WalletVerifyRequest & { isPrimary?: boolean; label?: string }): Promise<{ success: boolean; wallet: any }> {
    const response = await this.client.post('/account/link/wallet/verify', data);
    return response.data;
  }

  async unlinkAccount(type: string, id?: string): Promise<{ success: boolean; message: string }> {
    const url = id ? `/account/unlink/${type}/${id}` : `/account/unlink/${type}`;
    const response = await this.client.delete(url);
    return response.data;
  }

  // Assets
  async getAssets(params?: {
    type?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Asset>> {
    const response = await this.client.get<PaginatedResponse<Asset>>('/assets', { params });
    return response.data;
  }

  async getAsset(id: string): Promise<Asset> {
    const response = await this.client.get<Asset>(`/assets/${id}`);
    return response.data;
  }

  async searchAssets(query: string, limit?: number): Promise<{ results: Asset[] }> {
    const response = await this.client.get('/assets/search', {
      params: { q: query, limit },
    });
    return response.data;
  }

  // Predictions
  async createPrediction(data: CreatePredictionRequest): Promise<CreatePredictionResponse> {
    const response = await this.client.post<CreatePredictionResponse>('/predictions', data);
    return response.data;
  }

  async getPrediction(id: string): Promise<Prediction> {
    const response = await this.client.get<Prediction>(`/predictions/${id}`);
    return response.data;
  }

  async getPredictions(params?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Prediction>> {
    const response = await this.client.get<PaginatedResponse<Prediction>>('/predictions', { params });
    return response.data;
  }

  // Compatibility
  async getCompatibility(userId: string, assetId: string): Promise<CompatibilityResult> {
    const response = await this.client.get<CompatibilityResult>(`/compatibility/${userId}/${assetId}`);
    return response.data;
  }

  async getTopCompatibleAssets(
    userId: string,
    params?: { limit?: number; assetType?: string; minScore?: number }
  ): Promise<{ userId: string; topAssets: any[] }> {
    const response = await this.client.get(`/compatibility/${userId}/top`, { params });
    return response.data;
  }

  // Polymarket
  async getPolymarketEvents(params?: {
    category?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<PolymarketEvent>> {
    const response = await this.client.get<PaginatedResponse<PolymarketEvent>>('/polymarket/events', { params });
    return response.data;
  }

  async getPolymarketEvent(id: string): Promise<PolymarketEvent> {
    const response = await this.client.get<PolymarketEvent>(`/polymarket/events/${id}`);
    return response.data;
  }

  // Payments
  async createCryptoPayment(data: CryptoPaymentRequest): Promise<CryptoPaymentResponse> {
    const response = await this.client.post<CryptoPaymentResponse>('/payments/crypto/create', data);
    return response.data;
  }

  async confirmCryptoPayment(transactionId: string, transactionHash: string): Promise<Transaction> {
    const response = await this.client.post<Transaction>('/payments/crypto/confirm', {
      transactionId,
      transactionHash,
    });
    return response.data;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await this.client.get<Transaction>(`/payments/transactions/${id}`);
    return response.data;
  }

  async getTransactions(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await this.client.get<PaginatedResponse<Transaction>>('/payments/transactions', { params });
    return response.data;
  }

  async getCreditsBalance(): Promise<{ userId: string; creditsBalance: number }> {
    const response = await this.client.get('/payments/credits');
    return response.data;
  }

  // User profile
  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await this.client.patch<User>(`/users/${userId}`, data);
    return response.data;
  }

  async getUserBirthChart(userId: string): Promise<any> {
    const response = await this.client.get(`/users/${userId}/birth-chart`);
    return response.data;
  }

  async createUserBirthChart(userId: string, data: any): Promise<any> {
    const response = await this.client.post(`/users/${userId}/birth-chart`, data);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;
