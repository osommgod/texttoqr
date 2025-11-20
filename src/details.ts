// Centralized company and contact details for QR Generator Pro
// Update values here and the rest of the app will reflect the changes.

export const COMPANY_NAME = "QR Generator Pro";

export const SUPPORT_EMAIL = "support@qrgenpromm.com";
export const BILLING_EMAIL = "billing@qrgenpromm.com";
export const COMPLIANCE_EMAIL = "compliance@qrgenpromm.com";

export const SUPPORT_PHONE = "+1 (555) 123-4567";
export const COMPLIANCE_PHONE = "+1-800-555-2173";

export const COMPANY_ADDRESS = "123 Tech Street, San Francisco, CA 94105";

export const SOCIAL_LINKS = {
  linkedin: "https://linkedin.com/company/qrgen",
  twitter: "https://twitter.com/qrgen",
  facebook: "https://facebook.com/qrgen",
};

export const PAYMENT_GATEWAYS = ["Razorpay", "PayU", "Stripe", "PayPal"] as const;

export const PAYMENT_TAGLINE =
  "Payments secured by Stripe, PayPal, Razorpay & PayU.";

export const PCI_STATEMENT = "Payments secured by PCI-DSS compliant providers.";

export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];

// Optional: country used in certain legal/policy copy (not wired yet)
export const COMPANY_COUNTRY = "USA";
