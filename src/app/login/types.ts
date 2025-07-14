import { ApiResponse } from "@/hooks/types";

export type FormDataProps = {
  email?: string;
  password?: string;
};
interface UserData {
  id: number;
  email: string;
  fullName: string;
  profileImage: string | null;
  status: "pending" | "active" | "suspended" | "inactive";
  roleId: number;
}

export type LoginResponse = ApiResponse<UserData>;
