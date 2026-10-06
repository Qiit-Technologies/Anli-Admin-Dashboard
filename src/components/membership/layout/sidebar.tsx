'use client';

import React from 'react';
import {
    LayoutDashboard,
    UserPlus,
    Users,
    X,
    Settings,
    LogOut,
    BookIcon,
    FileClock,
    Bell,
    BarChart3,
    Hexagon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import Logo from '@/components/common/Logo';

const Sidebar = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
}) => {
    const pathname = usePathname(); // make sure this is imported

    const navItems = [
        {
            name: 'Dashboard',
            href: '/membership/dashboard',
            icon: LayoutDashboard,
        },
        { name: 'Member Directory', href: '/membership/members', icon: Users },
        {
            name: 'Referrals',
            href: '/membership/referrals',
            icon: UserPlus,
        },
        {
            name: 'Guest History',
            href: '/membership/guest-history',
            icon: FileClock,
        },
        { name: 'Bookings', href: '/membership/bookings', icon: BookIcon },
        { name: 'Alerts', href: '/membership/alerts', icon: Bell },
        { name: 'Reports', href: '/membership/reports', icon: BarChart3 },
    ];

    const footerItems = [
        { name: 'Support', href: '/membership/support', icon: Hexagon },
        { name: 'Settings', href: '/membership/Settings', icon: Settings },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-opacity-50 sm:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed sm:static inset-y-0 left-0 bg-white text-white z-50 sm:z-auto transition-transform transform sm:translate-x-0 border border-[#E7E7E7] ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-full sm:w-[280px] px-4 py-6 flex flex-col justify-between`}
            >
                <div>
                    <div className="flex relative justify-center items-center mb-12">
                        <Logo />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-0 text-white sm:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-4">
                        {navItems.map(({ name, icon: Icon, href }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={name}
                                    href={href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex text-[#344054] items-center gap-3 text-base font-medium transition-all duration-200 ease-in-out py-[13px] px-3 rounded-md ${
                                        isActive
                                            ? 'bg-[#FDEFE5] text-[#FF6F00]'
                                            : 'hover:bg-[#FDEFE5] hover:text-[#FF6F00]'
                                    }`}
                                >
                                    <Icon size={24} />
                                    {name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Section */}
                <div className="space-y-6 mt-10">
                    {/* Support & Settings */}
                    <div className="flex flex-col gap-2 text-sm text-[#344054]">
                        <nav className="space-y-4">
                            {footerItems.map(({ name, icon: Icon, href }) => {
                                const isActive = pathname === href;
                                return (
                                    <Link
                                        key={name}
                                        href={href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex text-[#344054] items-center gap-3 text-base font-medium transition-all duration-200 ease-in-out py-[13px] px-3 rounded-md ${
                                            isActive
                                                ? 'bg-[#FDEFE5] text-[#FF6F00]'
                                                : 'hover:bg-[#FDEFE5] hover:text-[#FF6F00]'
                                        }`}
                                    >
                                        <Icon size={24} />
                                        {name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    {/* Profile */}
                    <div className="mt-6 border-t border-[#EAECF0] pt-4">
                        <div className="flex flex-row gap-3 items-center justify-between">
                            {/* Avatar with initials */}
                            <div className="flex flex-row gap-4 ">
                                <div className="relative">
                                    <div className="flex justify-center items-center w-10 h-10 font-bold text-orange-500 bg-orange-100 rounded-full">
                                        {getInitials('Octagon')}
                                    </div>
                                    <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                </div>

                                {/* Name and email */}
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-[#344054]">
                                        Octagon
                                    </p>
                                    <p className="text-sm font-normal text-[#667085] break-words">
                                        IHate@you.com
                                    </p>
                                </div>
                            </div>
                            {/* Logout button */}
                            <button className="cursor-pointer text-sm text-[#667085]">
                                <LogOut size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
