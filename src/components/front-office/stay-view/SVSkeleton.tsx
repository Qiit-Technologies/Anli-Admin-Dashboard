'use client';
import { Skeleton } from '@/components/ui/skeleton';
interface RoomType {
    name: string;
    rooms: number;
}

export function StayViewSkeleton() {
    const dateColumns: number[] = Array.from({ length: 7 }, (_, i) => i);

    const roomTypes: RoomType[] = [
        { name: 'Standard Room', rooms: 4 },
        { name: 'Deluxe Room', rooms: 2 },
        { name: 'Studio Apartment', rooms: 2 },
        { name: 'Executive Double', rooms: 2 },
    ];

    const getReservationPattern = (
        typeIndex: number,
        roomIndex: number,
        dateIndex: number,
    ): boolean => {
        return (typeIndex + roomIndex + dateIndex) % 3 === 0;
    };

    const getSpanLength = (
        typeIndex: number,
        roomIndex: number,
        dateIndex: number,
    ): number => {
        return ((typeIndex * 3 + roomIndex * 2 + dateIndex) % 3) + 1;
    };

    return (
        <div className="flex flex-col w-full animate-in fade-in duration-300">
            <div className="flex justify-between items-center my-4 px-6">
                <Skeleton className="h-6 w-28" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded" />
                    <Skeleton className="h-9 w-16 rounded" />
                    <Skeleton className="h-9 w-9 rounded" />
                </div>
            </div>

            <div className="border-y">
                <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b bg-muted/50">
                    <div className="p-2 border-r">
                        <Skeleton className="h-5 w-32" />
                    </div>
                    {dateColumns.map((index) => (
                        <div
                            key={index}
                            className="p-2 text-center border-r last:border-r-0"
                        >
                            <Skeleton className="h-4 w-8 mx-auto mb-1" />
                            <Skeleton className="h-4 w-4 mx-auto" />
                        </div>
                    ))}
                </div>

                <div className="divide-y">
                    {roomTypes.map((roomType, typeIndex) => (
                        <div key={typeIndex}>
                            <div className="flex items-center p-2 hover:bg-muted/50">
                                <Skeleton className="h-4 w-4 mr-2" />
                                <Skeleton className="h-5 w-40" />
                            </div>

                            {Array.from(
                                { length: roomType.rooms },
                                (_, roomIndex) => (
                                    <div
                                        key={roomIndex}
                                        className="grid grid-cols-[200px_repeat(7,1fr)] border-t"
                                    >
                                        <div className="p-2 border-r flex items-center gap-2">
                                            <Skeleton className="h-4 w-4 rounded" />
                                            <Skeleton className="h-4 w-12" />
                                        </div>

                                        {dateColumns.map((dateIndex) => {
                                            const hasReservation: boolean =
                                                getReservationPattern(
                                                    typeIndex,
                                                    roomIndex,
                                                    dateIndex,
                                                );
                                            const span: number = hasReservation
                                                ? getSpanLength(
                                                      typeIndex,
                                                      roomIndex,
                                                      dateIndex,
                                                  )
                                                : 1;

                                            if (
                                                dateIndex === 0 ||
                                                !hasReservation
                                            ) {
                                                return (
                                                    <div
                                                        key={dateIndex}
                                                        className="border-r last:border-r-0 p-2"
                                                        style={
                                                            hasReservation
                                                                ? {
                                                                      gridColumn: `span ${Math.min(span, 8 - dateIndex)}`,
                                                                  }
                                                                : {}
                                                        }
                                                    >
                                                        {hasReservation && (
                                                            <Skeleton className="h-6 w-full rounded-md" />
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                ),
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
