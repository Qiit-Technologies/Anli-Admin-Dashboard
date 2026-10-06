import Link from 'next/link';
import { MdOutlineWork, MdPeopleOutline } from 'react-icons/md';
import { RxDashboard } from 'react-icons/rx';

function Staffing({
    expandedDropdown,
    toggleDropdown,
    headerStyles,
    linkStyles,
}: any) {
    return (
        <div className="flex flex-col mt-6">
            <Link shallow href="?staffing=dashboard">
                <button
                    onClick={() => toggleDropdown('staffing')}
                    className={headerStyles('staffing')}
                >
                    <MdPeopleOutline className="w-5 h-5" />
                    <span className="font-semibold text-lg">Staffing</span>
                </button>
            </Link>

            {/* Dropdown Items */}
            {expandedDropdown === 'staffing' && (
                <nav className="ml-6 px-3 space-y-1 text-sm border-l-2 border-gray-100">
                    <Link
                        shallow
                        href="?staffing=dashboard"
                        className={`${linkStyles('stoverview')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <RxDashboard className="inline w-4 h-4 mr-2" />
                        Overview
                    </Link>
                </nav>
            )}
            {expandedDropdown === 'staffing' && (
                <nav className="ml-6 px-3 space-y-1 text-sm border-l-2 border-gray-100">
                    <Link
                        shallow
                        href="?staffing=managerole"
                        className={`${linkStyles('managerole')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdOutlineWork className="inline w-4 h-4 mr-2" />
                        Manage Role
                    </Link>
                </nav>
            )}
        </div>
    );
}

export default Staffing;
