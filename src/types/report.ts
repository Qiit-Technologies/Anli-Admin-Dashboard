export type ReportStatus =
  | "unresolved"
  | "resolved"
  | "closed"
  | "open"
  | string;

export interface ReportDTO {
  id: number;
  description: string;
  status: ReportStatus;
  hotelId: number;
  createdBy: string;
  creatorRole: string;
  createdAt: Date;
  comment: string;
}
