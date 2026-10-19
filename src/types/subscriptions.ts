export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  features: SubscriptionPlanFeatures;
  price: number;
}

export interface SubscriptionPlanFeatures {
  maxRooms: number;
  maxStaff: number;
  moduleAllowed: string[];
  supportLevel: "none" | "basic" | "premium" | null;
}
