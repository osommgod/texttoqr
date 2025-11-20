import React from "react";

export function SubscriptionBillingPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">Subscription &amp; Billing Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed bg-white/80 rounded-xl border border-gray-200 shadow-sm p-6">
          <p>
            This Subscription &amp; Billing Policy explains how subscriptions are managed, how charges are applied,
            and what you can expect regarding invoices and billing communication when using QR Generator Pro.
          </p>

          <h2 className="font-semibold text-gray-900">1. Subscription Plans</h2>
          <p>
            We offer multiple subscription tiers with different usage limits and features, as described on our
            pricing page. By selecting a plan, you agree to the associated fees and usage limits.
          </p>

          <h2 className="font-semibold text-gray-900">2. Billing Cycles</h2>
          <p>
            Subscriptions are billed on a recurring basis (e.g., monthly or annually). Your billing cycle begins on
            the date you start your paid subscription and renews automatically unless cancelled in advance.
          </p>

          <h2 className="font-semibold text-gray-900">3. Payment Methods</h2>
          <p>
            We accept major credit and debit cards and may support additional payment methods via integrated payment
            gateways. By providing a payment method, you represent that you are authorized to use it and authorize us
            and our payment processors to charge all subscription fees and applicable taxes.
          </p>

          <h2 className="font-semibold text-gray-900">4. Invoices &amp; Receipts</h2>
          <p>
            Invoices or receipts are issued electronically and sent to the email address associated with your
            account. You are responsible for keeping your billing information and contact details up to date.
          </p>

          <h2 className="font-semibold text-gray-900">5. Taxes</h2>
          <p>
            Fees may be subject to VAT, GST, or other applicable taxes depending on your location. Where required by
            law, we will collect and remit such taxes. Any tax amounts will be shown on your invoice.
          </p>

          <h2 className="font-semibold text-gray-900">6. Overages &amp; Fair Use</h2>
          <p>
            Some plans may include fair-use limits on conversions or API calls. If you consistently exceed these
            limits, we may contact you to suggest a higher plan or custom agreement. Excessive or abusive usage may
            result in temporary throttling or suspension of access.
          </p>

          <h2 className="font-semibold text-gray-900">7. Price Changes</h2>
          <p>
            We may update our pricing from time to time. Any changes to subscription fees will be communicated in
            advance and will take effect from the next billing cycle. If you do not agree with the new prices, you may
            cancel your subscription before the change takes effect.
          </p>

          <h2 className="font-semibold text-gray-900">8. Trial &amp; Promotional Offers</h2>
          <p>
            From time to time, we may offer trial periods or promotional discounts. Any specific terms applicable to
            such offers will be communicated at the time they are made available and may override certain parts of
            this policy for the duration of the promotion.
          </p>

          <h2 className="font-semibold text-gray-900">9. Contact</h2>
          <p>
            For billing-related questions, invoices, or account changes, please contact us at
            <span className="font-medium"> billing@qrgenpro.com</span> or through the support channels listed on our
            website.
          </p>
        </div>
      </section>
    </div>
  );
}
