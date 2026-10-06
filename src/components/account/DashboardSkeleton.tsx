import React from 'react';

const DashboardSkeleton = () => {
    return (
        <div className="w-full">
            {/* Header Skeleton */}
            {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                <div className="space-y-2 w-full sm:w-auto">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-10 flex-1 sm:flex-none sm:w-[320px] bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse shrink-0" />
                </div>
            </div> */}

            {/* BalanceAmounts Skeleton */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-[31px]">
                {[1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className="w-full bg-[#FAFAFA] shadow-md rounded-lg p-4 sm:p-6 border gap-6"
                    >
                        <div className="flex items-center w-full justify-between">
                            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                            <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                        <div className="mt-6 h-11 w-40 bg-gray-200 rounded animate-pulse" />
                        <div className="flex justify-between w-full items-baseline mt-4">
                            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                            <div className="h-[50px] w-[63px] bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div> */}

            {/* CashFlows Skeleton */}
            <div className="flex flex-col lg:flex-row gap-6 mb-[31px] min-h-[430px]">
                {/* Left Chart */}
                <div className="w-full lg:w-3/5 h-full bg-[#FAFAFA] shadow rounded-lg p-4 sm:p-6 border">
                    <div className="mb-6 flex items-center w-full justify-between">
                        <div className="space-y-2 flex-1 sm:flex-none">
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-full sm:w-64 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse shrink-0" />
                    </div>
                    <div className="h-[300px] w-full bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Right Chart */}
                <div className="w-full lg:w-2/5 h-full bg-[#FAFAFA] shadow rounded-2xl border">
                    <div className="flex items-center w-full justify-between border-b border-[#E1E4EA] px-3 py-2">
                        <div className="space-y-2">
                            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
                            <div className="h-7 w-36 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="p-4 flex flex-col justify-center items-center gap-3 h-4/5">
                        <div className="relative w-40 h-40">
                            <div className="h-full w-full rounded-full bg-gray-200 animate-pulse" />
                        </div>
                        <div className="space-y-5 w-full">
                            <div className="flex justify-center items-center gap-8">
                                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="flex justify-center items-center gap-8">
                                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CustomTable Skeleton */}
            <div className="w-full h-full overflow-hidden relative bg-white border rounded-lg">
                <div className="flex items-center w-full justify-between p-4 sm:px-6 sm:py-4">
                    <div className="h-7 w-28 sm:w-36 bg-gray-200 rounded animate-pulse" />
                    <div className="h-7 w-16 sm:w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="overflow-x-auto">
                    <div className="min-w-[600px] lg:min-w-[1000px]">
                        {/* Table Header */}
                        <div className="bg-gray-100 border py-4">
                            <div className="flex gap-2 sm:gap-4 px-4 sm:px-6">
                                {[1, 2, 3, 4, 5].map((index) => (
                                    <div
                                        key={index}
                                        className="h-6 flex-1 bg-gray-200 rounded animate-pulse"
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Table Body */}
                        <div className="divide-y">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <div
                                    key={row}
                                    className="flex gap-2 sm:gap-4 px-4 sm:px-6 py-4"
                                >
                                    {[1, 2, 3, 4, 5].map((cell) => (
                                        <div
                                            key={cell}
                                            className="h-6 flex-1 bg-gray-200 rounded animate-pulse"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
