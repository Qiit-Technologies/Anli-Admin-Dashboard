import { createLedgerTransaction } from '@/app/actions/internal-accounts-ledger';
import {
    AddFundsFormValues,
    InternalAccount,
} from '@/types/internal-accounts';
import { CreateTransactionPayload } from '@/types/internal-accounts-ledger';
import { mutate } from 'swr';

export function buildFundingTransactionPayload(
    account: InternalAccount,
    values: AddFundsFormValues,
    initiatedBy: string,
): CreateTransactionPayload {
    const needsApproval = values.approvalRequired === 'yes';
    const fundingDateLabel = values.fundingDate
        ? new Date(values.fundingDate).toLocaleDateString('en-GB')
        : '';

    const descriptionParts = [
        values.description.trim(),
        fundingDateLabel ? `(Funding date: ${fundingDateLabel})` : '',
        values.accountReceivedInto
            ? `(Received into: ${values.accountReceivedInto})`
            : '',
    ].filter(Boolean);

    return {
        type: 'Funding',
        credit: values.amount,
        sourceModule: values.fundingSource,
        customer: account.owner,
        invoiceNo: values.accountReceivedInto || undefined,
        description: descriptionParts.join(' '),
        initiatedBy,
        approvedBy: needsApproval ? undefined : initiatedBy,
        status: needsApproval ? 'Pending' : 'Approved',
    };
}

export async function submitAccountFunding(
    account: InternalAccount,
    values: AddFundsFormValues,
    initiatedBy: string,
): Promise<{ error?: string }> {
    const payload = buildFundingTransactionPayload(
        account,
        values,
        initiatedBy,
    );

    const result = await createLedgerTransaction(account.id, payload);

    if (result.error) {
        return { error: result.error };
    }

    await mutate(`/internal-accounts/${account.id}`);
    await mutate('/internal-accounts');
    await mutate('/internal-accounts/stats');
    await mutate(`/internal-accounts/${account.id}/ledger-stats`);
    await mutate(`/internal-accounts/${account.id}/transactions`);

    return {};
}
