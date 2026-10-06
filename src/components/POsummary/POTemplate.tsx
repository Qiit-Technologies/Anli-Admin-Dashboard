import React from 'react';

interface POItems {
    item: string;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
    unitOfMeasurement?: string;
    remarks?: string;
}

interface POTemplateProps {
    purchaseOrder: {
        poNumber: string;
        vendor: {
            vendorName: string;
            emailAddress?: string;
            phoneNumber?: string;
            address?: string;
        };
    };
    items: POItems[];
    company: any;
}

const POTemplate: React.FC<POTemplateProps> = ({
    purchaseOrder,
    items,
    company,
}) => {
    const toNumber = (v: unknown) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const formatCurrency = (v: unknown) => {
        const n = toNumber(v);
        return `₦${n.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const subtotal = items.reduce(
        (sum, item) => sum + toNumber(item.amount),
        0,
    );
    const total = subtotal;

    // Calculate due date (30 days from invoice date)
    const invoiceDate =
        //  invoice.createdAt
        //     ? new Date(invoice.createdAt)
        //     :
        new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30); // Net 30 terms

    return (
        <div className="bg-white p-2 max-w-5xl mx-auto font-sans">
            {/* Header Section */}
            <div className="border-b border-gray-300 pb-3 mb-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {company?.name}
                        </div>
                        <div className="text-gray-600 text-sm">
                            {company.address}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-blue-50 px-3 py-1 rounded border border-blue-200">
                            <div className="text-blue-700 font-semibold text-xs mb-1">
                                Purchase Order
                            </div>
                            <div className="text-blue-600 text-sm font-bold">
                                #{purchaseOrder.poNumber}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-200 p-3 rounded bg-gray-50">
                        <div className="font-bold text-gray-800 text-sm mb-2 flex items-center">
                            Company Details
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs">
                                    Name:
                                </span>
                                <span className="text-gray-900 font-semibold text-xs">
                                    {company.name}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs">
                                    Address:
                                </span>
                                <span className="text-gray-900 font-semibold text-xs">
                                    {company.address}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs">
                                    Business Type:
                                </span>
                                <span style={{ textTransform: 'lowercase' }}>
                                    {company.businessType}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-3 rounded bg-gray-50">
                        <div className="font-bold text-gray-800 text-sm mb-2 flex items-center">
                            Vendor Information
                        </div>
                        <div className="space-y-1">
                            <div className="text-gray-900 font-semibold text-sm">
                                {purchaseOrder.vendor.vendorName}
                            </div>
                            {purchaseOrder.vendor.address && (
                                <div className="text-gray-600 text-xs flex items-center">
                                    <svg
                                        style={{
                                            width: '0.75rem',
                                            height: '0.75rem',
                                            marginRight: '0.25rem',
                                            color: '#9ca3af',
                                        }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    {purchaseOrder.vendor.address}
                                </div>
                            )}
                            {purchaseOrder.vendor.emailAddress && (
                                <div className="text-gray-600 text-xs flex items-center">
                                    <svg
                                        style={{
                                            width: '0.75rem',
                                            height: '0.75rem',
                                            marginRight: '0.25rem',
                                            color: '#9ca3af',
                                        }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {purchaseOrder.vendor.emailAddress}
                                </div>
                            )}
                            {purchaseOrder.vendor.phoneNumber && (
                                <div className="text-gray-600 text-xs flex items-center">
                                    <svg
                                        style={{
                                            width: '0.75rem',
                                            height: '0.75rem',
                                            marginRight: '0.25rem',
                                            color: '#9ca3af',
                                        }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    {purchaseOrder.vendor.phoneNumber}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-4">
                <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-2 py-2 text-left font-bold text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                                    Item
                                </th>
                                <th className="px-2 py-2 text-left font-bold text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                                    Description
                                </th>
                                <th className="px-2 py-2 text-center font-bold text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                                    Qty
                                </th>
                                <th className="px-2 py-2 text-right font-bold text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                                    Rate
                                </th>
                                <th className="px-2 py-2 text-right font-bold text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`${
                                        index % 2 === 0
                                            ? 'bg-white'
                                            : 'bg-gray-50'
                                    }`}
                                >
                                    <td className="px-2 py-2 text-gray-900 font-medium text-xs">
                                        {item.item}
                                    </td>
                                    <td className="px-2 py-2 text-gray-600 text-xs">
                                        {item.description || '-'}
                                    </td>
                                    <td className="px-2 py-2 text-gray-700 text-center text-xs">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                                            {item.quantity}
                                        </span>
                                        {item.unitOfMeasurement && (
                                            <div className="text-gray-500 text-xs mt-0.5">
                                                {item.unitOfMeasurement}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-gray-700 text-right text-xs font-medium">
                                        {formatCurrency(item.rate) ?? ''}
                                    </td>
                                    <td className="px-2 py-2 text-gray-900 text-right text-xs font-bold">
                                        {formatCurrency(item.amount) ?? ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Total Section */}
            <div className="flex justify-end mb-3">
                <div className="w-64 bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600 text-xs font-medium">
                                Subtotal:
                            </span>
                            <span className="text-gray-800 font-semibold text-sm">
                                {formatCurrency(subtotal)}
                            </span>
                        </div>
                        <div className="border-t border-blue-200 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-900 font-bold text-base">
                                    Total:
                                </span>
                                <span className="text-blue-600 font-bold text-lg">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POTemplate;
