import React from "react";

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed bg-white/80 rounded-xl border border-gray-200 shadow-sm p-6">
          <p>
            These Terms of Service ("Terms") govern your access to and use of QR Generator Pro (the "Service").
            By creating an account, purchasing a subscription, or using the Service in any way, you agree to be
            bound by these Terms.
          </p>

          <h2 className="font-semibold text-gray-900">1. Service Description</h2>
          <p>
            QR Generator Pro provides online tools to generate, manage, and track QR codes and related analytics.
            The Service is provided on a subscription basis with usage limits as described on our pricing page.
          </p>

          <h2 className="font-semibold text-gray-900">2. Eligibility</h2>
          <p>
            You must be at least 18 years old and capable of entering into a binding contract to use the Service.
            If you use the Service on behalf of a business, you represent that you are authorized to bind that
            business to these Terms.
          </p>

          <h2 className="font-semibold text-gray-900">3. Accounts & Security</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all activity
            that occurs under your account. You agree to notify us immediately of any unauthorized use of your
            account.
          </p>

          <h2 className="font-semibold text-gray-900">4. Acceptable Use</h2>
          <p>
            You agree not to use the Service to generate or distribute content that is illegal, harmful, deceptive,
            fraudulent, or that violates any applicable law or the rights of others. We may suspend or terminate your
            access if we reasonably believe you are misusing the Service.
          </p>

          <h2 className="font-semibold text-gray-900">5. Subscription, Fees & Taxes</h2>
          <p>
            Access to premium features is provided on a subscription basis. Prices, billing cycles, and plan limits
            are described on our pricing page. Unless otherwise stated, all fees are exclusive of applicable taxes,
            which may be charged in addition where required by law.
          </p>

          <h2 className="font-semibold text-gray-900">6. Renewals & Cancellations</h2>
          <p>
            Subscriptions renew automatically at the end of each billing period unless cancelled in advance via your
            account dashboard. You may cancel at any time; cancellation will take effect at the end of the current
            billing period. Please refer to our Refund &amp; Cancellation Policy for details on refunds.
          </p>

          <h2 className="font-semibold text-gray-900">7. Intellectual Property</h2>
          <p>
            We retain all rights, title, and interest in and to the Service, including all software, content, and
            branding. You retain all rights to your data and content that you upload or generate using the Service.
          </p>

          <h2 className="font-semibold text-gray-900">8. Data Protection</h2>
          <p>
            We process personal data in accordance with our Privacy Policy. By using the Service, you consent to such
            processing and represent that you have obtained all necessary consents from your end-users where
            applicable.
          </p>

          <h2 className="font-semibold text-gray-900">9. Service Availability</h2>
          <p>
            We use commercially reasonable efforts to provide a reliable and available service, but we do not
            guarantee uninterrupted or error-free operation. Planned maintenance or unexpected outages may temporarily
            affect availability.
          </p>

          <h2 className="font-semibold text-gray-900">10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, QR Generator Pro and its owners shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or for any loss of profits or data,
            arising out of or in connection with your use of the Service.
          </p>

          <h2 className="font-semibold text-gray-900">11. Changes to the Service or Terms</h2>
          <p>
            We may update the Service and these Terms from time to time. Material changes will be notified via email
            or in-product notice. Continued use of the Service after changes become effective constitutes acceptance of
            the revised Terms.
          </p>

          <h2 className="font-semibold text-gray-900">12. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at
            <span className="font-medium"> support@text2qr.online</span>.
          </p>
        </div>
      </section>
    </div>
  );
}
