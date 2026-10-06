import { getNights } from '@/lib/helpers';
import { GuestProps } from '@/types';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import {
    FaBookOpen,
    FaBuilding,
    FaCalendar,
    FaClock,
    FaEnvelope,
    FaMapPin,
    FaPhone,
    FaUsers,
} from 'react-icons/fa';

const GuestInfoPage = ({ guest }: GuestProps) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <main className="px-2">
                <div className="space-y-6">
                    {/* Guest Profile Section */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="col-span-2 space-y-6">
                            {/* Guest Header */}
                            <div className="border p-4 flex items-center gap-4 bg-white">
                                <div className="h-16 w-16 bg-gray-200 flex items-center justify-center rounded-full">
                                    <span className="text-xl font-semibold">
                                        {guest.fullName
                                            .split(' ')
                                            .map((word: any) =>
                                                word.charAt(0).toUpperCase(),
                                            )
                                            .join('')}{' '}
                                        {/* Example: First letter of name */}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">
                                        {guest.fullName}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <FaMapPin className="mr-1" />
                                        Nigeria
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="border px-4 py-2">
                                        Wake-Up Call
                                    </button>
                                    <PermissionGate
                                        blockType="modal"
                                        permissions={[PERMISSIONS.SETTLE_BILL]}
                                    >
                                        <button className="border px-4 py-2">
                                            Settle Payments
                                        </button>
                                    </PermissionGate>
                                    <button className="border px-4 py-2">
                                        Transfer Room
                                    </button>
                                </div>
                            </div>

                            {/* Guest Details */}
                            <div className="grid gap-6 md:grid-cols-2 bg-white">
                                {/* Guest Info */}
                                <div className="border p-4">
                                    <h3 className="text-lg font-semibold">
                                        Guest Info
                                    </h3>
                                    <div className="space-y-8 mt-4">
                                        <div className="flex items-center gap-2">
                                            <FaEnvelope />
                                            <span className="font-bold">
                                                {' '}
                                                Email:
                                            </span>
                                            <span>{guest.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaPhone />{' '}
                                            <span className="font-bold whitespace-nowrap">
                                                {' '}
                                                Phone No:
                                            </span>
                                            <span className="whitespace-nowrap">
                                                {guest.phoneNumber
                                                    ? guest.phoneNumber
                                                    : 'No phone number'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaMapPin />
                                            <span className="font-bold">
                                                {' '}
                                                Country:
                                            </span>
                                            <span>Nigeria</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaBookOpen />
                                            <span className="font-bold">
                                                {' '}
                                                Reservation No:
                                            </span>
                                            <span>{guest.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaBuilding />
                                            <span className="font-bold">
                                                {' '}
                                                Booking method:
                                            </span>
                                            <span>Anli</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Stay Info */}
                                <div className="border p-4 h-[500px]">
                                    <h3 className="text-lg font-semibold">
                                        Current Stay Info
                                    </h3>
                                    <div className="space-y-8 mt-4">
                                        <div className="flex items-center gap-2">
                                            <FaCalendar />
                                            <span className="font-bold">
                                                {' '}
                                                Check-In:
                                            </span>
                                            <span>
                                                {new Date(
                                                    guest.startDate,
                                                ).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                                , {guest.startTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaCalendar />
                                            <span className="font-bold">
                                                {' '}
                                                Check-Out:
                                            </span>
                                            <span>
                                                {new Date(
                                                    guest.endDate,
                                                ).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}{' '}
                                                , {guest.endTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaBuilding />
                                            <span className="font-bold">
                                                {' '}
                                                Room No:
                                            </span>
                                            <span>{guest?.roomNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaUsers />
                                            <span className="font-bold">
                                                {' '}
                                                No of Guests:
                                            </span>
                                            <span>{guest?.numberOfGuests}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaClock />
                                            <span className="font-bold">
                                                {' '}
                                                No of Nights:
                                            </span>
                                            <span>
                                                {getNights(
                                                    guest.startDate.toString(),
                                                    guest.endDate.toString(),
                                                )}{' '}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="grid grid-row-2 gap-6">
                            {/* Financial Summary */}
                            <div className="border rounded-lg shadow p-4 bg-white">
                                <h3 className="text-lg font-semibold border-b pb-2">
                                    Financial Summary
                                </h3>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Amount
                                        </p>
                                        <p className="text-xl font-semibold">
                                            ₦
                                            {guest.amountPaid +
                                                guest.outstanding}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Paid
                                        </p>
                                        <p className="text-xl font-semibold">
                                            ₦{guest.amountPaid}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Balance
                                        </p>
                                        <p className="text-xl font-semibold">
                                            ₦{guest.outstanding}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Guest Status */}
                            <div className="border rounded-lg shadow p-4 bg-white">
                                <h3 className="text-lg font-semibold border-b pb-2">
                                    Guest Status
                                </h3>
                                <div className="grid gap-3 mt-3">
                                    {guest?.statuses?.map(
                                        (status: any, index: any) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between border-b pb-2 last:border-b-0"
                                            >
                                                <span>{status}</span>
                                                {status === 'VIP Guest' ? (
                                                    <span className="px-2 py-1 text-sm font-semibold text-white bg-gray-700 rounded">
                                                        ✓
                                                    </span>
                                                ) : (
                                                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                                                        +
                                                    </button>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GuestInfoPage;
