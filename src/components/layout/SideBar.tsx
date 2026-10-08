'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import clsx from 'clsx';
import { useSidebarCollapseStore } from '@/store/useSidebarCollapseStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdminNavButton from '../admin/common/AdminNavButton';
import Logo from '../common/Logo';
import FrontOffice from '../navigations/FrontOffice';
import Profile from '../navigations/Profile';
import { Tooltip } from '@heroui/react';

const Sidebar: React.FC<{ role: string }> = ({ role }: { role: string }) => {
    const searchParams = useSearchParams();
    const firstEntry = Array.from(searchParams.entries())[0];
    const firstKey = firstEntry ? firstEntry[0] : 'main';

    const [expandedDropdown, setExpandedDropdown] = useState<string>(firstKey);

    const { isCollapsed, toggleCollapse } = useSidebarCollapseStore();

    const linkStyles = (path: string) =>
        query === path || expandedDropdown.includes(path)
            ? 'block text-orange-500 font-medium bg-orange-50 p-2 rounded-md transition duration-300 ease-in-out'
            : 'block text-gray-400 py-2 hover:text-orange-500 hover:translate-x-1 transition duration-300 ease-in-out';

    const headerStyles = (path: string) =>
        expandedDropdown === path
            ? 'flex items-center px-4 pb-2 gap-2 text-orange-500 cursor-pointer transition duration-300 ease-in-out'
            : 'flex items-center px-4 pb-2 gap-2 text-gray-400 cursor-pointer transition duration-300 ease-in-out';
    const query = searchParams.get(expandedDropdown);

    const toggleDropdown = (menu: string) => {
        setExpandedDropdown(menu);
    };

    return (
        <>
            <aside className={clsx('h-screen relative bg-white border-r flex flex-col transition-all duration-300', isCollapsed ? 'w-0 overflow-hidden p-0 min-w-0' : 'w-52 overflow-hidden px-3 py-2')}>
                <div>
                    <div
                        id="logo"
                        className="flex items-center justify-center border-b"
                        style={{ height: 'var(--header-height)' }}
                    >
                        <Logo role={role} />
                        <Tooltip content={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
                            <button
                                onClick={toggleCollapse}
                                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors absolute left-1 top-1"
                                aria-label="Toggle sidebar"
                            >
                                {isCollapsed ? (
                                    <ChevronRight size={18} />
                                ) : (
                                    <ChevronLeft size={18} />
                                )}
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* <MainPage
                        expandedDropdown={expandedDropdown}
                        toggleDropdown={toggleDropdown}
                        headerStyles={headerStyles}
                        linkStyles={linkStyles}
                    /> */}
                    {(role === 'manager' ||
                        role === 'administrator' ||
                        role === 'general manager' ||
                        role === 'supervisor' ||
                        role === 'frontoffice') && (
                            <FrontOffice
                                expandedDropdown={expandedDropdown}
                                toggleDropdown={toggleDropdown}
                                headerStyles={headerStyles}
                                linkStyles={linkStyles}
                            />
                        )}
                    {/* {(role === 'manager' || role === 'housekeeping') && (
                        <HouseKeeping
                            expandedDropdown={expandedDropdown}
                            toggleDropdown={toggleDropdown}
                            headerStyles={headerStyles}
                            linkStyles={linkStyles}
                        />
                    )} */}
                    {/* {(role === 'manager' || role === 'stock') && (
                        <Inventory
                            expandedDropdown={expandedDropdown}
                            toggleDropdown={toggleDropdown}
                            headerStyles={headerStyles}
                            linkStyles={linkStyles}
                        />
                    )} */}
                    {/* {(role === 'manager' || role === 'staffing') && (
                        <Staffing
                            expandedDropdown={expandedDropdown}
                            toggleDropdown={toggleDropdown}
                            headerStyles={headerStyles}
                            linkStyles={linkStyles}
                        />
                    )} */}
                    {/* {(role === 'manager' || role === 'kitchen') && (
                        <Kitchen
                            expandedDropdown={expandedDropdown}
                            toggleDropdown={toggleDropdown}
                            headerStyles={headerStyles}
                            linkStyles={linkStyles}
                        />
                    )} */}
                    {/* {(role === 'manager' || role === 'restaurant') && (
                        <Restaurant
                            expandedDropdown={expandedDropdown}
                            toggleDropdown={toggleDropdown}
                            headerStyles={headerStyles}
                            linkStyles={linkStyles}
                        />
                    )} */}
                    <Profile
                        expandedDropdown={expandedDropdown}
                        toggleDropdown={toggleDropdown}
                        headerStyles={headerStyles}
                        linkStyles={linkStyles}
                    />
                </div>

                {/* Logout Section */}
                <div className="mb-4 px-1">
                    <Link
                        href="/logout"
                        className="flex items-center gap-2 text-red-500 font-medium hover:opacity-80 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15M9 15l6-6m0 0l-6-6m6 6H3"
                            />
                        </svg>
                        <span>Log out</span>
                    </Link>
                </div>
                <div className="px-1">
                    <AdminNavButton role={role} />
                </div>
            </aside>
            {isCollapsed && (
                <Tooltip content="Expand sidebar" placement="right">
                    <button
                        onClick={toggleCollapse}
                        className="hidden md:flex fixed top-1/2 -translate-y-1/2 left-0 z-40 h-12 w-5 items-center justify-center bg-gray-200 border border-r-0 rounded-r-md hover:bg-gray-300 transition-colors"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRight size={14} />
                    </button>
                </Tooltip>
            )}
        </>
    );
};

export default Sidebar;
