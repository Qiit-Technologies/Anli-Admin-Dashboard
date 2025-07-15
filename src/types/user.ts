export interface UserDTO {
  id: number;
  email: string;
  fullName: string;
  profileImage: string | null;
  status: "pending" | "active" | "suspended" | "inactive";
  roleId: number;
}
