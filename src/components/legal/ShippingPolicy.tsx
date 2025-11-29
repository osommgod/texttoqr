import React from "react";

export function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <section className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">Shipping & Delivery Policy</h1>
                <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6 text-sm text-gray-700 leading-relaxed bg-white/80 rounded-xl border border-gray-200 shadow-sm p-6">
                    <p>
                        This Shipping & Delivery Policy explains how QR Generator Pro ("we", "us", or "our") delivers our
                        digital services to you. As a SaaS (Software as a Service) platform, we provide instant digital access
                        to our QR code generation tools.
                    </p>

                    <h2 className="font-semibold text-gray-900">1. Nature of Service</h2>
                    <p>
                        QR Generator Pro is a digital service platform. We do not ship physical products. All services are
                        delivered electronically and are available immediately upon successful payment and account activation.
                    </p>

                    <h2 className="font-semibold text-gray-900">2. Instant Digital Delivery</h2>
                    <p>Upon successful subscription or payment:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Your account is activated instantly (typically within seconds).</li>
                        <li>You receive immediate access to your subscribed plan features.</li>
                        <li>A confirmation email is sent to your registered email address.</li>
                        <li>You can start generating QR codes right away from your dashboard.</li>
                    </ul>

                    <h2 className="font-semibold text-gray-900">3. Access to Services</h2>
                    <p>
                        Once your payment is processed successfully, you will have immediate access to:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Your account dashboard with all subscribed features.</li>
                        <li>QR code generation tools based on your plan tier.</li>
                        <li>Download capabilities for generated QR codes in various formats.</li>
                        <li>Customer support and documentation resources.</li>
                    </ul>

                    <h2 className="font-semibold text-gray-900">4. Email Confirmations</h2>
                    <p>
                        You will receive email confirmations for:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Account creation and verification.</li>
                        <li>Successful subscription or plan upgrades.</li>
                        <li>Payment receipts and invoices.</li>
                        <li>Subscription renewals and changes.</li>
                    </ul>
                    <p className="mt-2">
                        Please ensure your email address is correct and check your spam/junk folder if you don't receive
                        confirmations within a few minutes.
                    </p>

                    <h2 className="font-semibold text-gray-900">5. Service Availability</h2>
                    <p>
                        Our services are available 24/7, subject to scheduled maintenance and unforeseen technical issues.
                        We strive to maintain 99.9% uptime. In case of service interruptions:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>We will notify users via email or in-app notifications.</li>
                        <li>Scheduled maintenance will be announced in advance when possible.</li>
                        <li>Your subscription period may be extended to compensate for significant downtime.</li>
                    </ul>

                    <h2 className="font-semibold text-gray-900">6. Delivery Failures</h2>
                    <p>
                        In rare cases where access is not granted immediately after payment:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Check your payment confirmation email for any errors.</li>
                        <li>Verify that your payment was successfully processed with your payment provider.</li>
                        <li>Contact our support team at <span className="font-medium">support@text2qr.online</span> with your payment details.</li>
                        <li>We will resolve access issues within 24 hours of notification.</li>
                    </ul>

                    <h2 className="font-semibold text-gray-900">7. Generated QR Codes</h2>
                    <p>
                        QR codes you generate through our platform:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Are available for immediate download in multiple formats (PNG, SVG, PDF).</li>
                        <li>Remain accessible in your account history based on your plan limits.</li>
                        <li>Can be re-downloaded at any time during your active subscription.</li>
                        <li>Are stored securely on our servers with regular backups.</li>
                    </ul>

                    <h2 className="font-semibold text-gray-900">8. International Access</h2>
                    <p>
                        Our services are accessible globally. There are no geographical restrictions or additional delivery
                        charges based on location. All users receive the same instant access regardless of their country.
                    </p>

                    <h2 className="font-semibold text-gray-900">9. Technical Requirements</h2>
                    <p>
                        To access our services, you need:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>A stable internet connection.</li>
                        <li>A modern web browser (Chrome, Firefox, Safari, Edge - latest versions recommended).</li>
                        <li>JavaScript enabled in your browser.</li>
                        <li>A valid email address for account communications.</li>
                    </ul>

                    <h2 className="font-semibold text-gray-900">10. Support & Assistance</h2>
                    <p>
                        If you experience any issues accessing our services after payment:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Email us at <span className="font-medium">support@text2qr.online</span></li>
                        <li>Include your account email and payment reference number.</li>
                        <li>Our support team responds within 24-48 hours.</li>
                        <li>For urgent issues, mark your email as "Urgent - Access Issue".</li>
                    </ul>

                    <h2 className="font-semibold text-gray-900">11. Refunds for Non-Delivery</h2>
                    <p>
                        If we fail to provide access to our services within 48 hours of successful payment and after you've
                        contacted our support team, you are entitled to a full refund. Please refer to our Refund &
                        Cancellation Policy for complete details.
                    </p>

                    <h2 className="font-semibold text-gray-900">12. Changes to This Policy</h2>
                    <p>
                        We may update this Shipping & Delivery Policy from time to time. Material changes will be notified
                        via email or through our Service. Your continued use of the Service after changes become effective
                        means you accept the updated policy.
                    </p>

                    <h2 className="font-semibold text-gray-900">13. Contact Information</h2>
                    <p>
                        For questions about service delivery or access issues, please contact us at:
                    </p>
                    <ul className="list-none space-y-1 mt-2">
                        <li><span className="font-medium">Email:</span> support@text2qr.online</li>
                        <li><span className="font-medium">Phone:</span> +91 9876543210</li>
                        <li><span className="font-medium">Address:</span> 32 Kalpana Square, Bhubaneswar, Odisha 751007, India</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
