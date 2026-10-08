import Link from 'next/link';
import {
    MdOutlineCleaningServices,
    MdHotel,
    MdBuild,
    MdStore,
} from 'react-icons/md';
import { FaBroom, FaBoxOpen, FaTasks } from 'react-icons/fa';
import { RxDashboard } from 'react-icons/rx';
import { FaRegFolder } from 'react-icons/fa6';

export default function HouseKeeping({
    expandedDropdown,
    toggleDropdown,
    headerStyles,
    linkStyles,
}: any) {
    return (
        <div className="flex flex-col mt-6">
            <Link shallow href="?housekeeping=dashboard">
                <button
                    onClick={() => toggleDropdown('housekeeping')}
                    className={headerStyles('housekeeping')}
                >
                    <MdOutlineCleaningServices className="w-5 h-5" />
                    <span className="font-semibold text-lg">House Keeping</span>
                </button>
            </Link>

            {/* Dropdown Items */}
            {expandedDropdown === 'housekeeping' && (
                <nav className="ml-6 px-3 space-y-1 text-sm border-l-2 border-gray-100">
                    <Link
                        shallow
                        href="?housekeeping=dashboard"
                        className={`${linkStyles('dashboard')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <RxDashboard className="inline w-4 h-4 mr-2" />
                        Dashboard
                    </Link>

                    <Link
                        shallow
                        href="?housekeeping=room-status"
                        className={`${linkStyles('room-status')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdHotel className="inline w-4 h-4 mr-2" />
                        Room Status
                    </Link>

                    <Link
                        shallow
                        href="?housekeeping=cleaning-requests"
                        className={`${linkStyles('cleaning-requests')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <FaBroom className="inline w-4 h-4 mr-2" />
                        Cleaning Requests
                    </Link>

                    <Link
                        shallow
                        href="?housekeeping=inventory"
                        className={`${linkStyles('inventory')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdStore className="inline w-4 h-4 mr-2" />
                        Inventory
                    </Link>

                    <Link
                        shallow
                        href="?housekeeping=maintenance"
                        className={`${linkStyles('maintenance')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdBuild className="inline w-4 h-4 mr-2" />
                        Maintenance
                    </Link>

                    <Link
                        shallow
                        href="?housekeeping=lost-items"
                        className={`${linkStyles('lost-items')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <FaBoxOpen className="inline w-4 h-4 mr-2" />
                        Lost Items
                    </Link>

                    <Link
                        shallow
                        href="?housekeeping=daily-task"
                        className={`${linkStyles('daily-task')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <FaTasks className="inline w-4 h-4 mr-2" />
                        Daily Task List
                    </Link>

                    <Link
                        shallow
                        href="?housekeeping=reports"
                        className={`${linkStyles('reports')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <FaRegFolder className="inline w-4 h-4 mr-2" />
                        Reports
                    </Link>
                </nav>
            )}
        </div>
    );
}
