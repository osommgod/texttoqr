import { XCircle, Home, RefreshCw, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface PaymentFailureProps {
    errorMessage?: string;
    onGoHome: () => void;
    onRetry: () => void;
}

export function PaymentFailure({
    errorMessage = "Your payment could not be processed at this time.",
    onGoHome,
    onRetry
}: PaymentFailureProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-600 mb-6">
                    {errorMessage}
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Common reasons for failure:</h3>
                    <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>Insufficient funds in your account</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>Incorrect card details or expired card</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>Payment declined by your bank</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>Network or connection issues</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <Button onClick={onRetry} className="w-full gap-2" size="lg">
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>

                    <Button onClick={onGoHome} variant="outline" className="w-full gap-2">
                        <Home className="w-4 h-4" />
                        Go to Home
                    </Button>
                </div>

                <p className="text-xs text-gray-500 mt-6 flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" />
                    Need help? Contact our support team
                </p>
            </Card>
        </div>
    );
}
