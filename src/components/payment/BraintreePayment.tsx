import { useEffect, useState, useRef } from "react";
import dropin from "braintree-web-drop-in";
import { Button } from "../ui/button";
import { BRAINTREE_TOKENIZATION_KEY } from "../../details";

interface BraintreePaymentProps {
    amount: number;
    onSuccess: (nonce: string) => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

export const BraintreePayment = ({ amount, onSuccess, onError, disabled }: BraintreePaymentProps) => {
    const [instance, setInstance] = useState<dropin.Dropin | null>(null);
    const [processing, setProcessing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let dropinInstance: dropin.Dropin | null = null;
        let isCancelled = false;

        const initializeBraintree = async () => {
            if (!containerRef.current) return;

            // Clear container before initializing
            containerRef.current.innerHTML = "";

            try {
                const instance = await dropin.create({
                    authorization: BRAINTREE_TOKENIZATION_KEY,
                    container: containerRef.current,
                    paypal: {
                        flow: "vault",
                    },
                });

                if (isCancelled) {
                    instance.teardown().catch(console.error);
                    return;
                }

                dropinInstance = instance;
                setInstance(instance);
            } catch (error) {
                if (!isCancelled) {
                    console.error("Braintree init error:", error);
                    // Only show error if it's not a duplicate initialization
                    if (!(error as any)?.message?.includes('already been used')) {
                        onError("Failed to initialize payment gateway. Please check configuration.");
                    }
                }
            }
        };

        initializeBraintree();

        return () => {
            isCancelled = true;
            if (dropinInstance) {
                dropinInstance.teardown().catch((err) => {
                    // Suppress common teardown errors
                    if (err?.message?.includes('removeChild') || err?.name === 'TypeError') {
                        return;
                    }
                    console.error("Teardown error:", err);
                });
            }
        };
    }, [onError]);

    const handlePayment = async () => {
        if (!instance) return;

        setProcessing(true);
        try {
            const { nonce } = await instance.requestPaymentMethod();
            onSuccess(nonce);
        } catch (error) {
            console.error(error);
            onError("Payment failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div ref={containerRef} />
            <Button
                onClick={handlePayment}
                disabled={!instance || processing || disabled}
                className="w-full"
            >
                {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
            </Button>
        </div>
    );
};
