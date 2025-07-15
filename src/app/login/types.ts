import { ApiResponse } from "@/hooks/types";
import { UserDTO } from "@/types/user";

export type FormDataProps = {
  email?: string;
  password?: string;
};

export type LoginResponse = ApiResponse<UserDTO>;
