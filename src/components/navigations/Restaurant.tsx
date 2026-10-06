import Link from 'next/link';
import { IoRestaurant } from 'react-icons/io5';

function Restaurant({
    expandedDropdown,
    toggleDropdown,
    headerStyles,
    linkStyles,
}: any) {
    return (
        <div className="flex flex-col mt-6">
            <Link shallow href="?restaurant=main">
                <button
                    onClick={() => toggleDropdown('restaurant')}
                    className={headerStyles('restaurant')}
                >
                    <IoRestaurant className="w-5 h-5" />
                    <span className="font-semibold text-lg">Restaurant</span>
                </button>
            </Link>

            {/* Dropdown Items */}
            {expandedDropdown === 'restaurant' && (
                <nav className="ml-6 px-3 space-y-1 text-sm border-l-2 border-gray-100">
                    <Link
                        shallow
                        href="?restaurant=main"
                        className={linkStyles('main')}
                    >
                        Main
                    </Link>
                </nav>
            )}
        </div>
    );
}

export default Restaurant;
