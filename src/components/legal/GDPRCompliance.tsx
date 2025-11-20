import React from "react";

export function GDPRCompliance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">GDPR Compliance</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed bg-white/80 rounded-xl border border-gray-200 shadow-sm p-6">
          <p>
            QR Generator Pro is committed to protecting personal data and complying with the EU General Data
            Protection Regulation ("GDPR") and other applicable data protection laws. This page summarizes our key
            GDPR commitments and practices.
          </p>

          <h2 className="font-semibold text-gray-900">1. Data Controller</h2>
          <p>
            For the purposes of the GDPR, QR Generator Pro acts as a data controller for customer account information
            and as a data processor for personal data you submit to the Service about your own users or customers.
          </p>

          <h2 className="font-semibold text-gray-900">2. Lawful Basis for Processing</h2>
          <p>
            We process personal data on the basis of:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Performance of a contract (to provide and support the Service you subscribe to).</li>
            <li>Compliance with legal obligations (such as tax and accounting requirements).</li>
            <li>Legitimate interests (such as improving the Service and preventing fraud), balanced with your rights.</li>
            <li>Your consent, where explicitly requested (for example, certain marketing communications).</li>
          </ul>

          <h2 className="font-semibold text-gray-900">3. Data Subject Rights</h2>
          <p>
            Individuals located in the European Economic Area (EEA), the United Kingdom, and other applicable regions
            have the right to request access, rectification, deletion, restriction, or portability of their personal
            data, and to object to certain processing activities.
          </p>
          <p>
            Requests can be submitted to <span className="font-medium">privacy@qrgenpro.com</span>. We will respond in
            accordance with applicable laws and may need to verify your identity before fulfilling a request.
          </p>

          <h2 className="font-semibold text-gray-900">4. Data Processing & Sub‑processors</h2>
          <p>
            We use carefully selected sub‑processors (such as hosting providers, email delivery services, and payment
            gateways) to operate the Service. Each sub‑processor is bound by contractual obligations to implement
            appropriate security measures and process personal data only on our documented instructions.
          </p>

          <h2 className="font-semibold text-gray-900">5. International Transfers</h2>
          <p>
            Personal data may be transferred and stored outside of the EEA/UK. Where required, we rely on recognized
            transfer mechanisms such as Standard Contractual Clauses (SCCs) or equivalent safeguards to protect such
            data.
          </p>

          <h2 className="font-semibold text-gray-900">6. Security Measures</h2>
          <p>
            We implement technical and organizational measures to protect personal data, including encryption in
            transit, access controls, monitoring, and regular security reviews. We also require our sub‑processors to
            maintain appropriate security standards.
          </p>

          <h2 className="font-semibold text-gray-900">7. Data Retention</h2>
          <p>
            We retain personal data only for as long as necessary to provide the Service, comply with legal
            obligations, resolve disputes, and enforce our agreements. When data is no longer required, we securely
            delete or anonymize it.
          </p>

          <h2 className="font-semibold text-gray-900">8. Data Protection Officer & Contact</h2>
          <p>
            If you have questions about our GDPR compliance or wish to exercise your rights, please contact:
          </p>
          <p>
            <span className="font-medium">Data Protection Contact</span>
            <br />
            Email: <span className="font-medium">privacy@qrgenpro.com</span>
          </p>

          <h2 className="font-semibold text-gray-900">9. Updates to This Statement</h2>
          <p>
            We may update this GDPR Compliance statement from time to time to reflect changes in our practices or
            legal requirements. Material updates will be communicated via email or in‑product notifications where
            appropriate.
          </p>
        </div>
      </section>
    </div>
  );
}
