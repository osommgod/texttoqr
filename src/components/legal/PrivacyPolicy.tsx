import React from "react";

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed bg-white/80 rounded-xl border border-gray-200 shadow-sm p-6">
          <p>
            This Privacy Policy explains how QR Generator Pro ("we", "us", or "our") collects, uses, and protects
            information when you use our website and services (the "Service"). We are committed to handling your data
            in a lawful, fair, and transparent manner.
          </p>

          <h2 className="font-semibold text-gray-900">1. Information We Collect</h2>
          <p>
            We may collect the following types of information:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Account information such as your name, email address, and password.</li>
            <li>Billing details such as company name, billing address, and payment-related metadata.</li>
            <li>Usage data related to your QR code generation and interactions with the Service.</li>
            <li>Technical data such as IP address, browser type, and device information.</li>
          </ul>

          <h2 className="font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide, operate, and improve the Service.</li>
            <li>Process payments and manage subscriptions.</li>
            <li>Communicate with you about your account, updates, and support requests.</li>
            <li>Protect the security and integrity of the Service and prevent abuse.</li>
            <li>Comply with legal obligations and enforce our Terms of Service.</li>
          </ul>

          <h2 className="font-semibold text-gray-900">3. Legal Bases for Processing</h2>
          <p>
            Where required by applicable law, we process personal data based on one or more of the following legal
            bases: your consent, performance of a contract, compliance with legal obligations, and our legitimate
            interests (such as improving the Service and preventing fraud).
          </p>

          <h2 className="font-semibold text-gray-900">4. Sharing of Information</h2>
          <p>
            We do not sell your personal data. We may share information with trusted third-party service providers who
            assist us with hosting, analytics, payment processing, customer support, and email communications. These
            providers are bound by contractual obligations to protect your data and use it only on our instructions.
          </p>

          <h2 className="font-semibold text-gray-900">5. Data Retention</h2>
          <p>
            We retain personal data for as long as necessary to provide the Service, comply with legal obligations,
            resolve disputes, and enforce our agreements. When data is no longer required, we will delete or
            anonymize it in a secure manner.
          </p>

          <h2 className="font-semibold text-gray-900">6. Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your data against unauthorized
            access, alteration, disclosure, or destruction. However, no method of transmission over the internet or
            electronic storage is 100% secure.
          </p>

          <h2 className="font-semibold text-gray-900">7. International Transfers</h2>
          <p>
            Your information may be processed and stored in data centers located outside your country. Where required
            by law, we use appropriate safeguards (such as standard contractual clauses) to protect your data.
          </p>

          <h2 className="font-semibold text-gray-900">8. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, rectify, delete, restrict, or object to the
            processing of your personal data, and to data portability. You can exercise these rights by contacting us
            at support@text2qr.online.
          </p>

          <h2 className="font-semibold text-gray-900">9. Cookies & Tracking</h2>
          <p>
            We may use cookies and similar technologies to remember your preferences, analyze usage, and improve the
            Service. You can control cookies through your browser settings, but disabling them may affect some
            features.
          </p>

          <h2 className="font-semibold text-gray-900">10. Children's Privacy</h2>
          <p>
            The Service is not directed to children under 16, and we do not knowingly collect personal data from
            children. If you believe that a child has provided us with personal data, please contact us so that we can
            delete it.
          </p>

          <h2 className="font-semibold text-gray-900">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be notified via email or in
            the Service. Your continued use of the Service after the updated policy becomes effective means you accept
            the changes.
          </p>

          <h2 className="font-semibold text-gray-900">12. Contact</h2>
          <p>
            For questions or requests related to this Privacy Policy, please contact us at
            <span className="font-medium"> support@text2qr.online</span>.
          </p>
        </div>
      </section>
    </div>
  );
}
