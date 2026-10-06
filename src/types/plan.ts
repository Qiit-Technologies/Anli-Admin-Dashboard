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
}
