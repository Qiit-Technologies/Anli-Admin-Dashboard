import Link from 'next/link';
import { FaCog } from 'react-icons/fa';

function Profile({
    expandedDropdown,
    toggleDropdown,
    headerStyles,
    linkStyles,
}: {
    expandedDropdown: string;
    toggleDropdown: (section: string) => void;
    headerStyles: (section: string) => string;
    linkStyles: (section: string) => string;
}) {
    return (
        <div className="flex flex-col mt-6">
            <Link shallow href="?profile=settings">
                <button
                    onClick={() => toggleDropdown('profile')}
                    className={headerStyles('profile')}
                >
                    <FaCog className="w-5 h-5" />
                    <span className="font-semibold text-lg">Settings</span>
                </button>
            </Link>

            {expandedDropdown === 'profile' && (
                <nav className="ml-6 px-3 space-y-1 text-sm border-l-2 border-gray-100">
                    <Link
                        shallow
                        href="?profile=settings"
                        className={`${linkStyles('settings')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        Staffing
                    </Link>
                </nav>
            )}
        </div>
    );
}

export default Profile;
