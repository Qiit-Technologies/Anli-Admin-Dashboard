import { TextAreaInput } from "@/components/common/TextAreaInput";
import { ReportDTO } from "@/types/report";
import { formatDate } from "@/utils/utils";

export const ViewIssueDetails = ({
  report,
  handleFormInputChange,
  formData,
}: {
  formData: {
    comment: string;
    status: string;
  };
  report: ReportDTO;
  handleFormInputChange: (name: string, value: string) => void;
}) => {
  const statuses = ["unresolved", "resolved", "closed", "open"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 py-[17px] px-[20px] bg-[#FFF1E7] rounded-lg border border-[#E0E0E0]">
        <span className="font-bold text-lg leading-[150%] text-[#354052]">
          Reported Issue
        </span>
        <p className="font-medium text-sm leading-[150%]">
          {report.description}
        </p>
      </div>

      <div className="flex flex-col gap-4 py-[17px] px-[20px] border border-[#E0E0E0] rounded-lg">
        <span className="text-[#354052] font-bold text-lg leading-[150%]">
          Other related information
        </span>
        <div className="w-full flex justify-between">
          <span className="text-sm font-medium text-[#474747]">
            Date Logged
          </span>
          <span className="text-[#111111] text-base font-medium">
            {formatDate(report.createdAt)}
          </span>
        </div>
        <div className="w-full flex justify-between">
          <span className="text-sm font-medium text-[#474747]">Created By</span>
          <span className="text-[#111111] text-base font-medium">
            {report.createdBy}
          </span>
        </div>
        <div className="w-full flex justify-between">
          <span className="text-sm font-medium text-[#474747]">
            Role of creator
          </span>
          <span className="text-[#111111] text-base font-medium">
            {report.creatorRole}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-lg leading-[150%] text-[#354052]">
          Issue current status
        </span>
        <div className="flex gap-3 flex-wrap">
          {statuses.map((status) => (
            <div key={status} className="flex items-center gap-1">
              <input
                type="radio"
                name="report-status"
                value={status}
                id={status}
                className="w-[20px] h-[20px]"
                checked={formData.status === status}
                onChange={(e) =>
                  handleFormInputChange("status", e.target.value)
                }
              />
              <label
                htmlFor={status}
                className="text-base text-[#021921] capitalize"
              >
                {status}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-lg leading-[150%] text-[#354052]">
          Issue current status
        </span>
        <TextAreaInput
          id="comment"
          label={null}
          name="comment"
          placeholder="Enter your comment on the issue here"
          className="min-h-32"
          onChange={(e) => handleFormInputChange("comment", e.target.value)}
          value={formData.comment}
          // readOnly={
          //   formData.status === "closed" || formData.status === "resolved"
          // }
        />
      </div>
    </div>
  );
};
