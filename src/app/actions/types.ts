import { BusinessDTO } from "@/types/business";
import { ApiResponse } from "../lib/types";
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
