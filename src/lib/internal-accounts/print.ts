import { formatCurrency } from '@/lib/utils';
import { InternalAccount } from '@/types/internal-accounts';
import {
    InternalAccountTransaction,
    PostedBill,
} from '@/types/internal-accounts-ledger';

const PRINT_STYLES = `
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #111; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; font-weight: 600; }
    .section { margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 24px; }
    .field-label { font-size: 11px; color: #666; margin-bottom: 2px; }
    .field-value { font-size: 13px; font-weight: 600; }
    @media print { body { padding: 0; } }
`;

function openPrintWindow(title: string, bodyHtml: string) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>${PRINT_STYLES}</style>
</head>
<body>
    ${bodyHtml}
    <script>window.onload = () => { window.print(); window.close(); };</script>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
}

function printedAtMeta() {
    return `<p class="meta">Printed on ${new Date().toLocaleString('en-GB')}</p>`;
}

function formatDateTime(value: string) {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-GB');
}

function formatDate(value: string) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB');
}

export function printInternalAccountsList(accounts: InternalAccount[]) {
    const rows = accounts
        .map(
            (account) => `
        <tr>
            <td>${account.accountCode}</td>
            <td>${account.accountName}</td>
            <td>${account.accountType}</td>
            <td>${formatCurrency(account.openingBalance)}</td>
            <td>${formatCurrency(account.currentBalance)}</td>
            <td>${account.owner}</td>
            <td>${formatDate(account.lastTransaction)}</td>
            <td>${account.status}</td>
        </tr>`,
        )
        .join('');

    openPrintWindow(
        'Internal Accounts',
        `
        <h1>Internal Accounts</h1>
        ${printedAtMeta()}
        <table>
            <thead>
                <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th>Account Type</th>
                    <th>Opening Balance</th>
                    <th>Current Balance</th>
                    <th>Owner</th>
                    <th>Last Transaction</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `,
    );
}

export function printInternalAccountDetail(account: InternalAccount) {
    openPrintWindow(
        `Internal Account - ${account.accountName}`,
        `
        <h1>${account.accountName}</h1>
        <p class="meta">${account.accountCode} · ${account.accountType} · ${account.status}</p>
        ${printedAtMeta()}
        <div class="section grid">
            <div><p class="field-label">Current Balance</p><p class="field-value">${formatCurrency(account.currentBalance)}</p></div>
            <div><p class="field-label">Opening Balance</p><p class="field-value">${formatCurrency(account.openingBalance)}</p></div>
            <div><p class="field-label">Owner</p><p class="field-value">${account.owner}</p></div>
            <div><p class="field-label">Contact Email</p><p class="field-value">${account.contactEmail}</p></div>
            <div><p class="field-label">Contact Phone</p><p class="field-value">${account.contactPhone}</p></div>
            <div><p class="field-label">Approval Required</p><p class="field-value">${account.approvalRequired ? 'Yes' : 'No'}</p></div>
            <div><p class="field-label">Total Funding Added</p><p class="field-value">${formatCurrency(account.totalFundingAdded ?? 0)}</p></div>
            <div><p class="field-label">Total Bills Posted</p><p class="field-value">${formatCurrency(account.totalBillsPosted ?? 0)}</p></div>
            <div><p class="field-label">Reference Number</p><p class="field-value">${account.referenceNumber ?? '—'}</p></div>
        </div>
        ${account.description ? `<div class="section"><p class="field-label">Description</p><p class="field-value">${account.description}</p></div>` : ''}
    `,
    );
}

export function printInternalAccountTransactions(
    accountName: string,
    transactions: InternalAccountTransaction[],
) {
    const rows = transactions
        .map(
            (row) => `
        <tr>
            <td>${formatDateTime(row.dateTime)}</td>
            <td>${row.transactionId}</td>
            <td>${row.type}</td>
            <td>${row.invoiceNo || '—'}</td>
            <td>${row.sourceModule}</td>
            <td>${row.debit != null ? formatCurrency(row.debit) : '—'}</td>
            <td>${row.credit != null ? formatCurrency(row.credit) : '—'}</td>
            <td>${row.runningBalance != null ? formatCurrency(row.runningBalance) : '—'}</td>
            <td>${row.description}</td>
            <td>${row.status}</td>
        </tr>`,
        )
        .join('');

    openPrintWindow(
        `Transactions - ${accountName}`,
        `
        <h1>All Transactions</h1>
        <p class="meta">${accountName}</p>
        ${printedAtMeta()}
        <table>
            <thead>
                <tr>
                    <th>Date / Time</th>
                    <th>Transaction ID</th>
                    <th>Type</th>
                    <th>Invoice No</th>
                    <th>Source</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                    <th>Description</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `,
    );
}

export function printPostedBills(accountName: string, bills: PostedBill[]) {
    const rows = bills
        .map(
            (row) => `
        <tr>
            <td>${row.invoiceNo}</td>
            <td>${row.sourceModule}</td>
            <td>${row.guestCustomer}</td>
            <td>${row.roomTableNo || '—'}</td>
            <td>${formatDate(row.billDate)}</td>
            <td>${formatDate(row.postedDate)}</td>
            <td>${formatCurrency(row.billAmount)}</td>
            <td>${row.postedBy}</td>
            <td>${row.status}</td>
        </tr>`,
        )
        .join('');

    openPrintWindow(
        `Posted Bills - ${accountName}`,
        `
        <h1>Posted Bills</h1>
        <p class="meta">${accountName}</p>
        ${printedAtMeta()}
        <table>
            <thead>
                <tr>
                    <th>Invoice No</th>
                    <th>Source</th>
                    <th>Guest / Customer</th>
                    <th>Room / Table</th>
                    <th>Bill Date</th>
                    <th>Posted Date</th>
                    <th>Amount</th>
                    <th>Posted By</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `,
    );
}
