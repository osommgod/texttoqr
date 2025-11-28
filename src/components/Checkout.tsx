import { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  MapPin,
  Phone,
  ShieldCheck,
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

interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  created_at: string;
  expires_at: string;
  usage_type: 'single' | 'multi';
  used_by: any[];
  is_active: boolean;
  max_uses: number | null;
  description: string | null;
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
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [paymentMethod] = useState<PaymentMethod>("gateway");
  const [selectedGateway, setSelectedGateway] = useState<typeof paymentGateways[number]>(paymentGateways[0]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    const numericPrice = Number(plan.price.replace(/[^0-9.]/g, "")) || 0;
    return numericPrice;
  }, [plan.price]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    setAppliedCoupon(null);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error("Invalid coupon code");
        setIsValidatingCoupon(false);
        return;
      }

      const coupon = data as Coupon;

      // Check expiry
      if (new Date(coupon.expires_at) < new Date()) {
        toast.error("This coupon has expired");
        setIsValidatingCoupon(false);
        return;
      }

      // Check max uses
      let usedBy = coupon.used_by;
      if (typeof usedBy === 'string') {
        try { usedBy = JSON.parse(usedBy); } catch (e) { usedBy = []; }
      }
      if (!Array.isArray(usedBy)) usedBy = [];

      if (coupon.max_uses !== null && usedBy.length >= coupon.max_uses) {
        toast.error("This coupon has reached its usage limit");
        setIsValidatingCoupon(false);
        return;
      }

      // Check single use per user
      if (coupon.usage_type === 'single' && user) {
        if (usedBy.includes(user.id)) {
          toast.error("You have already used this coupon");
          setIsValidatingCoupon(false);
          return;
        }
      }

      setAppliedCoupon(coupon);
      toast.success("Coupon applied successfully!");

    } catch (err) {
      console.error("Error validating coupon:", err);
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return subtotal * (appliedCoupon.discount_percentage / 100);
  }, [appliedCoupon, subtotal]);
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
                      disabled={isValidatingCoupon || !!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button type="button" variant="outline" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}>
                        Remove
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode.trim()}>
                        {isValidatingCoupon ? "..." : "Apply"}
                      </Button>
                    )}
                  </div>
                  {appliedCoupon && <p className="text-sm text-green-600">{appliedCoupon.discount_percentage}% discount applied</p>}
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
