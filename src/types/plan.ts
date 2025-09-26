// export type ModuleName = "Front Office" | "Restaurant" | "Bar" | string;

export interface BillingInfoDTO {
  plan_name: string;
  renewal_date: string;
  billing_cycle: "monthly" | "yearly" | string;
  modules: string[];
  price: number;
}
