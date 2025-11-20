import { useEffect, useState } from "react";
import { QRGenerator } from "./components/QRGenerator";
import { PricingSection } from "./components/PricingSection";
import { Dashboard } from "./components/Dashboard";
import { Checkout, type PaymentSuccessPayload } from "./components/Checkout";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { History } from "./components/History";
import { Admin } from "./components/Admin";
import { TermsOfService } from "./components/legal/TermsOfService";
import { PrivacyPolicy } from "./components/legal/PrivacyPolicy";
import { RefundCancellationPolicy } from "./components/legal/RefundCancellationPolicy";
import { SubscriptionBillingPolicy } from "./components/legal/SubscriptionBillingPolicy";
import { GDPRCompliance } from "./components/legal/GDPRCompliance";
import {
  QrCode,
  Menu,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  CreditCard,
  Bell,
  ShieldCheck,
  BarChart3,
  Sparkles,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Home,
  LayoutDashboard,
  History as HistoryIcon,
  Shield,
  DollarSign,
  Github,
} from "lucide-react";
import {
  COMPANY_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  COMPANY_ADDRESS,
  SOCIAL_LINKS,
  PAYMENT_TAGLINE,
} from "./details";
import { Button } from "./components/ui/button";
import { generateBearerToken } from "./lib/apiKey";
import { supabase } from "./lib/supabaseClient";
import { ConversionRecord, PlanType, User } from "./types";
import { getUserProfile, ensureUserProfile } from "./lib/userService";
import { getUpgradeSuggestion, canUpgradeTo } from "./lib/pricing";
import type { PricingTier } from "./lib/pricing";
import { toast } from "sonner";

type ViewType =
  | "home"
  | "dashboard"
  | "pricing"
  | "login"
  | "signup"
  | "history"
  | "admin"
  | "checkout"
  | "terms"
  | "privacy"
  | "refund"
  | "billing"
  | "gdpr";

