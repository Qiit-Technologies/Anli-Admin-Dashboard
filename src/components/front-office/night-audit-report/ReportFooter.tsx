'use client';

import { format } from 'date-fns';

interface ReportFooterProps {
    generatedAt?: Date;
}

export default function ReportFooter({ generatedAt }: ReportFooterProps) {
    const formattedDate = generatedAt
        ? format(generatedAt, "EEEE, MMMM d, yyyy '–' hh:mm a")
        : null;

    return (
        <div className="mt-auto bg-gray-50 border-t border-gray-200 py-4 px-6 -mx-4 sm:-mx-6">
            <div className="flex flex-col items-center justify-center gap-1">
                {formattedDate && (
                    <p className="text-sm text-gray-600">
                        Report Generated on {formattedDate}
                    </p>
                )}
            </div>
        </div>
    );
}
