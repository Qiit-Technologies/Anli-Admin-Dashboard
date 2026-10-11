// export type ModuleName = "Front Office" | "Restaurant" | "Bar" | string;

export interface WarningInfoDTO {
  isActive: boolean;
  warningStartedAt?: string;
  warningExpiresAt?: string;
  secondsRemaining?: number;
  reason?: string | null;
  setBy?: string | null;
}

export interface BillingInfoDTO {
  plan_name: string;
  renewal_date: string;
  billing_cycle: "monthly" | "yearly" | string;
  modules: string[] | string;
  price: number;
  status?: string;
  isExpired?: boolean;
  hotelActive?: boolean;
  warningInfo?: WarningInfoDTO | null;
  /**
   * Canonical tier id from the subscription record ('flex' | 'basic-hotel' |
   * 'basic-restaurant' | 'advanced' | 'custom') — the single source of truth
   * the plan page uses to label the current plan (H6.2). Null when the plan
   * name doesn't map to a known tier.
   */
  plan_tier?: string | null;
  /** The plan's actual modules (subscription_plan.features.modulesAllowed). */
  plan_modules?: string[];
}
