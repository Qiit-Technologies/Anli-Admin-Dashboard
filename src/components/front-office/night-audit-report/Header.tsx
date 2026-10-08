'use client';

import SearchInput from '@/components/reservations/common/SearchInput';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';

const Header = () => {
    return (
        <header className="sticky top-0 flex justify-between items-center px-9 pt-8 pb-5 border-b bg-white z-20">
            <PageHeader>
                <div className="flex items-center">
                    <PageHeadertitle
                        title="Night Audit Reports"
                        subtitle="See all activities carried out"
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
