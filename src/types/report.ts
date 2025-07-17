export type ResportStatus = "unresolved" | "resolved" | "in_progress" | string;

export interface ReportDTO {
  id: number;
  title: string;
  description: string;
  status: ResportStatus;
  hotelId: number;
}
