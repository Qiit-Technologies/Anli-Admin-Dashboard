import { XCircle } from 'lucide-react';

export default function VoidChargesModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-8 w-[400px] max-w-full text-center shadow-lg">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 rounded-full p-3">
                        <XCircle className="text-red-500 w-8 h-8" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-[#432005] mb-1">
                    Are you sure you want to void this
                </h2>

                {/* Subtitle */}
                <p className="text-sm font-normal text-[#9CA3AF] mb-4">
                    Please give reason for voiding this charges
                </p>

                {/* Input */}
                <input
                    type="text"
                    placeholder="reason for rejection"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm placeholder-gray-400 mb-6"
                />

                {/* Done button */}
                <button
                    onClick={onClose}
                    className="bg-[#007BFF] text-white font-medium px-6 py-2 rounded w-50 hover:bg-blue-700 transition cursor-pointer"
                >
                    Done
                </button>
            </div>
        </div>
    );
}
