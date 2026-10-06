import Link from 'next/link';
import { MdOutlineSpaceDashboard } from 'react-icons/md';

function MainPage({
    expandedDropdown,
    toggleDropdown,
    headerStyles,
    linkStyles,
}: any) {
    return (
        <div className="flex flex-col mt-6">
            <Link shallow href="?main=dashboard">
                <button
                    onClick={() => toggleDropdown('main')}
                    className={headerStyles('main')}
                >
                    <MdOutlineSpaceDashboard className="w-5 h-5" />
                    <span className="font-semibold text-lg">Dashboard</span>
                </button>
            </Link>
            {/* Dropdown Items */}
            {expandedDropdown === 'main' && (
                <nav className="ml-6 px-3 space-y-1 text-sm border-l-2 border-gray-100">
                    <Link
                        shallow
                        href="?main=dashboard"
                        className={linkStyles('dashboard')}
                    >
                        Dashboard
                    </Link>
                </nav>
            )}
        </div>
    );
}

export default MainPage;
