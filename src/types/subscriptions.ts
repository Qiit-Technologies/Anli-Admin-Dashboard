export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  features: SubscriptionPlanFeatures;
  price: number;
}

interface SubscriptionPlanFeatures {
  maxRooms: number;
  maxStaff: number;
  moduleAllowed: string[];
  supportLevel: "basic" | "premium" | null;
}