const getInitialView = (): ViewType => {
  if (typeof window === "undefined") return "home";
  const saved = window.localStorage.getItem("currentView") as ViewType | null;
  return saved ?? "home";
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(() => getInitialView());
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [conversions, setConversions] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [conversionHistory, setConversionHistory] = useState<ConversionRecord[]>([]);
  const [checkoutPlan, setCheckoutPlan] = useState<PricingTier | null>(null);
  const [postAuthView, setPostAuthView] = useState<ViewType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("currentView", currentView);
  }, [currentView]);

  // No URL sync for static /features.html; SPA stays on root path

  useEffect(() => {
    if (!sessionInitialized) return;

    if (!user && ["dashboard", "history", "admin"].includes(currentView)) {
      setCurrentView("home");
      return;
    }

    if (user && !user.isAdmin && currentView === "admin") {
      setCurrentView("dashboard");
    }
  }, [user, currentView, sessionInitialized]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);

    if (postAuthView === "checkout" && checkoutPlan) {
      if (!canUpgradeTo(loggedInUser.plan, checkoutPlan.planType)) {
        toast.warning("You're already on this plan or a higher one");
        setCheckoutPlan(null);
        setPostAuthView(null);
        setCurrentView("pricing");
        return;
      }

      setCurrentView("checkout");
      setPostAuthView(null);
      return;
    }

    if (postAuthView) {
      setCurrentView(postAuthView);
      setPostAuthView(null);
      return;
    }

    if (loggedInUser.isAdmin) {
      setCurrentView("admin");
    } else {
      setCurrentView("dashboard");
    }
  };

  const handleSignup = (newUser: User) => {
    setUser(newUser);

    if (postAuthView === "checkout" && checkoutPlan) {
      setCurrentView("checkout");
      setPostAuthView(null);
      return;
    }

    if (postAuthView) {
      setCurrentView(postAuthView);
      setPostAuthView(null);
      return;
    }

    setCurrentView("dashboard");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView("home");
    setConversions(0);
    setPostAuthView(null);
    setCheckoutPlan(null);
  };

  const handleConversion = async (text: string, qrCodeUrl: string) => {
    // Prevent duplicate conversions for the same text
    const alreadyExists = conversionHistory.some(c => c.text === text);
    if (alreadyExists) {
      return;
    }

    setConversions(prev => prev + 1);
    if (user) {
      const updatedCount = user.conversionsUsed + 1;
      setUser({ ...user, conversionsUsed: updatedCount });
      const { error: countError } = await supabase
        .from("users_custom")
        .update({ conversions_used: updatedCount })
        .eq("id", user.id);

      if (countError) {
        console.error("Failed to persist conversion count", countError);
      }

      const type: "url" | "text" = text.match(/^https?:\/\//) ? "url" : "text";
      const { data, error } = await supabase
        .from("conversion_history")
        .insert({
          user_id: user.id,
          text,
          qr_code_url: qrCodeUrl,
          type,
        })
        .select("id, text, qr_code_url, created_at, type")
        .single();

      if (error || !data) {
        console.error("Failed to persist conversion history", error);
        return;
      }

      const newConversion: ConversionRecord = {
        id: data.id,
        text: data.text,
        qrCodeUrl: data.qr_code_url ?? "",
        timestamp: data.created_at,
        type: (data.type as "url" | "text") ?? type,
      };

      setConversionHistory(prev => [newConversion, ...prev]);
    }
  };

  const handleDeleteConversion = (id: string) => {
    setConversionHistory(prev => prev.filter(c => c.id !== id));

    if (!user) return;

    supabase
      .from("conversion_history")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to delete conversion history row", error);
        }
      });
  };

  const handleResetBearerToken = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase.rpc("reset_bearer_token", { p_user_id: user.id });

    if (error) {
      console.error("RPC reset failed, falling back to client-side token", error);
      const fallbackToken = generateBearerToken();
      const { error: updateError } = await supabase
        .from("users_custom")
        .update({ bearer_token: fallbackToken })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to update bearer token", updateError);
        return;
      }

      setUser(prev => (prev ? { ...prev, bearerToken: fallbackToken } : prev));
      return;
    }

    if (typeof data === "string") {
      setUser(prev => (prev ? { ...prev, bearerToken: data } : prev));
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);
    updateIsMobile();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateIsMobile);
      return () => mediaQuery.removeEventListener("change", updateIsMobile);
    } else {
      mediaQuery.addListener(updateIsMobile);
      return () => mediaQuery.removeListener(updateIsMobile);
    }
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (currentView === "checkout" && !checkoutPlan) {
      setCheckoutPlan(getUpgradeSuggestion(user?.plan));
    }
  }, [currentView, checkoutPlan, user?.plan]);

  useEffect(() => {
    const initializeSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await ensureUserProfile({
          id: session.user.id,
          email: session.user.email ?? "",
          name: (session.user.user_metadata?.full_name as string) || "QR User",
          plan: "free",
        });
        if (profile) {
          setUser(profile);

          const { data: historyRows, error } = await supabase
            .from("conversion_history")
            .select("id, text, qr_code_url, created_at, type")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false });

          if (!error && historyRows) {
            const mapped: ConversionRecord[] = historyRows.map(row => ({
              id: row.id ?? row.created_at,
              text: row.text,
              qrCodeUrl: row.qr_code_url ?? "",
              timestamp: row.created_at,
              type: (row.type as "url" | "text") ?? "text",
            }));
            setConversionHistory(mapped);
          }
        }
      }

      setSessionInitialized(true);
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        ensureUserProfile({
          id: session.user.id,
          email: session.user.email ?? "",
          name: (session.user.user_metadata?.full_name as string) || "QR User",
          plan: "free",
        }).then(async (profile: User | null) => {
          if (profile) {
            setUser(profile);

            const { data: historyRows, error } = await supabase
              .from("conversion_history")
              .select("id, text, qr_code_url, created_at, type")
              .eq("user_id", profile.id)
              .order("created_at", { ascending: false });

            if (!error && historyRows) {
              const mapped: ConversionRecord[] = historyRows.map(row => ({
                id: row.id ?? row.created_at,
                text: row.text,
                qrCodeUrl: row.qr_code_url ?? "",
                timestamp: row.created_at,
                type: (row.type as "url" | "text") ?? "text",
              }));
              setConversionHistory(mapped);
            }
          }
        });
      } else {
        setUser(null);
        setCurrentView("home");
        setSessionInitialized(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const startCheckoutFlow = (tier: PricingTier) => {
    if (user && !canUpgradeTo(user.plan, tier.planType)) {
      toast.info("You already have this plan or a higher one");
      setCheckoutPlan(null);
      setCurrentView("pricing");
      return;
    }

    setCheckoutPlan(tier);
    setCurrentView("checkout");
    setMobileMenuOpen(false);
  };

  const handleSelectPlan = (tier: PricingTier) => {
    if (!user) {
      setCheckoutPlan(tier);
      setPostAuthView("checkout");
      setCurrentView("login");
      setMobileMenuOpen(false);
      return;
    }

    if (!canUpgradeTo(user.plan, tier.planType)) {
      toast.info("You already have this plan or a higher one");
      return;
    }

    startCheckoutFlow(tier);
  };

  const handleUpgradePlan = () => {
    const suggestedTier = getUpgradeSuggestion(user?.plan);
    if (!suggestedTier) {
      return;
    }

    if (!user) {
      setCheckoutPlan(suggestedTier);
      setPostAuthView("checkout");
      setCurrentView("login");
      setMobileMenuOpen(false);
      return;
    }

    startCheckoutFlow(suggestedTier);
  };

  const handlePaymentSuccess = async (_payload: PaymentSuccessPayload) => {
    if (!user || !checkoutPlan) {
      setCheckoutPlan(null);
      setCurrentView("pricing");
      return;
    }

    const planStartedAt = new Date();
    const planRenewsAt = new Date(planStartedAt);
    planRenewsAt.setMonth(planRenewsAt.getMonth() + 1);

    const planStartedIso = planStartedAt.toISOString();
    const planRenewsIso = planRenewsAt.toISOString();

    const { error } = await supabase
      .from("users_custom")
      .update({
        plan: checkoutPlan.planType,
        plan_started_at: planStartedIso,
        plan_renews_at: planRenewsIso,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Failed to persist upgraded plan", error);
    } else {
      setUser({
        ...user,
        plan: checkoutPlan.planType,
        planStartedAt: planStartedIso,
        planRenewsAt: planRenewsIso,
      });
    }

    setCheckoutPlan(null);
    setCurrentView("dashboard");
  };

  const handleStartTrial = () => {
    if (user) {
      setCurrentView("dashboard");
    } else {
      setCurrentView("signup");
    }
  };

  const handleViewApiDocs = () => {
    if (user) {
      setCurrentView("dashboard");
    } else {
      setCurrentView("login");
    }
  };

  // Show login/signup pages without header
  if (currentView === "login") {
    return <Login onLogin={handleLogin} onSwitchToSignup={() => setCurrentView("signup")} />;
  }

  if (currentView === "signup") {
    return <Signup onSignup={handleSignup} onSwitchToLogin={() => setCurrentView("login")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-8 h-8 text-indigo-600" />
              <h1 className="text-indigo-600 text-lg">QR Generator Pro</h1>
            </div>

            {/* Mobile menu button (only on small screens) */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="flex items-center gap-2">
                <Button
                  variant={currentView === "home" ? "default" : "ghost"}
                  onClick={() => setCurrentView("home")}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
                {user && (
                  <Button
                    variant={currentView === "dashboard" ? "default" : "ghost"}
                    onClick={() => setCurrentView("dashboard")}
                    className="gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                )}
                {user && (
                  <Button
                    variant={currentView === "history" ? "default" : "ghost"}
                    onClick={() => setCurrentView("history")}
                    className="gap-2"
                  >
                    <HistoryIcon className="w-4 h-4" />
                    History
                  </Button>
                )}
                {user?.isAdmin && (
                  <Button
                    variant={currentView === "admin" ? "default" : "ghost"}
                    onClick={() => setCurrentView("admin")}
                    className="gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/features.html";
                    }
                  }}
                  className="gap-2"
                >
                  Features
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentView("pricing")}
                  className="gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Pricing
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/contact.html";
                    }
                  }}
                  className="gap-2"
                >
                  Contact
                </Button>

                {/* Auth Button */}
                {user ? (
                  <div className="flex items-center gap-3 ml-4 pl-4 border-l">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-700">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.plan} Plan</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setCurrentView("login")} className="gap-2 ml-4">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                )}
              </nav>
            )}
          </div>

          {/* Mobile Navigation (only on small screens) */}
          {isMobile && mobileMenuOpen && (
            <nav className="pt-4 pb-2 flex flex-col gap-2">
              <Button
                variant={currentView === "home" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentView("home");
                  setMobileMenuOpen(false);
                }}
                className="gap-2 justify-start"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              {user && (
                <Button
                  variant={currentView === "dashboard" ? "default" : "ghost"}
                  onClick={() => {
                    setCurrentView("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="gap-2 justify-start"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              )}
              {user && (
                <Button
                  variant={currentView === "history" ? "default" : "ghost"}
                  onClick={() => {
                    setCurrentView("history");
                    setMobileMenuOpen(false);
                  }}
                  className="gap-2 justify-start"
                >
                  <HistoryIcon className="w-4 h-4" />
                  History
                </Button>
              )}
              {user?.isAdmin && (
                <Button
                  variant={currentView === "admin" ? "default" : "ghost"}
                  onClick={() => {
                    setCurrentView("admin");
                    setMobileMenuOpen(false);
                  }}
                  className="gap-2 justify-start"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/features.html";
                  }
                }}
                className="gap-2 justify-start"
              >
                Features
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentView("pricing");
                  setMobileMenuOpen(false);
                }}
                className="gap-2 justify-start"
              >
                <DollarSign className="w-4 h-4" />
                Pricing
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/contact.html";
                  }
                  setMobileMenuOpen(false);
                }}
                className="gap-2 justify-start"
              >
                Contact
              </Button>

              {/* Mobile Auth Button */}
              {user ? (
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.plan} Plan</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="gap-2 justify-start"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setCurrentView("login");
                    setMobileMenuOpen(false);
                  }}
                  className="gap-2 justify-start"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      {currentView === "home" && (
        <>
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-16 text-center">
            <h2 className="mb-4 text-indigo-900">
              Generate QR Codes Instantly
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Transform any text, URL, or data into a professional QR code in seconds.
              Perfect for businesses, events, and personal use.
            </p>
          </section>

          {/* QR Generator Section */}
          <section className="container mx-auto px-4 pb-16">
            <QRGenerator
              onConversion={handleConversion}
              conversionsUsed={user ? user.conversionsUsed : conversions}
              isLoggedIn={!!user}
            />
          </section>
        </>
      )}

      {currentView === "dashboard" && user && (
        <section className="container mx-auto px-4 py-8">
          <Dashboard
            user={user}
            setUser={setUser}
            onResetBearerToken={handleResetBearerToken}
            conversionHistory={conversionHistory}
            onUpgradePlan={handleUpgradePlan}
          />
        </section>
      )}

      {currentView === "history" && user && (
        <section className="container mx-auto px-4 py-8">
          <History 
            conversions={conversionHistory} 
            onDeleteConversion={handleDeleteConversion}
          />
        </section>
      )}

      {currentView === "admin" && user?.isAdmin && (
        <section className="container mx-auto px-4 py-8">
          <Admin currentUser={user} />
        </section>
      )}

      {currentView === "pricing" && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-gray-900">
              Simple, Usage-Based Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pay only for what you use. Our pricing scales with your conversion needs.
            </p>
          </div>
          <PricingSection currentPlan={user?.plan} onSelectPlan={handleSelectPlan} />
        </section>
      )}

      {currentView === "checkout" && (
        <Checkout
          selectedPlan={checkoutPlan ?? undefined}
          user={user ?? undefined}
          onBackToPricing={() => {
            setCurrentView("pricing");
            setCheckoutPlan(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onOpenLegal={view => setCurrentView(view)}
        />
      )}

      {currentView === "terms" && (
        <section className="container mx-auto px-4 py-8">
          <TermsOfService />
        </section>
      )}

      {currentView === "privacy" && (
        <section className="container mx-auto px-4 py-8">
          <PrivacyPolicy />
        </section>
      )}

      {currentView === "refund" && (
        <section className="container mx-auto px-4 py-8">
          <RefundCancellationPolicy />
        </section>
      )}

      {currentView === "billing" && (
        <section className="container mx-auto px-4 py-8">
          <SubscriptionBillingPolicy />
        </section>
      )}

      {currentView === "gdpr" && (
        <section className="container mx-auto px-4 py-8">
          <GDPRCompliance />
        </section>
      )}

      {/* Footer */}
      <footer className="mt-16 bg-[#050b18] border-t border-white/5 text-gray-300">
        <div className="container mx-auto px-6 py-16">
          <div className="grid gap-10 text-sm md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-7 h-7 text-indigo-400" />
                <span className="text-lg font-semibold text-black">{COMPANY_NAME}</span>
              </div>
              <p className="leading-relaxed text-gray-300">
                Professional QR code generation service trusted by businesses worldwide.
              </p>
              <div className="flex gap-4 text-gray-400">
                <a href={SOCIAL_LINKS.linkedin} aria-label="LinkedIn" className="hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href={SOCIAL_LINKS.twitter} aria-label="X" className="hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href={SOCIAL_LINKS.facebook} aria-label="Facebook" className="hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-black font-bold tracking-wide text-lg md:text-xl">Product</p>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="/features.html"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="hover:text-white transition-colors cursor-pointer"
                    onClick={event => {
                      event.preventDefault();
                      setCurrentView("pricing");
                    }}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="/features.html#api"
                    className="hover:text-white transition-colors"
                  >
                    API Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/contact.html"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li><a href="/features.html" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-black font-bold tracking-wide text-base md:text-lg">Legal</p>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    className="hover:text-white transition-colors text-left cursor-pointer"
                    onClick={() => setCurrentView("privacy")}
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    className="hover:text-white transition-colors text-left cursor-pointer"
                    onClick={() => setCurrentView("terms")}
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    className="hover:text-white transition-colors text-left cursor-pointer"
                    onClick={() => setCurrentView("refund")}
                  >
                    Refund & Cancellation Policy
                  </button>
                </li>
                <li>
                  <button
                    className="hover:text-white transition-colors text-left cursor-pointer"
                    onClick={() => setCurrentView("gdpr")}
                  >
                    GDPR Compliance
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-black font-bold tracking-wide text-base md:text-lg">Contact Us</p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white transition-colors">{SUPPORT_EMAIL}</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <a href={`tel:${SUPPORT_PHONE}`} className="hover:text-white transition-colors">{SUPPORT_PHONE}</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400 mt-0.5" />
                  <span>{COMPANY_ADDRESS}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-xs text-gray-500 text-center">
            <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved. {PAYMENT_TAGLINE}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}