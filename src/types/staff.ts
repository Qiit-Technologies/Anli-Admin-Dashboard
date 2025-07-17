export type StaffStatus = "online" | "offline" | string;
export type WorkMode = "Monthly" | "Weekly" | "Daily" | string;

export interface StaffDTO {
  id: number;
  username: string;
  fullName: string;
  password: string;
  email: string;
  profileImage: string | null;
  status: StaffStatus;
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  type: string | null;
  homeAddress: string | null;
  phoneNumber: string | null;
  code: string | null;
  startDate: string | null;
  workMode: WorkMode;
  branch: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  bankCode: string | null;
  salary: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  relationship: string | null;
  imageUrl: string | null;
  employmentLetter: string | null;
  isActive: boolean;
}
