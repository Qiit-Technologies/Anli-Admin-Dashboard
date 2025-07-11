import { XCircle } from "lucide-react";

export default function LoggedIssueModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 px-4">
      <div className="w-full max-w-xl bg-white overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-black text-white px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-normal">Logged issues</h2>
            <button className="cursor-pointer" onClick={onClose}>
              <XCircle className="text-white" />
            </button>
          </div>
          {/* Status Tag */}
          <div className="text-sm font-medium">
            <span className="mr-2 text-[#B5B5B5]">Status</span>
            <span className="bg-[#FEF3F2] text-[#D55D00] px-3 py-1 rounded-full text-xs font-medium">
              Opened
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Reported Issues */}
          <div className="bg-orange-50 p-4 border-1 rounded-xl">
            <p className="text-lg font-bold mb-1 text-[#354052]">
              Reported Issues
            </p>
            <p className="text-sm font-medium text-[#354052]">
              Guests unable to confirm online bookings
            </p>
          </div>

          {/* Other Related */}
          <div className="bg-[#FCFCFC] p-4 rounded-xl border text-sm">
            <p className="font-bold text-gray-700 mb-4 text-lg">
              Other related
            </p>
            <div className="flex justify-between py-1">
              <span className="text-[#474747] font-medium text-sm">
                Issue Module
              </span>
              <span className="text-black font-medium text-base">
                Front Office
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#474747] font-medium text-sm">
                Priority
              </span>
              <span className="text-black font-medium text-base">High</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#474747] font-medium text-sm">
                Date Logged
              </span>
              <span className="text-black font-medium text-base">
                23rd March 2024
              </span>
            </div>
          </div>

          {/* Assign Task */}
          <div>
            <label className="block font-bold text-md text-[#354052] mb-2 text-lg">
              Assign task to
            </label>
            <select
              className="w-full border text-sm border-gray-200 rounded-md bg-gray-50 px-3 py-2"
              defaultValue=""
            >
              <option value="" disabled>
                Select who will work on this
              </option>
              <option value="tobi">Tobi</option>
              <option value="mary">Mary</option>
            </select>
          </div>

          {/* Status Radio */}
          <div>
            <p className="font-bold text-lg text-[#354052] mb-2">
              Issues current status
            </p>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  width={28}
                  className="accent-orange-500"
                />
                In progress
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  width={28}
                  className="accent-orange-500"
                />
                Mark as resolved
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
