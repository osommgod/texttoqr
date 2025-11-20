import { PlanType } from "../types";

export interface PricingTier {
  name: string;
  conversions: string;
  price: string;
  pricePerConversion: string;
  features: string[];
  popular?: boolean;
  planType: PlanType;
}

export const fallbackPricingTiers: PricingTier[] = [
  {
    name: "Starter",
    conversions: "Up to 100",
    price: "$9",
    pricePerConversion: "$0.09",
    planType: "starter",
    features: [
      "100 QR code conversions/month",
      "Basic QR code designs",
      "PNG download",
      "Standard support",
    ],
  },
  {
    name: "Professional",
    conversions: "Up to 500",
    price: "$29",
    pricePerConversion: "$0.058",
    planType: "professional",
    features: [
      "500 QR code conversions/month",
      "Custom QR code colors",
      "PNG & SVG download",
      "Priority support",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Business",
    conversions: "Up to 2,000",
    price: "$79",
    pricePerConversion: "$0.039",
    planType: "business",
    features: [
      "2,000 QR code conversions/month",
      "Advanced customization",
      "All download formats",
      "24/7 dedicated support",
      "Advanced analytics",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    conversions: "Unlimited",
    price: "Custom",
    pricePerConversion: "Volume pricing",
    planType: "enterprise",
    features: [
      "Unlimited conversions",
      "White-label solution",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom features",
    ],
  },
];

export function getFallbackTier(planType: PlanType | undefined): PricingTier {
  if (!planType || planType === "free") {
    return fallbackPricingTiers[0];
  }

  return (
    fallbackPricingTiers.find((tier) => tier.planType === planType) ?? fallbackPricingTiers[0]
  );
}

const planOrder: PlanType[] = ["free", "starter", "professional", "business", "enterprise"];

const getPlanRank = (plan?: PlanType): number => {
  if (!plan) return -1;
  return planOrder.indexOf(plan);
};

export function canUpgradeTo(currentPlan: PlanType | undefined, targetPlan: PlanType): boolean {
  const targetRank = getPlanRank(targetPlan);
  if (targetRank === -1) return false;

  const currentRank = getPlanRank(currentPlan);
  if (currentRank === -1) return true;

  return targetRank > currentRank;
}

export function getUpgradeSuggestion(currentPlan?: PlanType): PricingTier | null {
  const currentRank = getPlanRank(currentPlan);
  return fallbackPricingTiers.find((tier) => getPlanRank(tier.planType) > currentRank) ?? null;
}
