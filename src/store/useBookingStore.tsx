import { Facility, Member, MemberBooking } from '@/types/membership/membership';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BookingStore {
    member: Member | null;
    facility: Facility | null;
    dateTime: { date: string; time: string; duration: number } | null;
    isEditMode: boolean;
    editingBookingId: number | null;
    currentStep: number;
    isLoading: boolean;

    setMember: (member: Member | null) => void;
    setFacility: (facility: Facility | null) => void;
    setDateTime: (
        dateTime: { date: string; time: string; duration: number } | null,
    ) => void;
    setCurrentStep: (step: number) => void;
    setIsLoading: (loading: boolean) => void;

    setEditMode: (booking: MemberBooking) => void;
    exitEditMode: () => void;

    resetBookingData: () => void;
}

const useBookingStore = create<BookingStore>()(
    devtools(
        (set) => ({
            member: null,
            facility: null,
            dateTime: null,
            isEditMode: false,
            editingBookingId: null,
            currentStep: 0,
            isLoading: false,

            setMember: (member: Member | null) => set({ member }),

            setFacility: (facility: Facility | null) => set({ facility }),

            setDateTime: (
                dateTime: {
                    date: string;
                    time: string;
                    duration: number;
                } | null,
            ) => set({ dateTime }),

            setCurrentStep: (step: number) => set({ currentStep: step }),

            setIsLoading: (loading: boolean) => set({ isLoading: loading }),

            setEditMode: (booking: MemberBooking) => {
                const startTime = booking.startTime
                    ? new Date(booking.startTime)
                    : null;
                const endTime = booking.endTime
                    ? new Date(booking.endTime)
                    : null;
                const duration =
                    startTime &&
                    endTime &&
                    !Number.isNaN(startTime.getTime()) &&
                    !Number.isNaN(endTime.getTime())
                        ? Math.max(
                              1,
                              Math.round(
                                  (endTime.getTime() - startTime.getTime()) /
                                      (1000 * 60 * 60),
                              ),
                          )
                        : 1;

                set({
                    isEditMode: true,
                    editingBookingId: booking.id,
                    currentStep: 3,
                    member: booking.member ?? null,
                    facility: booking.facility ?? null,
                    dateTime:
                        startTime && !Number.isNaN(startTime.getTime())
                            ? {
                                  date: startTime.toISOString().split('T')[0],
                                  time: startTime.toTimeString().slice(0, 5),
                                  duration,
                              }
                            : null,
                });
            },

            exitEditMode: () =>
                set({
                    isEditMode: false,
                    editingBookingId: null,
                    currentStep: 0,
                    member: null,
                    facility: null,
                    dateTime: null,
                }),

            resetBookingData: () =>
                set({
                    member: null,
                    facility: null,
                    dateTime: null,
                    currentStep: 0,
                    isLoading: false,
                }),
        }),
        { name: 'BookingStore', enabled: true },
    ),
);

export default useBookingStore;
