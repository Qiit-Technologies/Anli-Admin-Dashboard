import { Skeleton } from '@/components/ui/skeleton';

export default function OrderSkeleton() {
    return (
        <div className="w-full h-full max-w-7xl mx-auto">
            {/* Top tabs */}
            <div className="flex gap-6 mb-6 border-b pb-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-2/3">
                    {/* Category button */}
                    <div className="mb-6">
                        <Skeleton className="h-12 w-24 rounded-full" />
                    </div>

                    {/* Divider */}
                    <Skeleton className="h-px w-full mb-6" />

                    {/* Food items grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {Array(4)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="flex flex-col">
                                    <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                                    {/* <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
                                    <Skeleton className="h-4 w-full rounded-md mb-1" />
                                    <Skeleton className="h-4 w-1/2 rounded-md" /> */}
                                </div>
                            ))}
                    </div>
                </div>

                {/* Order summary */}
                <div className="w-full lg:w-1/3">
                    <div className="border rounded-lg p-6">
                        {/* Order title */}
                        <Skeleton className="h-8 w-48 rounded-md mb-6" />

                        {/* Table header */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <Skeleton className="h-6 w-full rounded-md" />
                            <Skeleton className="h-6 w-full rounded-md" />
                            <Skeleton className="h-6 w-full rounded-md" />
                        </div>

                        {/* Order items */}
                        {Array(4)
                            .fill(0)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-3 gap-4 mb-6"
                                >
                                    <Skeleton className="h-6 w-full rounded-md" />
                                    <Skeleton className="h-6 w-10 rounded-md mx-auto" />
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-6 w-20 rounded-md" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-6 w-6 rounded-md" />
                                            <Skeleton className="h-6 w-6 rounded-md" />
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {/* Divider */}
                        <Skeleton className="h-px w-full mb-6" />

                        {/* Total */}
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton className="h-6 w-16 rounded-md" />
                            <Skeleton className="h-6 w-24 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mt-6 justify-end">
                <Skeleton className="h-10 w-36 rounded-md" />
                <Skeleton className="h-10 w-36 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-36 rounded-md" />
            </div>
        </div>
    );
}
