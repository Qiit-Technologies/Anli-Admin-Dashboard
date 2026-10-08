'use client';

import { GuestProps } from '@/types';
import { useState } from 'react';
import { FaCheck } from 'react-icons/fa';

export default function GuestHistory({ guest }: GuestProps) {
    const [stayHistory] = useState([
        {
            stayId: 'ST-1001',
            checkIn: '20 Jan 2025, 10:00',
            checkOut: '20 Jan 2025, 10:00',
            roomNo: '202',
            roomType: 'Suite',
            bookingSource: 'Walk-In',
        },
        {
            stayId: 'ST-1020',
            checkIn: '21 Jan 2025, 14:00',
            checkOut: '21 Jan 2025, 14:00',
            roomNo: '105',
            roomType: 'Deluxe',
            bookingSource: 'Online',
        },
    ]);
    console.log(guest);
    const [transactions] = useState([
        {
            id: 'Beer',
            dateTime: '01/12/2024 10AM',
            description: 'Mini-Bar Charge',
            amount: 15.0,
            paymentMethod: 'Credit Card',
        },
        {
            id: 'Snacks',
            dateTime: '01/15/2024 11AM',
            description: 'Room Payment',
            amount: 450.0,
            paymentMethod: 'Cash',
        },
    ]);

    const [servicesUsed] = useState([
        {
            serviceName: 'Laundry',
            dateUsed: '01/12/2024 10AM',
            amount: 15.0,
            status: 'Completed',
        },
        {
            serviceName: 'Snacks',
            dateUsed: '01/15/2024 11AM',
            amount: 450.0,
            status: 'Completed',
        },
    ]);

    const [notes] = useState([
        {
            serviceName: 'Laundry',
            dateUsed: '21 Jan 2025',
            description: '',
        },
        {
            serviceName: 'Snacks',
            dateUsed: '21 Jan 2025',
            description: '',
        },
    ]);

    return (
        <div className="space-y-6 bg-white p-6">
            {/* Stay History */}
            <div>
                <h3 className="mb-4 text-center font-semibold">Stay History</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b text-sm">
                            <th className="border px-4 py-2 text-left">
                                Stay ID
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Check-In Date & Time
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Check-Out Date & Time
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Room No.
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Room Type
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Booking Source
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stayHistory.map((stay) => (
                            <tr key={stay.stayId} className="border-b text-sm">
                                <td className="border px-4 py-2">
                                    {stay.stayId}
                                </td>
                                <td className="border px-4 py-2">
                                    {stay.checkIn}
                                </td>
                                <td className="border px-4 py-2">
                                    {stay.checkOut}
                                </td>
                                <td className="border px-4 py-2">
                                    {stay.roomNo}
                                </td>
                                <td className="border px-4 py-2">
                                    {stay.roomType}
                                </td>
                                <td className="border px-4 py-2">
                                    {stay.bookingSource}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Transaction History */}
            <div>
                <h3 className="mb-4 text-center font-semibold">
                    Transaction History
                </h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b text-sm">
                            <th className="border px-4 py-2 text-left">
                                Transaction ID
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Date/Time
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Description
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Amount
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Payment Method
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr
                                key={transaction.id}
                                className="border-b text-sm"
                            >
                                <td className="border px-4 py-2">
                                    {transaction.id}
                                </td>
                                <td className="border px-4 py-2">
                                    {transaction.dateTime}
                                </td>
                                <td className="border px-4 py-2">
                                    {transaction.description}
                                </td>
                                <td className="border px-4 py-2">
                                    ${transaction.amount.toFixed(2)}
                                </td>
                                <td className="border px-4 py-2">
                                    {transaction.paymentMethod}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Services Used */}
            <div>
                <h3 className="mb-4 text-center font-semibold">
                    Services Used
                </h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b text-sm">
                            <th className="border px-4 py-2 text-left">
                                Service Name
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Date Used
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Amount
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicesUsed.map((service, index) => (
                            <tr key={index} className="border-b text-sm">
                                <td className="border px-4 py-2">
                                    {service.serviceName}
                                </td>
                                <td className="border px-4 py-2">
                                    {service.dateUsed}
                                </td>
                                <td className="border px-4 py-2">
                                    ${service.amount.toFixed(2)}
                                </td>
                                <td className="border px-4 py-2">
                                    <span className="inline-flex items-center gap-1 text-green-600">
                                        <FaCheck size={12} />
                                        {service.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Notes */}
            <div>
                <h3 className="mb-4 text-center font-semibold">Notes</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b text-sm">
                            <th className="border px-4 py-2 text-left">
                                Service Name
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Date Used
                            </th>
                            <th className="border px-4 py-2 text-left">
                                Description
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.map((note, index) => (
                            <tr key={index} className="border-b text-sm">
                                <td className="border px-4 py-2">
                                    {note.serviceName}
                                </td>
                                <td className="border px-4 py-2">
                                    {note.dateUsed}
                                </td>
                                <td className="border px-4 py-2">
                                    {note.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
