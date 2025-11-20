import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard as CreditCardIcon,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { PricingTier, fallbackPricingTiers } from "../lib/pricing";
import { User } from "../types";
import {
  BILLING_EMAIL,
  COMPLIANCE_EMAIL,
  COMPLIANCE_PHONE,
  PAYMENT_GATEWAYS,
  PCI_STATEMENT,
} from "../details";

export type PaymentMethod = "card" | "upi" | "gateway";

export interface PaymentSuccessPayload {
  paymentMethod: PaymentMethod;
  gateway?: string;
}

interface CheckoutProps {
  selectedPlan?: PricingTier | null;
  user?: User | null;
  onBackToPricing?: () => void;
  onPaymentSuccess?: (payload: PaymentSuccessPayload) => void;
  onOpenLegal?: (view: "terms" | "privacy" | "refund" | "billing") => void;
}

const paymentGateways = [...PAYMENT_GATEWAYS];

export function Checkout({
  selectedPlan,
  user,
  onBackToPricing,
  onPaymentSuccess,
  onOpenLegal,
}: CheckoutProps) {
  const plan = useMemo(() => selectedPlan ?? fallbackPricingTiers[1], [selectedPlan]);
  const planPriceDisplay = useMemo(() => {
    if (plan.price === "Custom") return plan.price;
    if (!plan.price) return "$ 0";
    return plan.price.startsWith("$") ? `$ ${plan.price.slice(1).trim()}` : `$ ${plan.price}`;
  }, [plan.price]);

  const formatCurrency = (value: number) => {
    const normalized = Number.isFinite(value) ? value : 0;
    const formatted = Number.isInteger(normalized) ? normalized.toFixed(0) : normalized.toFixed(2);
    return `$${formatted}`;
  };

  const [billingDetails, setBillingDetails] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    company: "",
    phone: "",
    address: "",
    city: "",
    country: "India",
    postalCode: "",
    gstNumber: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [selectedGateway, setSelectedGateway] = useState<typeof paymentGateways[number]>(paymentGateways[0]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    const numericPrice = Number(plan.price.replace(/[^0-9.]/g, "")) || 0;
    return numericPrice;
  }, [plan.price]);

  const discount = useMemo(() => (couponCode.trim() ? subtotal * 0.1 : 0), [couponCode, subtotal]);
  const tax = useMemo(() => (subtotal - discount) * 0.18, [discount, subtotal]);
  const total = useMemo(() => subtotal - discount + tax, [subtotal, discount, tax]);

  const handleBillingChange = (field: keyof typeof billingDetails, value: string) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!agreeToTerms) {
      setStatusMessage("Please accept the terms to continue.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    // Simulate a payment intent while integration hooks are wired up.
    await new Promise(resolve => setTimeout(resolve, 1200));

    setIsSubmitting(false);
    setStatusMessage("Payment successful! Redirecting you to your upgraded dashboard.");

    onPaymentSuccess?.({ paymentMethod, gateway: paymentMethod === "gateway" ? selectedGateway : undefined });
  };

  return (
    <section className="container mx-auto px-1 py-12">
      <div className="flex items-center gap-3 mb-8 mt-4">
        {onBackToPricing && (
          <Button variant="ghost" size="sm" className="gap-2" onClick={onBackToPricing}>
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Button>
        )}
        <div className="h-6 w-px bg-gray-200" />
        <p className="text-sm text-gray-500">Secure checkout • End-to-end encrypted</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <form className="space-y-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-4">Step 1</p>
                <h2 className="text-gray-900">Billing Details</h2>
                <p className="text-sm text-gray-600">
                  Tell us who will be using this plan. We'll use this information for invoices and support.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Jane Doe"
                    value={billingDetails.fullName}
                    onChange={event => handleBillingChange("fullName", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={billingDetails.email}
                    onChange={event => handleBillingChange("email", event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="company"
                      placeholder="Acme Inc."
                      value={billingDetails.company}
                      onChange={event => handleBillingChange("company", event.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={billingDetails.phone}
                      onChange={event => handleBillingChange("phone", event.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Billing Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="address"
                    placeholder="123, Business Park, Bengaluru"
                    value={billingDetails.address}
                    onChange={event => handleBillingChange("address", event.target.value)}
                    className="min-h-[80px] pl-10"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Bengaluru"
                    value={billingDetails.city}
                    onChange={event => handleBillingChange("city", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="India"
                    value={billingDetails.country}
                    onChange={event => handleBillingChange("country", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="560001"
                    value={billingDetails.postalCode}
                    onChange={event => handleBillingChange("postalCode", event.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gst">GST / Tax Number (Optional)</Label>
                  <Input
                    id="gst"
                    placeholder="29ABCDE1234F1Z5"
                    value={billingDetails.gstNumber}
                    onChange={event => handleBillingChange("gstNumber", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon">Coupon Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="SAVE10"
                      value={couponCode}
                      onChange={event => setCouponCode(event.target.value)}
                    />
                    <Button type="button" variant="outline">
                      Apply
                    </Button>
                  </div>
                  {couponCode.trim() && <p className="text-sm text-green-600">10% discount applied</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mt-4 mb-2">Step 2</p>
                <h2 className="text-gray-900">Payment Method</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Pick the payment option that works best for you. We support cards, UPI, and leading gateways.
                </p>
              </div>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: string) => setPaymentMethod(value as PaymentMethod)}
                className="grid gap-3 md:grid-cols-3"
              >
                <label className={`border rounded-lg p-4 flex flex-col gap-2 cursor-pointer transition hover:bg-gray-50 ${paymentMethod === "card" ? "border-indigo-500 shadow-sm" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-gray-900">Card</span>
                    </div>
                    <RadioGroupItem value="card" id="card" />
                  </div>
                  <p className="text-xs text-gray-500">Visa, Mastercard, AMEX, RuPay</p>
                </label>

                <label className={`border rounded-lg p-4 flex flex-col gap-2 cursor-pointer transition hover:bg-gray-50 ${paymentMethod === "upi" ? "border-indigo-500 shadow-sm" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-gray-900">UPI</span>
                    </div>
                    <RadioGroupItem value="upi" id="upi" />
                  </div>
                  <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                </label>

                <label className={`border rounded-lg p-4 flex flex-col gap-2 cursor-pointer transition hover:bg-gray-50 ${paymentMethod === "gateway" ? "border-indigo-500 shadow-sm" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-gray-900">Gateway</span>
                    </div>
                    <RadioGroupItem value="gateway" id="gateway" />
                  </div>
                  <p className="text-xs text-gray-500">Pay with Razorpay, PayU, Stripe, PayPal</p>
                </label>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="cardNumber" placeholder="4242 4242 4242 4242" className="pl-10" required />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Expiry Date</Label>
                      <Input id="cardExpiry" placeholder="MM/YY" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input id="cardCvv" placeholder="123" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardHolder">Name on Card</Label>
                    <Input id="cardHolder" placeholder="Jane Doe" required />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="upiId" placeholder="name@bank" className="pl-10" required />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    A payment request will be sent to your UPI app. Approve it within 5 minutes to complete the upgrade.
                  </p>
                </div>
              )}

              {paymentMethod === "gateway" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gatewaySelect">Choose Gateway</Label>
                    <Select
                      value={selectedGateway}
                      onValueChange={(value: string) => setSelectedGateway(value as typeof paymentGateways[number])}
                    >
                      <SelectTrigger id="gatewaySelect">
                        <SelectValue placeholder="Select a gateway" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentGateways.map(gateway => (
                          <SelectItem key={gateway} value={gateway}>
                            {gateway}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-gray-500">
                    We'll pop open the {selectedGateway} checkout so you can pay in your preferred currency and method.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <label className="flex items-start gap-3 text-sm text-gray-600">
                  <Checkbox
                    checked={agreeToTerms}
                    onCheckedChange={(value: boolean | "indeterminate") => setAgreeToTerms(value === true)}
                  />
                  <span>
                    I agree to the <span className="text-indigo-600">Terms of Service</span> and <span className="text-indigo-600">Refund Policy</span>.
                  </span>
                </label>

                {statusMessage && (
                  <div className={`text-sm px-4 py-3 rounded-md ${statusMessage.includes("successful") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {statusMessage}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? "Processing..." : `Pay ${planPriceDisplay}/mo`}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="outline" onClick={onBackToPricing}>
                    Choose Another Plan
                  </Button>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Payments secured by PCI-DSS compliant providers.
                </p>
              </div>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Selected Plan</p>
                <h3 className="text-gray-900">{plan.name}</h3>
              </div>
              {plan.popular && <Badge variant="secondary">Popular</Badge>}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-gray-900">{planPriceDisplay}</span>
              {plan.price !== "Custom" && <span className="text-gray-500">/month</span>}
            </div>
            <p className="text-sm text-gray-600">{plan.conversions} conversions</p>
            <ul className="space-y-2">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="w-full" onClick={onBackToPricing}>
              Change plan
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-gray-900">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-green-600">-{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (18% GST)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-medium text-gray-900">
                <span>Amount Due</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Invoices are sent instantly and you can cancel anytime from the dashboard.</p>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-gray-900">Why upgrade?</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5" />
                Enterprise-grade security & SLA
              </li>
              <li className="flex gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 mt-0.5" />
                Dedicated success manager
              </li>
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 mt-0.5" />
                Priority support across timezones
              </li>
            </ul>
            <div className="text-xs text-gray-500">
              Need help with procurement? Email us at {" "}
              <span className="text-indigo-600">{BILLING_EMAIL}</span>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-gray-900">Compliance & Policies</h3>
            <p className="text-sm text-gray-600">
              As required by gateways like Razorpay, PayU, and Stripe, please review our operating policies before
              completing your payment.
            </p>
            <ul className="space-y-2 text-sm text-indigo-600">
              <li>
                <button
                  type="button"
                  className="hover:underline text-indigo-600 text-left"
                  onClick={() => onOpenLegal && onOpenLegal("terms")}
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:underline text-indigo-600 text-left"
                  onClick={() => onOpenLegal && onOpenLegal("privacy")}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:underline text-indigo-600 text-left"
                  onClick={() => onOpenLegal && onOpenLegal("refund")}
                >
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:underline text-indigo-600 text-left"
                  onClick={() => onOpenLegal && onOpenLegal("billing")}
                >
                  Subscription & Billing Policy
                </button>
              </li>
            </ul>
            <div className="text-xs text-gray-500">
              For compliance or chargeback questions, contact {" "}
              <span className="text-indigo-600">{COMPLIANCE_EMAIL}</span> or call {COMPLIANCE_PHONE}.
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
