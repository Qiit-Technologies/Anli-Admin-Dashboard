import { ApiResponse } from "@/hooks/types";

type BusinessType = "HOTEL" | string; // Add other possible business types if known
type DisbursementType = "IN_APP_DISBURSEMENT" | string; // Add other possible disbursement types

export interface BusinessDTO {
  id: number;
  name: string;
  isActive: boolean;
  address: string;
  businessType: BusinessType;
  registrationNumber: string | null;
  country: string;
  state: string;
  coverImage: string | null;
  cacImage: string | null;
  isCacVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string; // or Date if you'll parse it
  taxId: string | null;
  incorporationCert: string | null;
  boardingToken: string | null;
  services: unknown | null; // Replace 'any' with proper type if services structure is known
  disbursementType: DisbursementType;
}

export type businessListResponse = ApiResponse<{ hotels: BusinessDTO[] }>;
