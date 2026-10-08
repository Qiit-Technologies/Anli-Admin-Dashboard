import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { LuLoader } from 'react-icons/lu';

interface WorkPeriodEmptyStateProps {
    onStart: () => void;
    loading?: boolean;
}

const WorkPeriodEmptyState = ({
    onStart,
    loading,
}: WorkPeriodEmptyStateProps) => {
    const imageSrc = '/house-keeping/emptyCard.svg';

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 mt-2">
            <div className="relative mb-6">
                <Image
                    src={imageSrc}
                    alt="No results"
                    width={250}
                    height={177}
                    className="object-contain"
                />
            </div>

            <h3 className="text-[16px] font-bold text-gray-600">
                No Work Recorded
            </h3>
            <p className="text-gray-500 mb-4 max-w-xl font-normal text-[14px] leading-relaxed">
                You can click on the start button to resume work for today
            </p>

            <Button
                onClick={onStart}
                disabled={loading}
                className="bg-[#007bff] hover:bg-[#0069d9] text-white w-full max-w-sm px-24 py-6 rounded-lg text-[14px] font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
                {loading ? (
                    <>
                        <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                    </>
                ) : (
                    'Start Work Period'
                )}
            </Button>
        </div>
    );
};

export default WorkPeriodEmptyState;
