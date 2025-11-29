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
  linkedin: "https://www.linkedin.com/in/text-to-qr-3a4001398/",
  twitter: "https://twitter.com/gentext2qr",
  facebook: "https://www.facebook.com/profile.php?id=100079102780042",
};

export const PAYMENT_GATEWAYS = ["Stripe", "PayPal"] as const;

export const PAYMENT_TAGLINE =
  "Payments secured by Stripe & PayPal";

export const PCI_STATEMENT = "Payments secured by PCI-DSS compliant providers.";

export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];

// Optional: country used in certain legal/policy copy (not wired yet)
export const COMPANY_COUNTRY = "INDIA";

// Payment Gateway Configuration
export const STRIPE_PUBLISHABLE_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx"; // Replace with your Stripe Publishable Key
export const BRAINTREE_TOKENIZATION_KEY = "sandbox_f252zhq7_hh4cpc39zq4rgjcg"; // Replace with your Braintree Tokenization Key
export const PAYPAL_CLIENT_ID = "AXDxaxcS_REDZTiIh4-0QJZgYIWEuyTo_12UVbP4YuhM-Qc2IdhYY4L4EwEq4ci-TX8fOulA5u2er-8x"; // Replace with your PayPal Client ID from the dashboard
