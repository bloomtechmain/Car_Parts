import { Request } from 'express';

export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'supplier';
  company_name: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_vin: string | null;
  part_name: string;
  part_description: string | null;
  part_category: string;
  status: 'open' | 'replied' | 'closed';
  created_at: string;
}

export interface Customer {
  id: number;
  ticket_id: number;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
}

export interface SupplierReply {
  id: number;
  ticket_id: number;
  supplier_id: number;
  price: number | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'supplier';
  company_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}
