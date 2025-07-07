export type PlanCardProps = {
  planName: string;
  price: string; // e.g. "$00/mth"
  tagline: string;
  renewalDate: string; // already formatted, e.g. "July 15, 2025, 3 days left"
  modulesAllowed: number;
  billingCycle: "Monthly" | "Yearly";
  benefits: string; // comma‑separated list
  onUpgrade?: () => void;
  onSwitchBilling?: () => void;
  onDowngrade?: () => void;
};
