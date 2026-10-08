import Link from 'next/link';
import { MdOutlineKitchen } from 'react-icons/md';

function Kitchen({
    expandedDropdown,
    toggleDropdown,
    headerStyles,
    linkStyles,
}: any) {
    return (
        <div className="flex flex-col mt-6">
            <Link shallow href="?kitchen=inventory">
                <button
                    onClick={() => toggleDropdown('kitchen')}
                    className={headerStyles('kitchen')}
                >
                    <MdOutlineKitchen className="w-5 h-5" />
                    <span className="font-semibold text-lg">Kitchen</span>
                </button>
            </Link>
            {expandedDropdown === 'kitchen' && (
                <nav className="ml-6 px-3 space-y-1 text-sm border-l-2 border-gray-100">
                    <Link
                        shallow
                        href="?kitchen=inventory"
                        className={linkStyles('inventory')}
                    >
                        Inventory
                    </Link>
                </nav>
            )}
        </div>
    );
}

export default Kitchen;
