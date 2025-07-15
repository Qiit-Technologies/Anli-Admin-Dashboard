import { BusinessDTO } from "@/types/business";
import { ApiResponse } from "../lib/types";

export type businessListResponse = ApiResponse<{ hotels: BusinessDTO[] }>;
