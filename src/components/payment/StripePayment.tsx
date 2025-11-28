import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { STRIPE_PUBLISHABLE_KEY } from "../../details";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface StripePaymentProps {
    amount: number;
    onSuccess: (details: any) => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

const CheckoutForm = ({ amount, onSuccess, onError, disabled }: StripePaymentProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || disabled) {
            return;
        }

        setProcessing(true);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setProcessing(false);
            return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
        });

        if (error) {
            onError(error.message || "Payment failed");
            setProcessing(false);
        } else {
            // In a real app, you would send paymentMethod.id to your server
            onSuccess(paymentMethod);
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border rounded-md bg-white">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: "#424770",
                                "::placeholder": {
                                    color: "#aab7c4",
                                },
                            },
                            invalid: {
                                color: "#9e2146",
                            },
                        },
                    }}
                />
            </div>
            <Button type="submit" disabled={!stripe || processing || disabled} className="w-full">
                {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
            </Button>
        </form>
    );
};

export const StripePayment = (props: StripePaymentProps) => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm {...props} />
        </Elements>
    );
};
