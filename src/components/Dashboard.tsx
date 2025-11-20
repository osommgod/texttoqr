import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ConversionRecord, User, PlanType } from "../types";
import { supabase } from "../lib/supabaseClient";
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  ArrowUpRight,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCcw
} from "lucide-react";

interface DashboardProps {
  user: User;
  setUser: (user: User) => void;
  onResetBearerToken: () => void;
  conversionHistory: ConversionRecord[];
  onUpgradePlan?: () => void;
}

interface PlanLimits {
  conversions: number;
  name: string;
  price: string;
}

const defaultPlanLimits: Record<PlanType, PlanLimits> = {
  free: { conversions: 10, name: "Free", price: "$0" },
  starter: { conversions: 100, name: "Starter", price: "$9" },
  professional: { conversions: 500, name: "Professional", price: "$29" },
  business: { conversions: 2000, name: "Business", price: "$79" },
  enterprise: { conversions: 999999, name: "Enterprise", price: "Custom" },
};

export function Dashboard({ user, setUser, onResetBearerToken, conversionHistory, onUpgradePlan }: DashboardProps) {
  const [planLimits, setPlanLimits] = useState<Record<PlanType, PlanLimits>>(defaultPlanLimits);
  const currentPlan = planLimits[user.plan] ?? defaultPlanLimits[user.plan];
  const usagePercentage = (user.conversionsUsed / currentPlan.conversions) * 100;
  const remainingConversions = currentPlan.conversions - user.conversionsUsed;
  const daysUntilReset = (() => {
    const now = new Date();

    if (user.planRenewsAt) {
      const renewDate = new Date(user.planRenewsAt);
      const diffMs = renewDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }

    if (user.planStartedAt) {
      const startDate = new Date(user.planStartedAt);
      const renewDate = new Date(startDate);
      renewDate.setMonth(renewDate.getMonth() + 1);
      const diffMs = renewDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }

    // Fallback: assume 30 day cycle
    return 30;
  })();
  const [showBearer, setShowBearer] = useState(false);
  const [copiedField, setCopiedField] = useState<"apiKey" | "token" | null>(null);

  const totalConversions = conversionHistory.length;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfToday.getDay());
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const countInRange = (from: Date, to: Date) =>
    conversionHistory.filter(c => {
      const t = new Date(c.timestamp).getTime();
      return t >= from.getTime() && t < to.getTime();
    }).length;

  const todayConversions = countInRange(startOfToday, new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000));
  const thisWeekConversions = countInRange(startOfWeek, new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000));
  const lastWeekConversions = countInRange(startOfLastWeek, startOfWeek);

  const daysSincePlanStart = user.planStartedAt
    ? Math.max(1, Math.floor((now.getTime() - new Date(user.planStartedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 30;
  const averageDailyConversions = totalConversions ? Math.round(totalConversions / daysSincePlanStart) : 0;
  const projectedMonthlyConversions = averageDailyConversions * 30;

  useEffect(() => {
    const loadPlans = async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("id, name, monthly_conversions, price_monthly_cents")
        .eq("is_active", true);

      if (error || !data) {
        console.error("Failed to load plans, using defaults", error);
        return;
      }

      const updated: Record<PlanType, PlanLimits> = { ...defaultPlanLimits };

      data.forEach(plan => {
        const id = plan.id as PlanType;
        if (!updated[id]) return;

        const conversions = plan.monthly_conversions ?? updated[id].conversions;
        const cents = plan.price_monthly_cents ?? 0;
        const price = cents === 0 ? "$0" : `$${(cents / 100).toFixed(0)}`;

        updated[id] = {
          name: plan.name ?? updated[id].name,
          conversions,
          price,
        };
      });

      setPlanLimits(updated);
    };

    loadPlans();
  }, []);

  const getUsageColor = () => {
    if (usagePercentage >= 90) return "text-red-600";
    if (usagePercentage >= 75) return "text-orange-600";
    return "text-green-600";
  };

  const getProgressColor = () => {
    if (usagePercentage >= 90) return "bg-red-500";
    if (usagePercentage >= 75) return "bg-orange-500";
    return "bg-indigo-600";
  };

  const handleCopy = async (value: string, field: "apiKey" | "token") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  };

  const apiEndpoint = "https://tqcaiytfzytdqxkodlvf.supabase.co/functions/v1/generate-qr";
  const supabaseAnonKey = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxY2FpeXRmenl0ZHF4a29kbHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyODY5NDEsImV4cCI6MjA3ODg2Mjk0MX0.TgN_hpEY2Ikmw9GQDX0EzgjwwDDEiNji8sYx4XD08Qs";
  const displayApiKey = user.apiKey || "qr_demo_6f12c8b19a";
  const displayBearerToken = user.bearerToken || "br_demo_f0b1c2d3e4f56789";
  const requestBodySample = `{
  "text": "https://example.com/invoice/123"
}`;
  const bearerDisplayValue = showBearer ? displayBearerToken : "your_bearer_token";
  const authorizationHeaderValue = `Authorization: Bearer ${supabaseAnonKey}\nX-API-Key: ${displayApiKey}\nX-Bearer-Token: ${bearerDisplayValue}`;
  const curlExample = `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${supabaseAnonKey}" \\
  -H "X-API-Key: ${displayApiKey}" \\
  -H "X-Bearer-Token: ${bearerDisplayValue}" \\
  -d '{\n        "text": "Launch promo QR"\n      }'`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.name}
          </p>
        </div>
        <Badge variant="secondary" className="text-lg py-2 px-4 capitalize">
          {currentPlan.name} Plan
        </Badge>
      </div>

      {/* Usage Warning */}
      {usagePercentage >= 75 && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-900">
                {usagePercentage >= 90 ? "Almost at your limit!" : "Approaching your limit"}
              </p>
              <p className="text-sm text-orange-700 mt-1">
                You've used {usagePercentage.toFixed(0)}% of your monthly conversions. 
                Consider upgrading to avoid interruptions.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Active
            </Badge>
          </div>
          <p className="text-gray-600 mb-1">Conversions Used</p>
          <p className={`text-gray-900 ${getUsageColor()}`}>
            {user.conversionsUsed.toLocaleString()} / {currentPlan.conversions.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Resets In</p>
          <p className="text-gray-900">{daysUntilReset} days</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Current Plan</p>
          <p className="text-gray-900">{currentPlan.price}/month</p>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900">Monthly Usage</h3>
              <p className="text-sm text-gray-600 mt-1">
                Track your QR code conversion usage for this billing period
              </p>
            </div>
            <div className="text-right">
              <p className={`${getUsageColor()}`}>
                {usagePercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">
                {remainingConversions.toLocaleString()} remaining
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Progress 
              value={usagePercentage} 
              className="h-3"
              style={{
                // @ts-ignore
                '--progress-background': getProgressColor().replace('bg-', '')
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{(currentPlan.conversions / 2).toLocaleString()}</span>
              <span>{currentPlan.conversions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Usage Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">This Week</span>
              <span className="text-gray-900">{thisWeekConversions} conversions</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Last Week</span>
              <span className="text-gray-900">{lastWeekConversions} conversions</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Average Daily</span>
              <span className="text-gray-900">{averageDailyConversions} conversions</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Projected Monthly</span>
              <span className="text-gray-900">{projectedMonthlyConversions} conversions</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Plan Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Plan Name</span>
              <span className="text-gray-900 capitalize">{currentPlan.name}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Monthly Price</span>
              <span className="text-gray-900">{currentPlan.price}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Conversion Limit</span>
              <span className="text-gray-900">{currentPlan.conversions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Next Billing Date</span>
              <span className="text-gray-900">
                {user.planRenewsAt
                  ? new Date(user.planRenewsAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Not set"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 mb-1">Need more conversions?</h3>
            <p className="text-sm text-gray-600">
              Upgrade your plan to unlock higher limits and premium features
            </p>
          </div>
          <Button className="gap-2" onClick={onUpgradePlan}>
            Upgrade Plan
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Developer API Access */}
      <Card className="p-6 border border-dashed border-gray-200">
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">Beta</span>
              Developer API Access
            </div>
            <p className="text-sm text-gray-600 max-w-3xl">
              Authenticate each request with your API key and Bearer token using the <code className="font-mono">X-API-Key</code> and
              <code className="font-mono">X-Bearer-Token</code> headers. The JSON payload only accepts a <span className="font-semibold">text</span>
              field. Rotate/Reset your Bearer token anytime.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 min-w-0">
              <div>
                <p className="text-xs uppercase text-gray-500">API Key</p>
                <div className="mt-1 flex items-center gap-2 w-full">
                  <input
                    readOnly
                    value={displayApiKey}
                    className="w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCopy(displayApiKey, "apiKey")}
                  >
                    {copiedField === "apiKey" ? (
                      <span className="text-xs px-1">Copied</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs uppercase text-gray-500">
                  <span>Bearer Token</span>
                  <Button type="button" variant="ghost" className="gap-2 text-xs" onClick={onResetBearerToken}>
                    <RefreshCcw className="w-3.5 h-3.5" /> Reset token
                  </Button>
                </div>
                <div className="mt-1 flex items-center gap-2 w-full">
                  <input
                    readOnly
                    type={showBearer ? "text" : "password"}
                    value={displayBearerToken}
                    className="w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setShowBearer(!showBearer)}
                  >
                    {showBearer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCopy(displayBearerToken, "token")}
                  >
                    {copiedField === "token" ? (
                      <span className="text-xs px-1">Copied</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Required Headers</p>
                <pre className="mt-1 rounded-lg bg-gray-900 text-gray-100 text-xs p-3 overflow-x-auto whitespace-pre-wrap break-words">
{authorizationHeaderValue}
                </pre>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Endpoint</p>
                <div className="mt-1 flex items-center gap-2 w-full">
                  <span className="text-xs font-semibold text-gray-600 uppercase">POST</span>
                  <input
                    readOnly
                    value={apiEndpoint}
                    className="w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCopy(apiEndpoint, "apiKey")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Body (JSON)</p>
                <pre className="mt-1 rounded-lg bg-gray-900 text-gray-100 text-xs p-3 overflow-x-auto">
{requestBodySample}
                </pre>
              </div>
            </div>

            <div className="space-y-3 min-w-0">
              <p className="text-xs uppercase text-gray-500">cURL Example</p>
              <pre className="rounded-lg bg-gray-900 text-gray-100 text-xs p-3 h-full overflow-x-auto whitespace-pre-wrap break-all w-full">
{curlExample}
              </pre>
              <p className="text-sm text-gray-500">
                Successful responses include <code className="font-mono">status</code>, <code className="font-mono">message</code>, and
                a <code className="font-mono">qrCodeUrl</code> data URL that you can embed anywhere.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
