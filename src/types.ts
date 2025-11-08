// Core domain interfaces for the agenda system

export interface Company {
  id: number;
  name: string;
  cnpj?: string | null;
  cpf?: string | null;
  legal_name?: string | null;
  phone?: string | null;
  website?: string | null;
  email?: string | null;
  address?: string | null;
  plan?: string | null;
  next_renewal?: string | null;
  require_evolution?: boolean;
  language?: string;
  timezone?: string;
  // legacy schedule fields removed in favor of sessions
  created_at: string;
  updated_at: string;
}

export interface CompanyWhatsappSettings {
  company_id: number;
  send_type: "daily" | "before" | "none";
  time?: string | null;
  hours_before?: number | null;
  instance_id?: string | null;
  updated_at: string;
}

// Employee is the platform user
export interface Employee {
  id: number;
  company_id: number | null;
  name: string;
  email: string;
  is_admin: boolean;
  color?: string | null;
  capacity: number;
  created_at: string;
  updated_at: string;
  specialties?: Specialty[]; // optional expanded field
}

export interface Client {
  id: number;
  company_id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  cpf?: string | null;
  zip?: string | null;
  street?: string | null;
  address_number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  insurance?: string | null;
  plan?: string | null;
  card_number?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  company_id: number;
  client_id: number | null;
  employee_id: number;
  specialty_id?: number | null;
  appointment_type?: 'individual';
  room_id?: number | null;
  start_datetime: string; // ISO datetime
  duration_minutes: number;
  done: boolean;
  notes?: string | null;
  evolution?: string | null;
  specialty_name?: string | null;
  recurrence_group_id?: number | null;
  recurring_plan_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Specialty {
  id: number;
  company_id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  company_id: number;
  client_id: number;
  type?: 'monthly' | 'per_consultation';
  total_amount_cents: number;
  status?: 'pending' | 'paid';
  paid_at: string; // planned or actual payment date
  period_start?: string | null;
  period_end?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  appointment_id?: number | null;
  recurring_plan_id?: number | null;
  plan_name?: string | null;
}

export interface RecurringPlan {
  id: number;
  company_id: number;
  client_id: number;
  employee_id: number;
  room_id?: number | null;
  specialty_id?: number | null;
  name: string;
  price_cents: number;
  billing_period: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  billing_day: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  schedules?: RecurringPlanSchedule[];
}

export interface RecurringPlanSchedule {
  id: number;
  plan_id: number;
  weekday: number; // 0-6 (Dom-Sáb)
  start_time: string; // HH:MM:SS
  end_time: string;   // HH:MM:SS
  created_at: string;
  updated_at: string;
}

export type PlanPeriod = 'daily' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export interface Plan {
  id: number;
  company_id: number;
  name: string;
  period: PlanPeriod;
  price_cents: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  company_id: number;
  client_id: number;
  plan_id: number;
  status: 'active' | 'canceled' | 'expired';
  period_start: string;
  period_end: string;
  next_renewal?: string | null;
  price_cents: number;
  canceled_at?: string | null;
  created_at: string;
  updated_at: string;
  plan_name?: string;
  plan_period?: PlanPeriod;
}

export interface SubscriptionInvoice {
  id: number;
  company_id: number;
  client_id: number;
  subscription_id: number;
  period_start: string;
  period_end: string;
  due_date: string;
  amount_cents: number;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  paid_at?: string | null;
  payment_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CompanySubscription {
  id: number;
  company_id: number;
  plan: string;
  period_start: string;
  period_end: string;
  next_renewal: string;
  price_cents: number;
  created_at: string;
  updated_at: string;
}

export interface CompanySubscriptionInvoice {
  id: number;
  company_id: number;
  subscription_id: number;
  period_start: string;
  period_end: string;
  amount_cents: number;
  paid_at: string | null;
  gateway_charge_id?: string | null;
  gateway_payment_id?: string | null;
  refunded_amount_cents?: number;
  refunded_at?: string | null;
  refund_id?: string | null;
  gateway_payload?: any | null;
  created_at: string;
  updated_at: string;
}

export interface CompanySubscriptionCharge {
  charge_id: string;
  client_secret?: string | null;
}

// UI alias: Professional equals Employee
export type Professional = Employee;

export type BlogBlock =
  | { type: "text"; text: string }
  | { type: "image"; url: string; alt?: string | null }
  | { type: "heading"; level: number; text: string };

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  subtitle?: string | null;
  content: BlogBlock[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_site_name?: string | null;
  meta_image?: string | null;
  meta_image_width?: number | null;
  meta_image_height?: number | null;
  meta_image_type?: string | null;
  created_at: string;
  updated_at: string;
}
