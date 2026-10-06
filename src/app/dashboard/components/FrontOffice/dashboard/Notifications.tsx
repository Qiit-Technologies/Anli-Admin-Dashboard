'use client';

import {
    BsChatDots,
    BsClipboardCheck,
    BsCreditCard2Back,
    BsCurrencyDollar,
    BsHandThumbsUp,
    BsListTask,
    BsPhone,
} from 'react-icons/bs';
import { IoBedOutline, IoCalendarClearOutline } from 'react-icons/io5';

export default function Notifications() {
    const notifications = [
        { icon: BsClipboardCheck, label: 'Work Order', count: 0 },
        { icon: IoCalendarClearOutline, label: 'Booking Inquiry', count: 0 },
        { icon: BsCurrencyDollar, label: 'Payment Failed', count: 0 },
        { icon: IoBedOutline, label: 'Overbooking', count: 0 },
        { icon: BsPhone, label: 'Guest Portal', count: 0 },
        { icon: BsChatDots, label: 'Guest Message', count: 0 },
        { icon: BsCreditCard2Back, label: 'Cardverify Failed', count: 0 },
        { icon: BsListTask, label: 'Tasks', count: 0 },
        { icon: BsHandThumbsUp, label: 'Review', count: 0 },
    ];

    return (
        <div className="max-w-2xl w-[700px] h-[350px] mx-auto p-6 overflow-auto bg-white shadow-md rounded-lg border border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Insights</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notifications.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0">
                            <item.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-semibold text-gray-900">
                                    {item.count}
                                </span>
                            </div>
                            <span className="text-[12px] text-gray-600 whitespace-nowrap">
                                {item.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
