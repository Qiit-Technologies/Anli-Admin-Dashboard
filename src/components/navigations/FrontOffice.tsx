import Link from 'next/link';
import { FaBed, FaRegFolder, FaUserFriends } from 'react-icons/fa';
import { IoBusinessOutline } from 'react-icons/io5';
import { LiaBedSolid } from 'react-icons/lia';
import { MdEventAvailable, MdMeetingRoom } from 'react-icons/md';
import { RxDashboard } from 'react-icons/rx';

export default function FrontOffice({
    expandedDropdown,
    toggleDropdown,
    headerStyles,
    linkStyles,
}: any) {
    return (
        <div className="flex flex-col mt-6">
            <Link shallow href="?frontoffice=dashboard">
                <button
                    onClick={() => toggleDropdown('frontoffice')}
                    className={headerStyles('frontoffice')}
                >
                    <IoBusinessOutline className="w-4 h-4" />
                    <span className="font-semibold text-lg">Front Office</span>
                </button>
            </Link>

            {/* Dropdown Items */}
            {expandedDropdown === 'frontoffice' && (
                <nav className="ml-6 px-3 space-y-1 text-sm border-l-2 border-gray-100">
                    <Link
                        shallow
                        href="?frontoffice=dashboard"
                        className={`${linkStyles('dashboard')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <RxDashboard className="inline w-4 h-4 mr-2" />
                        Dashboard
                    </Link>

                    <Link
                        shallow
                        href="?frontoffice=stay-view"
                        className={`${linkStyles('stay-view')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <LiaBedSolid className="inline w-4 h-4 mr-2" />
                        Stay View
                    </Link>

                    <Link
                        shallow
                        href="?frontoffice=guest"
                        className={`${linkStyles('guest')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <FaUserFriends className="inline w-4 h-4 mr-2" />
                        Guest Management
                    </Link>

                    <Link
                        shallow
                        href="?frontoffice=reservations"
                        className={`${linkStyles('reservationList')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdEventAvailable className="inline w-4 h-4 mr-2" />
                        Reservations
                    </Link>

                    <Link
                        shallow
                        href="?frontoffice=room-system"
                        className={`${linkStyles('room-system')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <FaBed className="inline w-4 h-4 mr-2" />
                        Room Management
                    </Link>

                    <Link
                        shallow
                        href="?frontoffice=reports"
                        className={`${linkStyles('reports')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <FaRegFolder className="inline w-4 h-4 mr-2" />
                        Reports
                    </Link>

                    <Link
                        shallow
                        href="?frontoffice=check-ins"
                        className={`${linkStyles('check-ins')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdMeetingRoom className="inline w-4 h-4 mr-2" />
                        Check ins, out
                    </Link>
                </nav>
            )}
        </div>
    );
}
