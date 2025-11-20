import React from "react";

export function RefundCancellationPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">Refund &amp; Cancellation Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed bg-white/80 rounded-xl border border-gray-200 shadow-sm p-6">
          <p>
            This Refund &amp; Cancellation Policy describes how QR Generator Pro handles subscription cancellations,
            upgrades, downgrades, and refunds. Our goal is to be transparent and fair while maintaining a sustainable
            service.
          </p>

          <h2 className="font-semibold text-gray-900">1. Free Trials</h2>
          <p>
            We may offer a free plan or trial period so you can evaluate the Service before purchasing a paid
            subscription. During a free trial, you will not be charged. At the end of the trial, you can choose a
            paid plan or continue on the free plan where available.
          </p>

          <h2 className="font-semibold text-gray-900">2. Subscription Billing</h2>
          <p>
            Paid plans are billed in advance on a recurring basis (e.g., monthly or annually) as specified on our
            pricing page. By subscribing, you authorize us and our payment processors to charge the applicable fees
            to your selected payment method.
          </p>

          <h2 className="font-semibold text-gray-900">3. Cancellations</h2>
          <p>
            You can cancel your subscription at any time from your account dashboard. After cancellation, your
            subscription will remain active until the end of the current billing period, and you will not be charged
            again unless you resubscribe.
          </p>

          <h2 className="font-semibold text-gray-900">4. Refunds</h2>
          <p>
            As a general rule, payments are non-refundable once a billing period has started. In exceptional
            circumstances (such as duplicate charges or technical issues preventing use of the Service), we may, at
            our sole discretion, provide a partial or full refund. Any refund requests must be submitted within
            14 days of the charge by contacting support@qrgenpro.com.
          </p>

          <h2 className="font-semibold text-gray-900">5. Upgrades &amp; Downgrades</h2>
          <p>
            If you upgrade your plan, the change will usually take effect immediately and a prorated charge may be
            applied. If you downgrade, the new plan and limits will take effect from the next billing period. Some
            promotional or custom plans may have specific terms communicated at the time of purchase.
          </p>

          <h2 className="font-semibold text-gray-900">6. Failed Payments</h2>
          <p>
            If a payment is declined, we may attempt to reprocess the charge and notify you by email. We may
            temporarily suspend or restrict access to premium features until outstanding amounts are paid.
          </p>

          <h2 className="font-semibold text-gray-900">7. Chargebacks</h2>
          <p>
            Initiating a chargeback without first contacting our support team may be considered misuse. We encourage
            you to reach out to us to resolve any billing issues before contacting your bank or payment provider.
          </p>

          <h2 className="font-semibold text-gray-900">8. Contact</h2>
          <p>
            For any questions regarding cancellations or refunds, please contact us at
            <span className="font-medium"> support@qrgenpro.com</span> with your registered email address and
            relevant payment details.
          </p>
        </div>
      </section>
    </div>
  );
}
