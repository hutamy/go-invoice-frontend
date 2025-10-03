export interface User {
  id: number;
  name: string;
  email: string;
  address: string; 
  phone: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
}

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  client_id?: number;
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_phone?: string;
  issue_date?: string;
  due_date: string;
  subtotal?: number;
  tax_rate: number;
  tax_amount?: number;
  delivery_fee: number;
  total?: number;
  notes?: string;
  status: 'DRAFT' | 'SENT' | 'PAID';
  items: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  address: string;
  phone: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
}

export interface InvoiceFormData {
  client_id?: number;
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_phone?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  delivery_fee: number;
  notes?: string;
  status?: 'DRAFT' | 'SENT' | 'PAID';
  items: InvoiceItem[];
  // Sender details for non-authenticated users
  sender_name?: string;
  sender_email?: string;
  sender_phone?: string;
  sender_address?: string;
  sender_bank_name?: string;
  sender_bank_account_name?: string;
  sender_bank_account_number?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface InvoiceSummary {
  paid: number;
  total_revenue: number;
}
