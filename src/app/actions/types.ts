import { BusinessDTO } from "@/types/business";
import { ApiResponse } from "../lib/types";
import { BillingInfo } from "@/types/plan";
export interface GetBusinessListOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
}
export type businessListResponse = ApiResponse<{ hotels: BusinessDTO[] }>;
export interface GetPlanOptions {
  id: string;
}

export type getPlanResponse = ApiResponse<{ billingInfo: BillingInfo }>;
