import { CheckCircle, Home, Receipt } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface PaymentSuccessProps {
    planName?: string;
    amount?: number;
    onGoHome: () => void;
}

export function PaymentSuccess({ planName = "Professional", amount = 29, onGoHome }: PaymentSuccessProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">
                    Your payment has been processed successfully.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600">Plan Upgraded To:</span>
                        <span className="font-semibold text-gray-900">{planName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-semibold text-gray-900">${amount}/month</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                        <Receipt className="w-4 h-4" />
                        A receipt has been sent to your email
                    </p>

                    <Button onClick={onGoHome} className="w-full gap-2" size="lg">
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Button>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                    Thank you for upgrading! Your new features are now active.
                </p>
            </Card>
        </div>
    );
}
