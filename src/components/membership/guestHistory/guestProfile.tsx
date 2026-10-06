'use client';

import { ArrowLeft, XCircle } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import React, { useState } from 'react';
import { Divider } from '../divider';
import FileUploader from '../fileUploader';
import BookingHistoryTable from './bookingHistoryTable';
import PurchasesTable from './purchaseTable';
import ServiceUsageTable from './serviceUsageTable';
import { GuestProfileProps } from './types';
import LogsTable from './visitLogs';

const GuestProfile: React.FC<GuestProfileProps> = ({ member_id }) => {
    const member = {
        fullName: 'Jane Okoro',
        email: 'jane.okoro@email.com',
        phone: '09031234567',
        dateOfBirth: 'April 5, 1992',
        memberId: 'MEM-0001',
        startDate: 'Jan 13, 2022',
        plan: 'Silver',
        qrCode: '/qrcode.svg',
        status: 'Active',
        membershipStart: 'Jan 13, 2024',
        membershipEnd: 'Jan 13, 2025',
        registeredBy: 'Goodness (membership mgr)',
    };

    const router = useRouter();
    const [showModal, setShowModal] = useState(true);

    const handleRedirect = () => router.push('/membership/guest-history');

    return (
        <div className="flex-1 bg-white">
            <button
                onClick={handleRedirect}
                className="text-[#263238] text-md font-semibold flex items-center gap-2 mb-4 cursor-pointer"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            {/* Header Section */}
            <div className="py-6 gap-4">
                <div className="flex flex-row gap-5 items-center">
                    <div className="sm:w-[160px] sm:h-[168px] content-center">
                        <FileUploader
                            label="Upload logo"
                            hideLabel={true}
                            onFileChange={() => null}
                        />
                    </div>
                    <div className="flex-1 flex justify-between">
                        <div>
                            <p className="text-4xl font-semibold text-gray-800">
                                {member.fullName}
                            </p>
                            <p> jane.okoro@email.com</p>
                        </div>
                        <div>
                            <p className="flex items-center gap-2">
                                <span className="text-gray-500">
                                    Membership Status:
                                </span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                    Active
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Membership Details */}
            <div className="bg-white border border-[#D6D6D6] rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-semibold">
                        Membership Details
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm text-gray-700">
                    <div>
                        <strong>Membership Plan:</strong>
                        <span className="ml-2 text-[#3538CD] bg-[#EEF4FF] px-2 py-0.5 rounded-xl text-sm font-medium">
                            {member.plan}
                        </span>
                    </div>
                    <div>
                        <strong>Start Date:</strong> {member.membershipStart}
                    </div>
                    <div>
                        <strong>End Date:</strong> {member.membershipEnd}
                    </div>
                    <div className="col-span-full">
                        {/* <ReferralTable /> */}
                    </div>
                </div>
            </div>

            {/* Purchases List */}
            <div className="bg-white border border-[#D6D6D6] rounded-xl px-6  mb-6">
                <PurchasesTable memberId={member_id as string} />
            </div>

            {/* Visit Logs */}
            <div className="bg-white border border-[#D6D6D6] rounded-xl px-6  mb-6">
                <LogsTable memberId={member_id as string} />
            </div>

            {/* Service Usage Summary */}
            <div className="bg-white border border-[#D6D6D6] rounded-xl px-6  mb-6">
                <ServiceUsageTable memberId={member_id as string} />
            </div>

            {/* Booking History */}
            <div className="bg-white border border-[#D6D6D6] rounded-xl px-6  mb-6">
                <BookingHistoryTable />
            </div>

            {showModal ? (
                <RenewalModal onClose={() => setShowModal(!showModal)} />
            ) : null}
        </div>
    );
};

export default GuestProfile;

const RenewalModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 ">
            <div className="w-full max-w-xl bg-white overflow-hidden shadow-lg rounded-xl">
                {/* Header */}
                <div className="px-6 mt-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-md font-normal">
                            Renew Membership
                        </h2>
                        <button className="cursor-pointer" onClick={onClose}>
                            <XCircle className="text-[#8C4906]" />
                        </button>
                    </div>
                    <Divider className="mt-3" />
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#111111] mb-1">
                                New Expiry Date
                            </label>
                            <input
                                type="date"
                                placeholder="Enter user name"
                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-md placeholder:font-normal"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#111111] mb-1">
                                Membership Plan
                            </label>
                            <select
                                className="w-full border text-sm border-gray-300 rounded-md px-4 py-4"
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select membership plan
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#111111] mb-1">
                                Reason for change (optional)
                            </label>
                            <input
                                type="text"
                                placeholder="Internal notes (e.g., loyalty upgrade)"
                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-md placeholder:font-normal"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#111111] mb-1">
                                Date of birth
                            </label>
                            <input
                                type="date"
                                placeholder="Enter user name"
                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-md placeholder:font-normal"
                            />
                        </div>
                        <div>
                            <FileUploader
                                label="File upload (Eg passport or any accepted ID) optional"
                                onFileChange={() => null}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#007BFF] hover:bg-blue-600 text-white py-3 rounded-md font-medium"
                        >
                            Submit Renewal
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
