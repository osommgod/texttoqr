// @ts-nocheck
import QRCode from "npm:qrcode";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for generate-qr function");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function decodeApiKey(apiKey: string | null): string | null {
  if (!apiKey?.startsWith("qr_")) {
    return null;
  }

  const base = apiKey.slice(3).replace(/-/g, "+").replace(/_/g, "/");
  const padding = base.length % 4 === 0 ? "" : "=".repeat(4 - (base.length % 4));

  try {
    const decoded = atob(base + padding).trim();
    return /\S+@\S+\.\S+/.test(decoded) ? decoded : null;
  } catch (_) {
    return null;
  }
}

function parseAuthorizationHeader(headerValue: string | null) {
  if (!headerValue) return null;

  const segments = headerValue.split(";").map(part => part.trim());
  let apiKey: string | null = null;
  let bearerToken: string | null = null;

  for (const segment of segments) {
    if (segment.toLowerCase().startsWith("apikey ")) {
      apiKey = segment.substring(7).trim();
    }
    if (segment.toLowerCase().startsWith("bearer ")) {
      bearerToken = segment.substring(7).trim();
    }
  }

  if (!apiKey || !bearerToken) {
    return null;
  }

  return { apiKey, bearerToken };
}

function extractCredentials(req: Request) {
  const apiKeyHeader = req.headers.get("x-api-key");
  const bearerHeader = req.headers.get("x-bearer-token");

  if (apiKeyHeader && bearerHeader) {
    return { apiKey: apiKeyHeader.trim(), bearerToken: bearerHeader.trim() };
  }

  return parseAuthorizationHeader(req.headers.get("Authorization"));
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function findUserByCredentials(apiKey: string, bearerToken: string) {
  const { data, error } = await supabase
    .from("users_custom")
    .select("id, email, plan, conversions_used, api_key, bearer_token")
    .eq("api_key", apiKey)
    .eq("bearer_token", bearerToken)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch user by credentials", error);
    return null;
  }

  return data;
}

async function findExistingConversion(userId: string, text: string) {
  const { data, error } = await supabase
    .from("conversion_history")
    .select("id, qr_code_url")
    .eq("user_id", userId)
    .eq("text", text)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to check existing conversion", error);
  }

  return data;
}

serve(async req => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key, X-Bearer-Token",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ status: "error", message: "Method not allowed" }, 405);
  }

  const auth = extractCredentials(req);
  if (!auth) {
    return jsonResponse({ status: "error", message: "Missing ApiKey or Bearer token" }, 401);
  }

  const owner = decodeApiKey(auth.apiKey);
  if (!owner) {
    return jsonResponse({ status: "error", message: "Invalid API key" }, 401);
  }

  if (!auth.bearerToken.startsWith("br_")) {
    return jsonResponse({ status: "error", message: "Invalid bearer token" }, 401);
  }

  const userRecord = await findUserByCredentials(auth.apiKey, auth.bearerToken);
  if (!userRecord) {
    return jsonResponse({ status: "error", message: "Invalid API credentials" }, 401);
  }

  const { text } = await req.json().catch(() => ({ text: "" }));
  if (typeof text !== "string" || !text.trim()) {
    return jsonResponse({ status: "error", message: "A non-empty text field is required" }, 400);
  }

  try {
    const trimmedText = text.trim();
    const conversionType = /^https?:\/\//i.test(trimmedText) ? "url" : "text";

    const existing = await findExistingConversion(userRecord.id, trimmedText);
    if (existing) {
      return jsonResponse({
        status: "success",
        message: "QR code retrieved from cache",
        qrCodeUrl: existing.qr_code_url,
        owner,
        conversionsUsed: userRecord.conversions_used ?? 0,
        cached: true,
      });
    }

    const qrCodeUrl = await QRCode.toDataURL(trimmedText, {
      width: 300,
      margin: 2,
      color: { dark: "#000", light: "#fff" },
    });

    // Optional: enforce plan limits if monthly caps exist
    // const planLimit = await getPlanLimit(userRecord.plan);
    // if (planLimit !== null && (userRecord.conversions_used ?? 0) >= planLimit) {
    //   return jsonResponse({ status: "error", message: "Conversion limit reached" }, 403);
    // }

    const updatedCount = (userRecord.conversions_used ?? 0) + 1;

    const historyResult = await supabase.from("conversion_history").insert({
      user_id: userRecord.id,
      text: trimmedText,
      qr_code_url: qrCodeUrl,
      type: conversionType,
    });

    if (historyResult.error) {
      console.error("Failed to insert conversion history", historyResult.error);
    }

    const updateResult = await supabase
      .from("users_custom")
      .update({ conversions_used: updatedCount })
      .eq("id", userRecord.id);

    if (updateResult.error) {
      console.error("Failed to update conversions count", updateResult.error);
    }

    return jsonResponse({
      status: "success",
      message: "QR code generated",
      qrCodeUrl,
      owner,
      conversionsUsed: updatedCount,
      cached: false,
    });
  } catch (error) {
    console.error("Supabase function error", error);
    return jsonResponse({ status: "error", message: "Failed to generate QR code" }, 500);
  }
});
