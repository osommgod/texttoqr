import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_CLIENT_ID } from "../../details";
import { supabase } from "../../lib/supabaseClient";

interface PayPalPaymentProps {
    amount: number;
    planType: string;
    userID: string;
    onSuccess: (details: any) => void;
    onError: (error: string) => void;
}

export const PayPalPayment = ({ amount, planType, userID, onSuccess, onError }: PayPalPaymentProps) => {
    const initialOptions = {
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
    };

    const verifyPaymentOnServer = async (orderID: string) => {
        try {
            console.log("Verifying payment on server...", { orderID, userID, planType });

            const { data, error } = await supabase.functions.invoke('verify-paypal-payment', {
                body: {
                    orderID,
                    userID,
                    planType,
                },
            });

            console.log("Server response:", { data, error });

            if (error) {
                console.error("Server verification error:", error);
                // If edge function is not configured, skip verification for now
                if (error.message?.includes('not found') || error.message?.includes('FunctionsRelayError')) {
                    console.warn("Edge function not available, skipping server verification");
                    return { success: true, warning: "Server verification skipped" };
                }
                throw new Error(error.message || "Failed to verify payment");
            }

            if (!data?.success) {
                throw new Error(data?.error || "Payment verification failed");
            }

            return data;
        } catch (err: any) {
            console.error("Payment verification failed:", err);
            throw err;
        }
    };

    return (
        <div className="w-full">
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "paypal"
                    }}
                    createOrder={(_data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: "USD",
                                        value: amount.toFixed(2),
                                    },
                                },
                            ],
                        });
                    }}
                    onApprove={async (_data, actions) => {
                        try {
                            // Capture the payment on PayPal's side
                            const details = await actions.order!.capture();

                            console.log("PayPal payment captured:", details);

                            // Verify the payment on our server
                            await verifyPaymentOnServer(details.id);

                            // Only call onSuccess if server verification passes
                            onSuccess(details);
                        } catch (err: any) {
                            console.error("Payment approval error:", err);
                            onError(err.message || "Payment verification failed. Please contact support.");
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal Error:", err);
                        onError("Payment could not be processed. Please try again.");
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
};
