import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  User, 
  Client, 
  Invoice, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData, 
  InvoiceFormData,
  ApiResponse,
  InvoiceSummary
} from '../types/index.ts';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: Error) => void;
  }> = [];

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          // Skip refresh for auth endpoints to prevent infinite loops
          if (originalRequest.url?.includes('/auth/sign-in') || 
              originalRequest.url?.includes('/auth/sign-up') || 
              originalRequest.url?.includes('/auth/refresh-token')) {
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            // If refresh is already in progress, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
              return this.api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              // Use a separate axios instance for refresh to avoid interceptor loop
              const response = await axios.post(
                `${this.baseURL}/v1/protected/auth/refresh-token`,
                { refresh_token: refreshToken },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );

              const { access_token } = response.data.data || response.data;
              localStorage.setItem('access_token', access_token);

              // Process queued requests
              this.processQueue(null);

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.api(originalRequest);
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect
              this.processQueue(refreshError instanceof Error ? refreshError : new Error('Token refresh failed'));
              this.logout();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          } else {
            // No refresh token, redirect to login
            this.logout();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: Error | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response: AxiosResponse<ApiResponse<AuthTokens>> = await this.api.post('/v1/public/auth/sign-in', credentials);
    return response.data.data!;
  }

  async register(data: RegisterData): Promise<User> {
    await this.api.post('/v1/public/auth/sign-up', data);
    // Registration returns tokens, but we need to get user data separately
    // For now, we'll return a placeholder user object
    return {
      id: 0,
      name: data.name,
      email: data.email,
      address: data.address,
      phone: data.phone,
      bank_name: data.bank_name,
      bank_account_name: data.bank_account_name,
      bank_account_number: data.bank_account_number,
    };
  }

  async refreshToken(refresh_token: string): Promise<AuthTokens> {
    const response: AxiosResponse<AuthTokens> = await this.api.post('/v1/protected/auth/refresh-token', {
      refresh_token,
    });
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // User methods
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/v1/protected/me');
    return response.data.data!;
  }

  // Update user profile (name, email, address, phone)
  async updateUserProfile(data: { name: string; email: string; address: string; phone: string }): Promise<void> {
    await this.api.put('/v1/protected/me/profile', data);
  }

  // Update user banking info (bank_name, bank_account_name, bank_account_number)
  async updateUserBanking(data: { bank_name: string; bank_account_name: string; bank_account_number: string }): Promise<void> {
    await this.api.put('/v1/protected/me/banking', data);
  }

  // Change user password
  async changeUserPassword(data: { old_password: string; new_password: string }): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.api.post('/v1/protected/me/change-password', data);
    return response.data.data!;
  }

  // Deactivate user account (soft delete)
  async deactivateUserAccount(): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.api.post('/v1/protected/me/deactivate');
    return response.data.data!;
  }

  // Client methods
  async getClients(params?: { page?: number; page_size?: number; search?: string }): Promise<{ data: Client[]; pagination: { page: number; page_size: number; total_items: number; total_pages: number } }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const response: AxiosResponse<ApiResponse<{ data: Client[]; pagination: { page: number; page_size: number; total_items: number; total_pages: number } }>> = await this.api.get(`/v1/protected/clients?${queryParams.toString()}`);
    return response.data.data!;
  }
  
  async getClient(id: number): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await this.api.get(`/v1/protected/clients/${id}`);
    return response.data.data!;
  }

  async createClient(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await this.api.post('/v1/protected/clients', data);
    return response.data.data!;
  }

  async updateClient(id: number, data: Partial<Client>): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await this.api.put(`/v1/protected/clients/${id}`, data);
    return response.data.data!;
  }

  async deleteClient(id: number): Promise<void> {
    await this.api.delete(`/v1/protected/clients/${id}`);
  }

  // Invoice methods
  async getInvoices(params?: { page?: number; page_size?: number; search?: string; status?: string }): Promise<{ data: Invoice[]; pagination: { page: number; page_size: number; total_items: number; total_pages: number } }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    
    const response: AxiosResponse<ApiResponse<{ data: Invoice[]; pagination: { page: number; page_size: number; total_items: number; total_pages: number } }>> = await this.api.get(`/v1/protected/invoices?${queryParams.toString()}`);
    return response.data.data!;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    const response: AxiosResponse<ApiResponse<Invoice[]>> = await this.api.get('/v1/protected/invoices?all=true');
    return response.data.data!;
  }

  async getInvoice(id: number): Promise<Invoice> {
    const response: AxiosResponse<ApiResponse<Invoice>> = await this.api.get(`/v1/protected/invoices/${id}`);
    return response.data.data!;
  }

  async createInvoice(data: InvoiceFormData): Promise<Invoice> {
    const baseInvoiceData = {
      invoice_number: data.invoice_number || '',
      issue_date: data.issue_date,
      due_date: data.due_date,
      notes: data.notes || '',
      tax_rate: data.tax_rate,
      delivery_fee: data.delivery_fee,
      items: data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    let invoiceData;
    // If client_id is present, user selected from list
    if (data.client_id) {
      invoiceData = {
        ...baseInvoiceData,
        client_id: data.client_id
      };
    } else {
      // If no client_id, user entered manually
      invoiceData = {
        ...baseInvoiceData,
        client_name: data.client_name,
        client_email: data.client_email || '',
        client_address: data.client_address || '',
        client_phone: data.client_phone || ''
      };
    }

    const response: AxiosResponse<Invoice> = await this.api.post('/v1/protected/invoices', invoiceData);
    return response.data;
  }

  async updateInvoice(id: number, data: Partial<InvoiceFormData>): Promise<Invoice> {
    const baseInvoiceData = {
      invoice_number: data.invoice_number || '',
      issue_date: data.issue_date,
      due_date: data.due_date,
      notes: data.notes || '',
      delivery_fee: data.delivery_fee,
      tax_rate: data.tax_rate,
      status: data.status || 'DRAFT',
      items: data.items?.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    let invoiceData;
    // If client_id is present, user selected from list
    if (data.client_id) {
      invoiceData = {
        ...baseInvoiceData,
        client_id: data.client_id
      };
    } else {
      // If no client_id, user entered manually
      invoiceData = {
        ...baseInvoiceData,
        client_name: data.client_name,
        client_email: data.client_email || '',
        client_address: data.client_address || '',
        client_phone: data.client_phone || ''
      };
    }

    const response: AxiosResponse<Invoice> = await this.api.put(`/v1/protected/invoices/${id}`, invoiceData);
    return response.data;
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    const response: AxiosResponse<Invoice> = await this.api.patch(`/v1/protected/invoices/${id}/status`, { status });
    return response.data;
  }

  async deleteInvoice(id: number): Promise<void> {
    await this.api.delete(`/v1/protected/invoices/${id}`);
  }

  async downloadInvoice(id: number): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.post(`/v1/protected/invoices/${id}/pdf`, {}, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getInvoiceSummary(): Promise<InvoiceSummary> {
    const response: AxiosResponse<ApiResponse<InvoiceSummary>> = await this.api.get('/v1/protected/invoices/summary');
    return response.data.data!;
  }

  // Public invoice generation (no auth required)
  async generatePublicInvoice(data: InvoiceFormData): Promise<Blob> {
    const publicInvoiceData = {
      invoice_number: data.invoice_number || `INV-${Date.now()}`,
      due_date: data.due_date,
      notes: data.notes || '',
      issue_date: data.issue_date,
      sender: {
        name: data.sender_name || '',
        email: data.sender_email || '',
        address: data.sender_address || '',
        phone_number: data.sender_phone || '',
        bank_name: data.sender_bank_name || '',
        bank_account_name: data.sender_bank_account_name || '',
        bank_account_number: data.sender_bank_account_number || ''
      },
      recipient: {
        name: data.client_name,
        email: data.client_email || '',
        phone: data.client_phone || '',
        address: data.client_address || ''
      },
      items: data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
      })),
      tax_rate: data.tax_rate,
      delivery_fee: data.delivery_fee,
    };

    const response: AxiosResponse<Blob> = await axios.post(
      `${this.baseURL}/v1/public/invoices/generate-pdf`,
      publicInvoiceData,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export const apiService = new ApiService();
