import { BusinessDTO } from "@/types/business";
import { ApiResponse } from "../lib/types";
// import { BillingInfo } from "@/types/plan";

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
import { BillingInfoDTO } from "@/types/plan";
import { ReportDTO } from "@/types/report";
import { StaffDTO } from "@/types/staff";
export interface GetBusinessListOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
}
export type getBusinessListResponse = ApiResponse<{ hotels: BusinessDTO[] }>;
export interface GetPlanOptions {
  businessId: string;
}
export type getPlanResponse = ApiResponse<{ billingInfo: BillingInfoDTO }>;

// export type getPlanResponse = ApiResponse<{ billingInfo: BillingInfo }>;

export interface GetPermissionsListOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export type permissionsListResponse = ApiResponse<{
  permissions: Permission[];
}>;
export interface GetReportsOptions {
  businessId: string;
  page?: number;
  limit?: number;
}
export type getReportsResponse = ApiResponse<{ reports: ReportDTO[] }>;

export interface GetStaffOptions {
  businessId: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}
export type getStaffResponse = ApiResponse<{ staffs: StaffDTO[] }>;
