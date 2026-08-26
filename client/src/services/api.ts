import { 
  User, 
  MarketQuote, 
  PortfolioSummary, 
  Position, 
  Order, 
  Transaction, 
  AdminDashboardMetrics, 
  AuditLog,
  PlatformSettings 
} from '../types';

const BASE_URL = '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('apextrader_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('apextrader_token', token);
    } else {
      localStorage.removeItem('apextrader_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.error?.message || 'Si è verificato un errore nella richiesta.');
    }

    return data.data as T;
  }

  // --- Auth API ---
  public async register(payload: { email: string; password: string; fullName: string }) {
    const res = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  public async login(payload: { email: string; password: string }) {
    const res = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  public logout() {
    this.setToken(null);
  }

  // --- Market Quotes ---
  public async getMarketQuotes(): Promise<MarketQuote[]> {
    return this.request<MarketQuote[]>('/markets/quotes');
  }

  // --- Client Platform ---
  public async getPortfolio(): Promise<PortfolioSummary> {
    return this.request<PortfolioSummary>('/client/portfolio');
  }

  public async getPositions(): Promise<Position[]> {
    return this.request<Position[]>('/client/positions');
  }

  public async closePosition(positionId: string): Promise<any> {
    return this.request<any>(`/client/positions/${positionId}/close`, {
      method: 'POST',
    });
  }

  public async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/client/orders');
  }

  public async placeOrder(payload: { symbol: string; side: 'BUY' | 'SELL'; quantity: number }): Promise<any> {
    return this.request<any>('/client/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/client/transactions');
  }

  public async resetDemoBalance(): Promise<any> {
    return this.request<any>('/client/reset-demo', {
      method: 'POST',
    });
  }

  // --- Admin CRM ---
  public async getAdminDashboard(): Promise<AdminDashboardMetrics> {
    return this.request<AdminDashboardMetrics>('/admin/dashboard');
  }

  public async getAdminUsers(params?: { search?: string; role?: string; status?: string }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<any[]>(`/admin/users${query}`);
  }

  public async getAdminUserDetail(userId: string): Promise<any> {
    return this.request<any>(`/admin/users/${userId}`);
  }

  public async adjustUserFunds(userId: string, payload: { amount: number; type: 'ADD' | 'REMOVE'; reason: string }): Promise<any> {
    return this.request<any>(`/admin/users/${userId}/funds`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async setUserStatus(userId: string, payload: { status: 'ACTIVE' | 'SUSPENDED'; reason: string }): Promise<any> {
    return this.request<any>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public async executeOrderForUser(
    userId: string,
    payload: { symbol: string; side: 'BUY' | 'SELL'; quantity: number; takeProfitPrice?: number; stopLossPrice?: number }
  ): Promise<any> {
    return this.request<any>(`/admin/users/${userId}/orders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async closePositionForUser(userId: string, positionId: string): Promise<any> {
    return this.request<any>(`/admin/users/${userId}/positions/${positionId}/close`, {
      method: 'POST',
    });
  }

  public async createUserByAdmin(payload: { email: string; password?: string; fullName: string; initialBalance?: number }): Promise<any> {
    return this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteUserByAdmin(userId: string): Promise<any> {
    return this.request<any>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  public async getAdminGlobalPositions(): Promise<any[]> {
    return this.request<any[]>('/admin/positions');
  }

  public async getAdminAuditLogs(limit = 100): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(`/admin/audit-logs?limit=${limit}`);
  }

  public async getPublicSettings(): Promise<PlatformSettings> {
    const res = await fetch('/api/v1/public/settings');
    const json = await res.json();
    return json.data;
  }

  public async getAdminSettings(): Promise<PlatformSettings> {
    return this.request<PlatformSettings>('/admin/settings');
  }

  public async updateAdminSettings(payload: Partial<PlatformSettings>): Promise<PlatformSettings> {
    return this.request<PlatformSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
