import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "./ui/button";
import { ArrowRight, Check, Code, Globe, Lock, Shield, ShieldCheck, Users } from "lucide-react";

interface FeaturesPageProps {
  onStartTrial: () => void;
  onSelectPricing: () => void;
  onViewApiDocs: () => void;
}

const primaryFeatures = [
  {
    title: "Lightning-fast generation",
    description: "Create QR codes in under 100ms with globally cached infrastructure.",
    Icon: Globe,
  },
  {
    title: "Secure by default",
    description: "Transport encryption, signed URLs, and data residency controls built in.",
    Icon: Shield,
  },
  {
    title: "Developer-first APIs",
    description: "Simple REST endpoints, clear docs, and examples for your language.",
    Icon: Code,
  },
  {
    title: "Scales with you",
    description: "From hobby projects to millions of scans per month, without rewrites.",
    Icon: Globe,
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Send your content",
    description: "Pass text or URLs to our API or use the dashboard to create codes.",
  },
  {
    step: "2",
    title: "We generate the QR",
    description: "We return a ready-to-use image URL or file in the format you choose.",
  },
  {
    step: "3",
    title: "Track & manage",
    description: "View usage, rotate targets, and update campaigns without breaking links.",
  },
];

export function FeaturesPage({ onStartTrial, onSelectPricing, onViewApiDocs }: FeaturesPageProps) {
  const [demoText, setDemoText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const demoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const generate = async () => {
      if (!demoText.trim()) {
        setQrDataUrl(null);
        return;
      }

      if (!demoCanvasRef.current) return;

      try {
        await QRCode.toCanvas(demoCanvasRef.current, demoText, {
          width: 200,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        const url = demoCanvasRef.current.toDataURL();
        setQrDataUrl(url);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error generating demo QR", e);
      }
    };

    generate();
  }, [demoText]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero - gradient two-column with demo card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr] items-center">
            {/* Left copy */}
            <div>
              <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur">
                Trusted by 50,000+ businesses worldwide
              </span>
              <h1 className="mt-4 text-3xl md:text-4xl lg:text-[2.4rem] font-semibold leading-tight">
                Transform text to QR codes in seconds.
              </h1>
              <p className="mt-3 max-w-xl text-sm md:text-base text-indigo-100 leading-relaxed">
                Professional QR code generation with powerful API access. Generate unlimited QR
                codes for URLs, text, contact cards, and more. Secure, fast, and reliable.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  onClick={onStartTrial}
                  className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-3 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-transform"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={onSelectPricing}
                  className="border-white/70 bg-transparent text-white hover:bg-white/10 px-6 py-3 text-sm font-semibold"
                >
                  View Pricing
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-indigo-100">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>GDPR compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>SSL secured</span>
                </div>
              </div>
            </div>

            {/* Right demo card */}
            <div>
              <div className="rounded-2xl border border-white/20 bg-white/95 p-5 shadow-xl backdrop-blur-sm text-gray-900">
                <h3 className="mb-2 text-sm font-semibold">Try it now  Free demo</h3>
                <p className="mb-3 text-xs text-gray-500">
                  Enter any text or URL below to see how your QR codes could look inside the app.
                </p>
                <input
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400"
                  placeholder="Enter text or URL to generate QR code..."
                  value={demoText}
                  onChange={event => setDemoText(event.target.value)}
                />
                <div className="mt-4 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8">
                  {qrDataUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-xl border-2 border-gray-200 bg-white p-3">
                        <img
                          src={qrDataUrl}
                          alt="QR code preview"
                          className="h-48 w-48"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Generated preview based on your input.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-xs">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                        <Code className="h-5 w-5 text-gray-500" />
                      </div>
                      <p>QR preview will appear here</p>
                      <p className="mt-1 text-[11px] text-gray-500">Start typing to generate a QR code</p>
                    </div>
                  )}
                </div>
                <canvas ref={demoCanvasRef} className="hidden" />
                <p className="mt-3 text-[11px] text-gray-500">
                  Your QR code is generated instantly in production. This is a visual preview.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Built for modern teams</h2>
          <p className="mt-3 text-sm md:text-base text-gray-700 max-w-2xl mx-auto">
            Everything you need to go from idea to production-ready QR flows with a single API.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {primaryFeatures.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md text-center flex flex-col items-center"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 p-4">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-100 bg-gray-50/60">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">How it works</h2>
            <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              A simple flow from content to code to analytics.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {howItWorks.map(step => (
              <div
                key={step.step}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm text-center"
              >
                <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                  {step.step}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer API */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto rounded-xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="grid gap-8 md:grid-cols-2 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 mb-2">
                Developer API
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Integrate QR generation in a few lines of code
              </h2>
              <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
                Use simple REST endpoints to generate and manage QR codes from your own backend or
                serverless functions.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" />
                  Language-agnostic REST
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" />
                  API keys & rate limits
                </span>
              </div>
              <div className="mt-6">
                <Button
                  onClick={onViewApiDocs}
                  className="px-5 py-3 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 p-4"
                >
                  View API Docs
                </Button>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 text-slate-50 p-4 shadow-md">
              <p className="text-xs text-slate-300 mb-2">curl example</p>
              <pre className="w-full text-[11px] leading-relaxed font-mono bg-slate-950/60 border border-slate-800 rounded-lg p-4 whitespace-pre-wrap break-words">
                {`curl -X POST https://api.qrgenpro.com/v1/generate \\
                -H "Authorization: Bearer ***" \\ 
                -H "X-Key-Authorization: Bearer ***" \\
                -H "X-Api-Key: api_key***" \\
                -H "Content-Type: application/json" \\
                -d '{"text": "https://example.com"}'`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & payments */}
      <section className="border-t border-gray-100 bg-gray-50/80">
        <div className="container mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Trusted & secure</h2>
            <p className="mt-3 text-xs md:text-sm text-gray-600 max-w-xl mx-auto">
              Your security and privacy are our top priorities. Payments are processed by PCI DSS
              compliant providers. We never store card details.
            </p>
          </div>

          {/* Payment methods card */}
          <div className="mx-auto mb-10 max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-center text-sm font-semibold text-gray-900">
              Secure payment methods
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] text-gray-700">
              <div className="text-center">
                <div className="mb-1 rounded-lg bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">
                  PayPal
                </div>
                <p className="text-[10px] text-gray-500">PayPal</p>
              </div>
              <div className="text-center">
                <div className="mb-1 rounded-lg bg-indigo-50/60 px-4 py-2 text-xs font-semibold text-indigo-700">
                  Stripe
                </div>
                <p className="text-[10px] text-gray-500">Stripe</p>
              </div>
              <div className="text-center">
                <div className="mb-1 rounded-lg bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">
                  Razorpay
                </div>
                <p className="text-[10px] text-gray-500">Razorpay</p>
              </div>
              <div className="text-center">
                <div className="mb-1 rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  PayU
                </div>
                <p className="text-[10px] text-gray-500">PayU</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-700">
                <Lock className="h-3.5 w-3.5 text-indigo-600" />
                256-bit SSL encryption
              </span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
              <Lock className="mx-auto mb-3 h-8 w-8 text-indigo-600" />
              <h3 className="mb-1 text-sm font-semibold text-gray-900">GDPR compliant</h3>
              <p className="text-[11px] text-gray-600">
                Full compliance with EU data protection regulations.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
              <Shield className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
              <h3 className="mb-1 text-sm font-semibold text-gray-900">PCI DSS certified</h3>
              <p className="text-[11px] text-gray-600">
                Payment card industry data security standards certified.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
              <Users className="mx-auto mb-3 h-8 w-8 text-purple-600" />
              <h3 className="mb-1 text-sm font-semibold text-gray-900">50,000+ users</h3>
              <p className="text-[11px] text-gray-600">
                Trusted by businesses and individuals worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Ready to try QR Generator Pro?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600">
            Start your free trial today. You can upgrade, downgrade, or cancel at any time from the
            dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button onClick={onStartTrial} className="px-6 py-4 text-xs font-semibold">
              Get Started Free
            </Button>
            <Button
              variant="outline"
              onClick={onSelectPricing}
              className="px-6 py-4 text-xs font-semibold"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
