export type PlanWarningInfo = {
  isActive: boolean;
  warningStartedAt?: string;
  warningExpiresAt?: string;
  secondsRemaining?: number;
  reason?: string | null;
  setBy?: string | null;
};

export type PlanCardProps = {
  planName: string;
  price: number;
  tagline: string;
  renewalDate: string;
  modulesAllowed: number;
  billingCycle: string;
  benefits: string;
  status?: string;
  isExpired?: boolean;
  hotelActive?: boolean;
  warningInfo?: PlanWarningInfo | null;
  canStartWarning?: boolean;
  canCancelWarning?: boolean;
  warningActionLoading?: boolean;
  warningCancelLoading?: boolean;
  onStartWarning?: (payload: {
    reason?: string;
    warningStartedAt?: string;
    warningExpiresAt?: string;
  }) => Promise<void> | void;
  onCancelWarning?: () => Promise<void> | void;
  onUpgrade?: () => void;
  onMakePayment?: () => void;
};
