export type PlanCardProps = {
  planName: string;
  price: number; // e.g. "$00/mth"
  tagline: string;
  renewalDate: string; // already formatted, e.g. "July 15, 2025, 3 days left"
  modulesAllowed: number;
  billingCycle: string;
  benefits: string; // comma‑separated list
  status?: string;
  isExpired?: boolean;
  hotelActive?: boolean;
  warningInfo?: {
    isActive?: boolean;
    warningStartedAt?: string;
    warningExpiresAt?: string;
    reason?: string | null;
    setBy?: string | null;
  };
  canStartWarning?: boolean;
  canCancelWarning?: boolean;
  warningActionLoading?: boolean;
  warningCancelLoading?: boolean;
  onStartWarning?: (options: {
    reason?: string;
    warningStartedAt?: string;
    warningExpiresAt?: string;
  }) => Promise<void> | void;
  onCancelWarning?: () => Promise<void> | void;
  onUpgrade?: () => void;
  onMakePayment?: () => void;
  onReactivate?: () => Promise<void> | void;
  reactivating?: boolean;
};
