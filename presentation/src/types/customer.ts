export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
}
