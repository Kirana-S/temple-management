export interface Devotee {
  id: number;
  devotee_id: string;
  full_name: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  registration_date: string;
}

export interface Deity {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface PoojaService {
  id: number;
  pooja_id: string;
  name: string;
  deity_id?: number | null;
  deity_name?: string | null;
  description?: string | null;
  amount: number;
  is_available: boolean;
  created_at?: string;
}

export interface PoojaBooking {
  id: number;
  booking_id: string;
  devotee_id?: number | null;
  devotee_name: string;
  mobile: string;
  deity_id?: number | null;
  deity_name?: string | null;
  pooja_service_id?: number | null;
  pooja_name?: string | null;
  booking_date: string;
  pooja_date: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  notes?: string | null;
  created_at?: string;
}

export interface Donation {
  id: number;
  donation_id: string;
  receipt_number: string;
  donor_name: string;
  mobile: string;
  category: string;
  amount: number;
  donation_date: string;
  payment_method: string;
  transaction_reference?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface Expense {
  id: number;
  expense_id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  payment_method: string;
  description?: string | null;
  created_at?: string;
}

export interface DashboardStats {
  total_devotees: number;
  total_donations: number;
  today_donations: number;
  total_bookings: number;
  today_bookings: number;
  total_expenses: number;
  monthly_income: number;
  monthly_expenses: number;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expenses: number;
}
