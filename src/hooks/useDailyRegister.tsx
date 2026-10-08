'use client';

import useSWR, { mutate } from 'swr';
import {
    getDailyStockRegisters,
    getDailyStockRegisterByDate,
    createDailyStockRegister,
    closeDailyStockRegister,
} from '@/app/actions/stock';
import { DailyStockRegister } from '@/types/stock-register.type';
import { toast } from 'react-hot-toast';
import Toast from '@/components/toast';
import { format } from 'date-fns';

export function useDailyRegister() {
    const todayKey = format(new Date(), 'yyyy-MM-dd');

    const fetchRegisters = async () => {
        const result = await getDailyStockRegisters();
        if (result.error) throw new Error(result.error);
        return result?.data?.data as DailyStockRegister[];
    };

    const fetchRegisterByDate = async (date: string) => {
        const result = await getDailyStockRegisterByDate(date);
        if (result.error) throw new Error(result.error);
        return result.data as DailyStockRegister;
    };

    const {
        data: registers,
        error: registersError,
        isLoading: registersLoading,
    } = useSWR('daily-registers', fetchRegisters);

    /** Live today's register — backend recalculates open registers on fetch. */
    const {
        data: todayRegister,
        error: todayRegisterError,
        isLoading: todayRegisterLoading,
    } = useSWR(
        `daily-register-${todayKey}`,
        () => fetchRegisterByDate(todayKey),
        {
            refreshInterval: 30_000,
            revalidateOnFocus: true,
        },
    );

    /** Ensures register exists for date (backend auto-creates + refreshes). */
    const ensureRegisterForDate = async (date: string) => {
        const register = await fetchRegisterByDate(date);
        mutate('daily-registers');
        mutate(`daily-register-${date}`);
        return register;
    };

    const handleCreateRegister = async (date: string) => {
        const result = await createDailyStockRegister({ registerDate: date });
        if (result.error) {
            toast.custom(() => (
                <Toast title="Error!" description={result.error} type="error" />
            ));
            return null;
        }
        mutate('daily-registers');
        mutate(`daily-register-${date}`);
        return result.data as DailyStockRegister;
    };

    const handleCloseRegister = async (id: number) => {
        const result = await closeDailyStockRegister(id);
        if (result.error) {
            toast.custom(() => (
                <Toast title="Error!" description={result.error} type="error" />
            ));
            return false;
        }
        toast.custom(() => (
            <Toast
                title="Success!"
                description={result.message || 'Register closed successfully'}
                type="success"
            />
        ));
        mutate('daily-registers');
        mutate(`daily-register-${todayKey}`);
        return true;
    };

    return {
        registers,
        registersLoading,
        registersError,
        todayRegister,
        todayRegisterLoading,
        todayRegisterError,
        fetchRegisterByDate,
        ensureRegisterForDate,
        createRegister: handleCreateRegister,
        closeRegister: handleCloseRegister,
        refreshRegisters: () => {
            mutate('daily-registers');
            mutate(`daily-register-${todayKey}`);
        },
    };
}
