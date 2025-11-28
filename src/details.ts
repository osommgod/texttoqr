// Centralized company and contact details for QR Generator Pro
// Update values here and the rest of the app will reflect the changes.

export const COMPANY_NAME = "QR Generator Pro";

export const SUPPORT_EMAIL = "support@text2qr.online";
export const BILLING_EMAIL = "billing@text2qr.online";
export const COMPLIANCE_EMAIL = "compliance@text2qr.online";

export const SUPPORT_PHONE = "+91 9876543210";
export const COMPLIANCE_PHONE = "+91 9876543210";

export const COMPANY_ADDRESS = "32 Kalpana Square, Bhubaneswar, Odisha 751007";

export const SOCIAL_LINKS = {
  linkedin: "https://linkedin.com/company/gentext2qr",
  twitter: "https://twitter.com/gentext2qr",
  facebook: "https://facebook.com/gentext2qr",
};

export const PAYMENT_GATEWAYS = ["Razorpay", "PayU", "Stripe", "PayPal"] as const;

export const PAYMENT_TAGLINE =
  "Payments secured by Stripe, PayPal, Razorpay & PayU.";

export const PCI_STATEMENT = "Payments secured by PCI-DSS compliant providers.";

export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];

// Optional: country used in certain legal/policy copy (not wired yet)
export const COMPANY_COUNTRY = "INDIA";
