'use client';

// import { Loader2, Menu, Settings, X } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { useUser } from '@/context/useUser';
// import { getInitials } from '@/lib/utils';
// import Link from 'next/link';
import SearchInput from '@/components/reservations/common/SearchInput';
import Notification from '../common/Notification';
import { usePathname } from 'next/navigation';

import { useReservationSearch } from '@/context/ReservationSearchContext';

const Header = () => {
    const { searchTerm, setSearchTerm } = useReservationSearch();

    const pathname = usePathname();

    return (
        <header className="sticky top-0 flex justify-between items-center px-9 pt-8 pb-5 border-b bg-white z-20">
            {/* Search */}
            {pathname === '/reservations/menu' ? (
                <div className="flex flex-col">
                    <h2 className="text-[24px] text-[#455A64] font-medium">
                        Reservation Menu
                    </h2>
                    <p className="text-sm text-[#8B9195] font-normal">
                        All details about the reservation
                    </p>
                </div>
            ) : (
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, ID or phone"
                />
            )}

            <Notification />
        </header>
    );
};

export default Header;
