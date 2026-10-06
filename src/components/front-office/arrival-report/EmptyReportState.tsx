'use client';

import Image from 'next/image';

interface EmptyReportStateProps {
    title?: string;
    description?: string;
    imageSrc?: string;
}

export default function EmptyReportState({
    title = 'No results found',
    description = 'Select a timeframe and click Generate to see arrivals.',
    imageSrc = '/house-keeping/emptyCard.svg',
}: EmptyReportStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="relative mb-6">
                <Image
                    src={imageSrc}
                    alt="No results"
                    width={250}
                    height={177}
                    className="object-contain"
                />
            </div>
            <h3 className="text-xl font-semibold text-[#667085] mb-2">
                {title}
            </h3>
            <p className="text-lg text-[#667085] text-center font-normal max-w-lg">
                {description}
            </p>
        </div>
    );
}
