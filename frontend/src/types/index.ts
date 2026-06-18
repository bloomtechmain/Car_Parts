export interface User {
  id: number;
  email: string;
  role: 'admin' | 'supplier';
  company_name: string | null;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_vin?: string | null;
  part_name: string;
  part_description?: string | null;
  part_category: string;
  status: 'open' | 'replied' | 'closed';
  created_at: string;
  reply_count?: number;
  i_replied?: boolean;
}

export interface AdminTicket extends Ticket {
  customer_name: string;
  customer_email: string;
}

export interface Customer {
  full_name: string;
  email: string;
  phone: string;
  location: string;
}

export interface SupplierReply {
  id: number;
  ticket_id: number;
  supplier_id: number;
  price: number | null;
  delivery_days: number | null;
  admin_price: number | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  company_name?: string;
  supplier_email?: string;
}

export interface TicketDetail extends Ticket {
  customer?: Customer;
  replies: SupplierReply[];
  my_reply?: SupplierReply | null;
}

export interface FindPartsFormData {
  car_make: string;
  car_model: string;
  car_year: number;
  car_vin?: string;
  part_name: string;
  part_description?: string;
  part_category: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
}

export interface SupplierAccount {
  id: number;
  email: string;
  company_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}
