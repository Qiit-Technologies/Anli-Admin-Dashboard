export type PlanCardProps = {
  planName: string;
  price: number; // e.g. "$00/mth"
  tagline: string;
  renewalDate: string; // already formatted, e.g. "July 15, 2025, 3 days left"
  modulesAllowed: number;
  billingCycle: string;
  benefits: string; // comma‑separated list
  onUpgrade?: () => void;
  onMakePayment?: () => void;
};
