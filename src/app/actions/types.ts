import { BusinessDTO } from "@/types/business";
import { ApiResponse } from "../lib/types";
import { BillingInfo } from "@/types/plan";

export interface Permission {
  id: string;
  name: string;
  description: string;
  moduleId?: number;
  module?: {
    id: number;
    name: string;
    description?: string;
  };
}
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

export interface GetPermissionsListOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export type permissionsListResponse = ApiResponse<{
  permissions: Permission[];
}>;
