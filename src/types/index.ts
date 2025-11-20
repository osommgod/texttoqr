export type PlanType = "free" | "starter" | "professional" | "business" | "enterprise";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  conversionsUsed: number;
  isAdmin?: boolean;
  apiKey?: string;
  bearerToken?: string;
  role?: "user" | "admin";
  planStartedAt?: string | null;
  planRenewsAt?: string | null;
  isActive?: boolean;
}

export interface ConversionRecord {
  id: string;
  text: string;
  qrCodeUrl: string;
  timestamp: string;
  type: "url" | "text";
}

export interface AppConfig {
  id: string;
  config_key: string;
  is_maintenance: boolean;
  enable_user_registration: boolean;
  default_free_plan_limit: number;
  conversion_reset_period: string;
  maintenance_message?: string | null;
  support_email?: string | null;
  created_at?: string;
  updated_at?: string;
}
