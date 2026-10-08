import { useState, useEffect } from 'react';
import {
    getDashboardSummary,
    getCashFlow,
    getRevenueSummary,
    getDashboardTransactions,
} from '@/app/actions/account';

import {
    DashboardSummary,
    CashFlowData,
    RevenueSummary,
    Transaction,
} from '@/types/accounts/dashboard';

export const useAccountDashboard = () => {
    const [balanceSummary, setBalanceSummary] =
        useState<DashboardSummary | null>(null);

    const [revenueSummaryCard, setRevenueSummaryCard] =
        useState<DashboardSummary | null>(null);

    const [expensesSummary, setExpensesSummary] =
        useState<DashboardSummary | null>(null);
    const [cashFlow, setCashFlow] = useState<CashFlowData[]>([]);
    const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(
        null,
    );
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    // Start and end date for range
    const [balanceStartDate, setBalanceStartDate] = useState<
        string | undefined
    >(undefined);
    const [expensesStartDate, setExpensesStartDate] = useState<
        string | undefined
    >(undefined);
    const [revenueStartDate, setRevenueStartDate] = useState<
        string | undefined
    >(undefined);
    const [balanceEndDate, setBalanceEndDate] = useState<string | undefined>(
        undefined,
    );
    const [expensesEndDate, setExpensesEndDate] = useState<string | undefined>(
        undefined,
    );
    const [revenueEndDate, setRevenueEndDate] = useState<string | undefined>(
        undefined,
    );
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [
                    balanceRes,
                    revenueRes,
                    expensesRes,
                    cashFlowRes,
                    revenueSummaryRes,
                    transactionsRes,
                ] = await Promise.all([
                    getDashboardSummary({
                        type: 'balance',
                        start_date: balanceStartDate,
                        end_date: balanceEndDate,
                    }),
                    getDashboardSummary({
                        start_date: revenueStartDate,
                        type: 'revenue',
                        end_date: revenueEndDate,
                    }),
                    getDashboardSummary({
                        start_date: expensesStartDate,
                        type: 'expenses',
                        end_date: expensesEndDate,
                    }),
                    getCashFlow(),
                    getRevenueSummary(selectedDate),
                    getDashboardTransactions(),
                ]);

                if (balanceRes.error) throw new Error(balanceRes.error);
                if (revenueRes.error) throw new Error(revenueRes.error);
                if (expensesRes.error) throw new Error(expensesRes.error);
                if (cashFlowRes.error) throw new Error(cashFlowRes.error);

                if (revenueSummaryRes.error)
                    throw new Error(revenueSummaryRes.error);

                if (transactionsRes.error)
                    throw new Error(transactionsRes.error);

                setBalanceSummary(balanceRes.data ?? null);
                setRevenueSummaryCard(revenueRes.data ?? null);
                setExpensesSummary(expensesRes.data ?? null);
                setCashFlow(cashFlowRes.data ?? []);
                setRevenueSummary(revenueSummaryRes.data ?? null);
                setTransactions(transactionsRes.data ?? []);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'An error occurred',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [
        selectedDate,
        balanceStartDate,
        revenueStartDate,
        expensesStartDate,
        balanceEndDate,
        revenueEndDate,
        expensesEndDate,
    ]);

    const handleDateChange = (
        type: 'balance' | 'revenue' | 'expenses',
        start: string | undefined,
        end: string | undefined,
    ) => {
        if (type === 'balance') {
            setBalanceStartDate(start);
            setBalanceEndDate(end);
        }
        if (type === 'revenue') {
            setRevenueStartDate(start);
            setRevenueEndDate(end);
        }
        if (type === 'expenses') {
            setExpensesStartDate(start);
            setExpensesEndDate(end);
        }
    };

    // Fetch revenue summary for a given date (format: 'May 12, 2025')
    const fetchRevenueSummary = async (date: string) => {
        setLoading(true);
        try {
            const res = await getRevenueSummary(date);
            if (res.error) throw new Error(res.error);
            setRevenueSummary(res.data ?? null);
            setSelectedDate(date);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(
        (transaction) =>
            transaction.transactionType
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            transaction.module
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    return {
        summary: {
            totalBalance: balanceSummary?.totalBalance ?? 0,
            revenue: revenueSummaryCard?.revenue ?? 0,
            expenses: expensesSummary?.expenses ?? 0,
            percentageChange: balanceSummary?.percentageChange ?? 0,
            revenueChange: revenueSummaryCard?.revenueChange ?? 0,
            expensesChange: expensesSummary?.expensesChange ?? 0,
        },
        balanceSummary,
        revenueSummaryCard,
        expensesSummary,
        cashFlow,
        revenueSummary,
        transactions: filteredTransactions,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        fetchRevenueSummary,
        selectedDate,
        handleDateChange,
    };
};
