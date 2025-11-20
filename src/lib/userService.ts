import { supabase } from "./supabaseClient";
import { PlanType, User } from "../types";
import { generateApiKey, generateBearerToken } from "./apiKey";

interface UserRow {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  conversions_used: number;
  api_key: string | null;
  bearer_token: string | null;
  role: string | null;
  plan_started_at: string | null;
  plan_renews_at: string | null;
  is_active: boolean | null;
}

const mapRowToUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  plan: row.plan ?? "free",
  conversionsUsed: row.conversions_used ?? 0,
  apiKey: row.api_key ?? undefined,
  bearerToken: row.bearer_token ?? undefined,
  isAdmin: row.email === "admin@qrgen.com" || row.role === "admin",
  role: (row.role as User["role"]) ?? "user",
  planStartedAt: row.plan_started_at,
  planRenewsAt: row.plan_renews_at,
  isActive: row.is_active ?? true,
});

export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users_custom")
    .select("id, email, name, plan, conversions_used, api_key, bearer_token, role, plan_started_at, plan_renews_at, is_active")
    .eq("id", userId)
    .maybeSingle<UserRow>();

  if (error || !data) {
    if (error?.code !== "PGRST116") {
      console.error("Failed to load user profile", error);
    }
    return null;
  }

  return mapRowToUser(data);
}

interface CreateUserProfileParams {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
}

export async function createUserProfile({ id, email, name, plan }: CreateUserProfileParams): Promise<User | null> {
  const apiKey = generateApiKey(email);
  const bearerToken = generateBearerToken();
  const now = new Date().toISOString();
  const oneMonthAhead = new Date();
  oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1);
  const renewsAt = oneMonthAhead.toISOString();

  const { data, error } = await supabase
    .from("users_custom")
    .insert({
      id,
      email,
      name,
      plan,
      conversions_used: 0,
      api_key: apiKey,
      bearer_token: bearerToken,
      plan_started_at: now,
      plan_renews_at: renewsAt,
    })
    .select("id, email, name, plan, conversions_used, api_key, bearer_token, role, plan_started_at, plan_renews_at, is_active")
    .single<UserRow>();

  if (error || !data) {
    console.error("Failed to create user profile", error);
    return null;
  }

  return mapRowToUser(data);
}

export async function ensureUserProfile(params: CreateUserProfileParams): Promise<User | null> {
  const existing = await getUserProfile(params.id);
  if (existing) {
    return existing;
  }
  return createUserProfile(params);
}
