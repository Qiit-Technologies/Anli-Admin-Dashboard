import { BusinessDTO } from "@/types/business";
import { ApiResponse } from "../lib/types";
import { BillingInfoDTO } from "@/types/plan";
import { ReportDTO } from "@/types/report";
import { StaffDTO } from "@/types/staff";

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

export interface ModuleActivityChartData {
  month?: string;
  date?: string;
  front_office: number;
  housekeeping: number;
  stock: number;
  membership: number;
  restaurant: number;
  account: number;
  employee: number;
}

//GENERAL REQUESTS -> RESPONSE TYPES
export interface GetBusinessListOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface GetPermissionsListOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export type permissionsListResponse = ApiResponse<{
  permissions: Permission[];
}>;

export type getBusinessListResponse = ApiResponse<{ hotels: BusinessDTO[] }>;

// DASHBOARD REQUESTS -> RESPONSE TYPES
export type getLowModuleActivityResponse = ApiResponse<{
  unusedModules: string[];
}>;

export type getMostActiveModulesResponse = ApiResponse<{
  pastMonthOfActivities: {
    moduleName: string;
    usageCount: number;
  }[];
}>;

export type GeneralModuleActivityResponse = ApiResponse<{
  moduleActivity: ModuleActivityChartData[];
}>;

// ISSUES PAGE REQUESTS -> RESPONSE TYPES
export interface GetReportsOptions {
  businessId: string;
  page?: number;
  limit?: number;
}
export type getReportsResponse = ApiResponse<{ reports: ReportDTO[] }>;

// STAFF PAGE REQUESTS -> RESPONSE TYPES
export interface GetStaffOptions {
  businessId: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export type getStaffResponse = ApiResponse<{ staffs: StaffDTO[] }>;

// PLAN PAGE REQUESTS -> RESPONSE TYPES
export interface GetPlanOptions {
  businessId: string;
}

export type getPlanResponse = ApiResponse<{ billingInfo: BillingInfoDTO }>;

// PAYMENT REQUESTS -> RESPONSE TYPES
