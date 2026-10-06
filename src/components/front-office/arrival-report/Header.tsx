'use client';

import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import SearchInput from '@/components/reservations/common/SearchInput';

const Header = () => {
    return (
        <header className="sticky top-0 flex justify-between items-center px-9 pt-8 pb-5 border-b bg-white z-20">
            <PageHeader>
                <div className="flex items-center">
                    <PageHeadertitle
                        title="Arrival Report"
                        subtitle="See all arrivals"
                    />
                    <div className="ml-auto flex items-center">
                        <SearchInput />
                        <NotificationsPopover />
                    </div>
                </div>
            </PageHeader>
        </header>
    );
};

export default Header;
