import useSWR from 'swr';
import { getInternalAccounts } from '@/app/actions/internal-accounts';
import { InternalAccount } from '@/types/internal-accounts';
import {
    formatInternalAccountLabel,
    formatInternalAccountOption,
} from '@/lib/internal-accounts/format';

export type InternalAccountSelectOption = {
    label: string;
    value: string;
};

/**
 * Shared Internal Account options for payment dropdowns across FO / FOH.
 * Prefer this over duplicating SWR + map logic in each payment form.
 */
export function useInternalAccountOptions() {
    const { data, error, isLoading, mutate } = useSWR(
        '/internal-accounts',
        getInternalAccounts,
    );

    const accounts: InternalAccount[] = Array.isArray(data) ? data : [];

    const options: InternalAccountSelectOption[] = accounts.map((account) =>
        formatInternalAccountOption(account),
    );

    const findByValue = (value: string | null | undefined) => {
        if (!value) return undefined;
        return accounts.find(
            (account) =>
                account.accountCode === value ||
                account.id === value ||
                String(account.id) === value,
        );
    };

    const formatPaidThrough = (value: string | null | undefined) => {
        const account = findByValue(value);
        return account ? formatInternalAccountLabel(account) : null;
    };

    return {
        accounts,
        options,
        isLoading,
        error,
        mutate,
        findByValue,
        formatPaidThrough,
    };
}
