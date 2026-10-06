import Link from 'next/link';
import {
    MdAssessment,
    MdAssignmentTurnedIn,
    MdInventory,
    MdOutlineInventory2,
    MdReceiptLong,
} from 'react-icons/md';
import { RxDashboard } from 'react-icons/rx';

function Inventory({
    expandedDropdown,
    toggleDropdown,
    headerStyles,
    linkStyles,
}: any) {
    return (
        <div className="flex flex-col mt-6">
            <Link shallow href="?stock=dashboard">
                <button
                    onClick={() => toggleDropdown('stock')}
                    className={headerStyles('stock')}
                >
                    <MdOutlineInventory2 className="w-5 h-5" />
                    <span className="font-semibold text-lg">Stock</span>
                </button>
            </Link>

            {expandedDropdown === 'stock' && (
                <nav className="ml-6 px-3 space-y-1 text-sm border-l-2 border-gray-100">
                    <Link
                        shallow
                        href="?stock=dashboard"
                        className={`${linkStyles('dashboard')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <RxDashboard className="inline w-4 h-4 mr-2" />
                        Dashboard
                    </Link>
                    <Link
                        shallow
                        href="?stock=items"
                        className={`${linkStyles('items')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdInventory className="inline w-4 h-4 mr-2" />
                        Items
                    </Link>
                    <Link
                        shallow
                        href="?stock=issued-stock"
                        className={`${linkStyles('issued-stock')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdAssignmentTurnedIn className="inline w-4 h-4 mr-2" />
                        Issued Stock
                    </Link>
                    <Link
                        shallow
                        href="?stock=goods-received"
                        className={`${linkStyles('goods-received')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdReceiptLong className="inline w-4 h-4 mr-2" />
                        Goods Received Note
                    </Link>

                    <Link
                        shallow
                        href="?stock=reports"
                        className={`${linkStyles('reports')} flex items-center whitespace-nowrap text-[12px]`}
                    >
                        <MdAssessment className="inline w-4 h-4 mr-2" />
                        Reports
                    </Link>
                </nav>
            )}
        </div>
    );
}

export default Inventory;
