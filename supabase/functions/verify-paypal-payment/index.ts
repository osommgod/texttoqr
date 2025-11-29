import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentVerificationRequest {
    orderID: string;
    userID: string;
    planType: string;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("=== PayPal Payment Verification Started ===");

        const { orderID, userID, planType }: PaymentVerificationRequest = await req.json();
        console.log("Request data:", { orderID, userID, planType });

        if (!orderID || !userID || !planType) {
            console.error("Missing required fields");
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get PayPal credentials from environment variables
        const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
        const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
        const PAYPAL_API_URL = Deno.env.get("PAYPAL_API_URL") || "https://api-m.sandbox.paypal.com";

        console.log("PayPal API URL:", PAYPAL_API_URL);
        console.log("Client ID exists:", !!PAYPAL_CLIENT_ID);
        console.log("Secret exists:", !!PAYPAL_SECRET);

        if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
            console.error("PayPal credentials not configured");
            return new Response(
                JSON.stringify({ error: "Payment gateway not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Step 1: Get PayPal access token
        console.log("Step 1: Getting PayPal access token...");
        const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`);
        const tokenResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        console.log("Token response status:", tokenResponse.status);

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("Failed to get PayPal access token:", errorText);
            return new Response(
                JSON.stringify({ error: "Failed to authenticate with payment gateway", details: errorText }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const tokenData = await tokenResponse.json();
        const access_token = tokenData.access_token;
        console.log("Access token obtained successfully");

        // Step 2: Verify the order with PayPal
        console.log("Step 2: Verifying order with PayPal...");
        const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}`, {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Order response status:", orderResponse.status);

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            console.error("Failed to verify PayPal order:", errorText);
            return new Response(
                JSON.stringify({ error: "Failed to verify payment", details: errorText }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const order = await orderResponse.json();
        console.log("Order status:", order.status);

        // Step 3: Validate payment status
        if (order.status !== "COMPLETED") {
            console.error("Payment not completed, status:", order.status);
            return new Response(
                JSON.stringify({ error: "Payment not completed", status: order.status }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Step 4: Update user's plan in Supabase
        console.log("Step 3: Updating user plan in Supabase...");
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { error: updateError } = await supabase
            .from("users_custom")
            .update({ plan: planType })
            .eq("id", userID);

        if (updateError) {
            console.error("Failed to update user plan:", updateError);
            return new Response(
                JSON.stringify({ error: "Payment verified but failed to update plan", details: updateError.message }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log("User plan updated successfully");

        // Step 5: Log the transaction
        console.log("Step 4: Logging transaction...");
        const { error: logError } = await supabase
            .from("payment_logs")
            .insert({
                user_id: userID,
                order_id: orderID,
                plan_type: planType,
                amount: order.purchase_units[0].amount.value,
                currency: order.purchase_units[0].amount.currency_code,
                status: "completed",
                gateway: "paypal",
                created_at: new Date().toISOString(),
            });

        if (logError) {
            console.warn("Failed to log payment (non-critical):", logError);
            // Don't fail the request if logging fails
        } else {
            console.log("Transaction logged successfully");
        }

        console.log("=== PayPal Payment Verification Completed Successfully ===");

        return new Response(
            JSON.stringify({
                success: true,
                message: "Payment verified and plan updated",
                orderID: order.id,
                status: order.status
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("=== Error in verify-paypal-payment ===");
        console.error("Error type:", error?.constructor?.name);
        console.error("Error message:", error?.message);
        console.error("Error stack:", error?.stack);
        return new Response(
            JSON.stringify({
                error: "Internal server error",
                message: error?.message || "Unknown error",
                type: error?.constructor?.name || "Error"
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
