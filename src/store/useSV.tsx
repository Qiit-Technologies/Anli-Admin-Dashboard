'use client';
import {
    addDays,
    addMonths,
    addWeeks,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    isSameMonth,
    isSameWeek,
    parseISO,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subMonths,
    subWeeks,
} from 'date-fns';
import { create } from 'zustand';

const DEFAULT_VIEW_MODE = 'month';

type ViewMode = 'month' | 'custom' | 'week';

type StayViewStore = {
    viewMode: ViewMode;
    currentMonth: Date;
    currentWeek: Date;
    selectedDate: Date;
    customStartDate: Date;
    customDaysToShow: number;
    showDatePicker: boolean;

    getCurrentViewDates: () => Date[];

    setViewMode: (mode: ViewMode) => void;
    setCurrentMonth: (date: Date) => void;
    setSelectedDate: (date: Date) => void;
    setCustomStartDate: (date: Date) => void;
    setCustomDaysToShow: (days: number) => void;
    setShowDatePicker: (show: boolean) => void;

    goToNextMonth: () => void;
    goToPreviousMonth: () => void;
    goToToday: () => void;
    goToDate: (date: Date) => void;
    goToPreviousWeek: () => void;
    goToNextWeek: () => void;

    goToNextPage: () => void;
    goToPreviousPage: () => void;
};

const MIN_DAYS_TO_SHOW = 7;
const MAX_DAYS_TO_SHOW = 31;
const DEFAULT_DAYS_TO_SHOW = 20;

import { devtools } from 'zustand/middleware';

const useStayViewStore = create<StayViewStore>()(
    devtools(
        (set, get) => ({
            viewMode: DEFAULT_VIEW_MODE,
            currentMonth: startOfMonth(new Date()),
            currentWeek: startOfWeek(new Date()),
            selectedDate: startOfDay(new Date()),
            customStartDate: startOfDay(new Date()),
            customDaysToShow: DEFAULT_DAYS_TO_SHOW,
            showDatePicker: false,

            getCurrentViewDates: () => {
                const state = get();

                const normalizeDate = (date: Date) => {
                    if (date instanceof Date) {
                        return startOfDay(new Date(date));
                    }
                    if (typeof date === 'string') {
                        return startOfDay(parseISO(date));
                    }
                    return startOfDay(new Date());
                };

                if (state.viewMode === 'month') {
                    const normalizedStart = normalizeDate(state.currentMonth);
                    return eachDayOfInterval({
                        start: normalizedStart,
                        end: endOfMonth(normalizedStart),
                    });
                } else if (state.viewMode === 'week') {
                    const normalizedStart = normalizeDate(state.currentWeek);
                    return eachDayOfInterval({
                        start: normalizedStart,
                        end: endOfWeek(normalizedStart),
                    });
                } else {
                    const normalizedStart = normalizeDate(
                        state.customStartDate,
                    );
                    return eachDayOfInterval({
                        start: normalizedStart,
                        end: addDays(
                            normalizedStart,
                            state.customDaysToShow - 1,
                        ),
                    });
                }
            },

            setViewMode: (mode) => set({ viewMode: mode }),

            setCurrentMonth: (date) =>
                set({
                    currentMonth: startOfMonth(date),
                }),

            setCurrentWeek: (date: Date) =>
                set({
                    currentWeek: startOfWeek(date),
                }),

            setSelectedDate: (date) => {
                const normalizedDate = startOfDay(date);
                set({ selectedDate: normalizedDate });

                const state = get();
                if (
                    state.viewMode === 'month' &&
                    !isSameMonth(normalizedDate, state.currentMonth)
                ) {
                    set({ currentMonth: startOfMonth(normalizedDate) });
                } else if (
                    state.viewMode === 'week' &&
                    !isSameWeek(normalizedDate, state.currentWeek)
                ) {
                    set({ currentWeek: startOfWeek(normalizedDate) });
                }
            },

            setCustomStartDate: (date) =>
                set({
                    customStartDate: startOfDay(date),
                }),

            setCustomDaysToShow: (days) =>
                set({
                    customDaysToShow: Math.max(
                        MIN_DAYS_TO_SHOW,
                        Math.min(days, MAX_DAYS_TO_SHOW),
                    ),
                }),

            setShowDatePicker: (show) =>
                set({
                    showDatePicker: show,
                }),

            goToNextMonth: () =>
                set((state) => ({
                    currentMonth: addMonths(state.currentMonth, 1),
                })),

            goToPreviousMonth: () =>
                set((state) => ({
                    currentMonth: subMonths(state.currentMonth, 1),
                })),

            goToNextWeek: () =>
                set((state) => ({
                    currentWeek: addWeeks(state.currentWeek, 1),
                })),

            goToPreviousWeek: () =>
                set((state) => ({
                    currentWeek: subWeeks(state.currentWeek, 1),
                })),

            goToToday: () => {
                const today = new Date();
                set({
                    selectedDate: startOfDay(today),
                    currentMonth: startOfMonth(today),
                    currentWeek: startOfWeek(today),
                    customStartDate: startOfDay(today),
                });
            },

            goToDate: (date) => {
                const normalizedDate = startOfDay(date);
                set({
                    selectedDate: normalizedDate,
                    currentMonth: startOfMonth(normalizedDate),
                    currentWeek: startOfWeek(normalizedDate),
                    customStartDate: normalizedDate,
                });
            },

            goToNextPage: () => {
                const state = get();
                if (state.viewMode === 'week') {
                    set({ currentWeek: addWeeks(state.currentWeek, 1) });
                } else {
                    set({
                        customStartDate: addDays(
                            state.customStartDate,
                            state.customDaysToShow,
                        ),
                    });
                }
            },

            goToPreviousPage: () => {
                const state = get();
                if (state.viewMode === 'week') {
                    set({ currentWeek: subWeeks(state.currentWeek, 1) });
                } else {
                    set({
                        customStartDate: addDays(
                            state.customStartDate,
                            -state.customDaysToShow,
                        ),
                    });
                }
            },
        }),
        { name: 'StayViewStore', enabled: true },
    ),
);

export default useStayViewStore;
