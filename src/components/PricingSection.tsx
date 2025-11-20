import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { PlanType } from "../types";
import { supabase } from "../lib/supabaseClient";
import { PricingTier, fallbackPricingTiers, canUpgradeTo } from "../lib/pricing";

interface PricingSectionProps {
  currentPlan?: PlanType;
  onSelectPlan?: (tier: PricingTier) => void;
}

export function PricingSection({ currentPlan, onSelectPlan }: PricingSectionProps) {
  const [tiers, setTiers] = useState<PricingTier[]>(fallbackPricingTiers);

  useEffect(() => {
    const loadPlans = async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("id, name, monthly_conversions, price_monthly_cents, features, is_active")
        .eq("is_active", true);

      if (error || !data || data.length === 0) {
        console.error("Failed to load plans for pricing, using defaults", error);
        return;
      }

      const mapped: (PricingTier & { _priceValue: number })[] = data.map(plan => {
        const planType = plan.id as PlanType;
        const conversionsNum = plan.monthly_conversions ?? 0;
        const conversionsLabel = conversionsNum === 0
          ? "Unlimited"
          : `Up to ${conversionsNum.toLocaleString()}`;

        const cents = plan.price_monthly_cents ?? 0;
        const price = cents === 0 ? "$0" : `$${(cents / 100).toFixed(0)}`;
        const pricePerConversion = conversionsNum && cents
          ? `$${(cents / 100 / conversionsNum).toFixed(3)}`
          : "Volume pricing";

        const features: string[] = Array.isArray(plan.features)
          ? plan.features
          : [];

        // use a numeric value for sorting; treat 0 as cheapest and "Custom" (no price) as most expensive
        const priceValue = plan.price_monthly_cents === null
          ? Number.MAX_SAFE_INTEGER
          : plan.price_monthly_cents;

        return {
          name: plan.name ?? plan.id,
          conversions: conversionsLabel,
          price,
          pricePerConversion,
          features,
          planType,
          popular: planType === "professional", // keep current highlight
          _priceValue: priceValue,
        };
      });

      const sorted = mapped
        .slice()
        .sort((a, b) => a._priceValue - b._priceValue)
        .map(({ _priceValue, ...tier }) => tier);

      setTiers(sorted);
    };

    loadPlans();
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={`relative p-6 flex flex-col ${
            tier.popular
              ? "border-2 border-indigo-500 shadow-lg scale-105"
              : ""
          } ${
            currentPlan === tier.planType
              ? "border-2 border-green-500"
              : ""
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm">
                Most Popular
              </span>
            </div>
          )}
          {currentPlan === tier.planType && (
            <div className="absolute -top-3 right-4">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                Current Plan
              </span>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-gray-900 mb-2">{tier.name}</h3>
            <div className="mb-1">
              <span className="text-gray-900">{tier.price}</span>
              {tier.price !== "Custom" && <span className="text-gray-500">/month</span>}
            </div>
            <p className="text-sm text-gray-500">{tier.conversions} conversions</p>
            <p className="text-xs text-gray-400 mt-1">{tier.pricePerConversion} per conversion</p>
          </div>

          <ul className="space-y-3 mb-6 flex-grow">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            variant={tier.popular ? "default" : "outline"}
            className="w-full"
            disabled={!canUpgradeTo(currentPlan, tier.planType)}
            onClick={() => {
              if (!canUpgradeTo(currentPlan, tier.planType)) return;
              onSelectPlan?.(tier);
            }}
          >
            {!canUpgradeTo(currentPlan, tier.planType)
              ? currentPlan === tier.planType
                ? "Current Plan"
                : "Not Available"
              : tier.price === "Custom"
              ? "Contact Sales"
              : "Upgrade"}
          </Button>
        </Card>
      ))}
    </div>
  );
}