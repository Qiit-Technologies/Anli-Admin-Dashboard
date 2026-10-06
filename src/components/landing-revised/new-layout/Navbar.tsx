'use client';
import Logo from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HoverPopover } from '../HoverPopOver';

interface navItem {
    label: string;
    href: string;
    icon?: string;
    description?: string;
    submenu?: navItem[];
}
const navItems: navItem[] = [
    {
        label: 'Home',
        href: '/',
    },
    {
        label: 'Restaurants',
        href: '/restaurants',
    },
    {
        label: 'Product',
        href: '/product',
    },
    // {
    //     label: 'Solution',
    //     href: '/solution',
    // },
    // {
    //     label: 'Services',
    //     submenu: [
    //         {
    //             label: 'House Keeping',
    //             icon: '/landing/cleaner-broom.svg',
    //             href: '#',
    //             description: 'Handle house keeping processes with ease.',
    //         },
    //         {
    //             label: 'Food & Beverage',
    //             icon: '/landing/food-beverage.svg',
    //             href: '#',
    //             description: 'Manage food and beverage services with ease.',
    //         },
    //         {
    //             label: 'Laundry',
    //             icon: '/landing/laundry.svg',
    //             href: '#',
    //             description: 'Manage laundry services with ease.',
    //         },
    //         {
    //             label: 'Security',
    //             icon: '/landing/security.svg',
    //             href: '#',
    //             description: 'Manage security services with ease.',
    //         },
    //     ],
    // },
    {
        label: 'About Us',
        href: '/new-about-us',
    },
    {
        label: 'Resources',
        href: '/new-resources',
    },
    {
        label: 'Events',
        href: '/events',
    },
    {
        label: 'Careers',
        href: '/careers',
    },
];

const LandingNavbar = () => {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => {
        // Handle root path specially
        if (path === '/') {
            return pathname === '/';
        }

        // Check if current path matches exactly or is a child route
        // Ensure we match complete path segments to avoid partial matches
        const normalizedPath = path.endsWith('/') ? path : `${path}/`;
        const normalizedPathname = pathname.endsWith('/')
            ? pathname
            : `${pathname}/`;

        return (
            pathname === path || normalizedPathname.startsWith(normalizedPath)
        );
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className="w-full flex items-center px-0 lg:px-24 z-50 justify-center inset-x-0 fixed top-0 lg:top-5">
            <div
                className={cn(
                    'shadow-md ring-1 hover:ring-hexbrand bg-white w-full rounded-none lg:rounded-xl py-3 px-5 flex items-center',
                    isScrolled ? 'ring-hexbrand' : 'ring-transparent',
                )}
            >
                <Logo />
                <div className="mx-auto hidden lg:block">
                    <nav className="flex items-center gap-4">
                        {navItems.map((item, index) => {
                            return (
                                <div key={index}>
                                    {item.submenu ? (
                                        <>
                                            <HoverPopover
                                                key={index}
                                                item={
                                                    item as {
                                                        label: string;
                                                        submenu: navItem[];
                                                    }
                                                }
                                            />
                                        </>
                                    ) : (
                                        <Link
                                            href={item.href || '#'}
                                            className={cn(
                                                'text-[#002955] text-[20px] font-medium leading-[24px]',
                                                pathname === item.href &&
                                                    'font-semibold',
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Mobile Menu */}
                <div className="ml-auto flex items-center gap-4 lg:hidden">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="lg:hidden"
                            >
                                <Menu className="h-6 w-6 text-hexbrand" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-transparent px-4 border-none overflow-auto max-h-[90vh]">
                            <DialogTitle className="sr-only">
                                Navigation Menu
                            </DialogTitle>
                            <div className="p-6 bg-white rounded-xl border-2 border-hexbrand">
                                <div className="flex items-center justify-between mb-6">
                                    <Logo />
                                </div>

                                <nav className="flex flex-col gap-6">
                                    {navItems.map((item, index) => {
                                        return (
                                            <div key={index}>
                                                {item.submenu ? (
                                                    <Collapsible className="w-full">
                                                        <CollapsibleTrigger className="flex w-full items-center justify-between text-gray-500 hover:text-hexbrand text-base font-medium">
                                                            {item.label}
                                                            <ChevronDown className="h-4 w-4" />
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent className="mt-2 ml-4 space-y-2">
                                                            {item.submenu.map(
                                                                (
                                                                    subItem,
                                                                    subIndex,
                                                                ) => (
                                                                    <Link
                                                                        key={
                                                                            subIndex
                                                                        }
                                                                        href={
                                                                            subItem.href ||
                                                                            '#'
                                                                        }
                                                                        className={cn(
                                                                            'block py-2 text-gray-500 hover:text-hexbrand',
                                                                            isActive(
                                                                                item.href,
                                                                            ) &&
                                                                                'text-hexbrand',
                                                                        )}
                                                                        onClick={() =>
                                                                            setIsOpen(
                                                                                false,
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            subItem.label
                                                                        }
                                                                    </Link>
                                                                ),
                                                            )}
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                ) : (
                                                    <Link
                                                        href={item.href || '#'}
                                                        className={cn(
                                                            'block text-gray-500 relative text-base font-medium hover:text-hexbrand',
                                                            pathname ===
                                                                item.href &&
                                                                'text-hexbrand',
                                                        )}
                                                        onClick={() =>
                                                            setIsOpen(false)
                                                        }
                                                    >
                                                        {item.label}
                                                    </Link>
                                                )}
                                            </div>
                                        );
                                    })}
                                </nav>
                                <div className="mt-8">
                                    <Link href={'/get-a-demo'}>
                                        <Button
                                            size={'lg'}
                                            className="bg-hexbrand w-full hover:bg-hexbrand text-white p-5"
                                        >
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="w-fit ml-auto lg:ml-0 hidden lg:flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <img
                            src="/globe.svg"
                            style={{ width: '24px', height: '24px' }}
                        />
                        <p className="text-[#616161] text-base font-medium tracking-[0.2px]">
                            EN
                        </p>
                    </div>
                    <Link href={'/get-a-demo'}>
                        <Button
                            size={'lg'}
                            className="bg-hexbrand hover:bg-hexbrand text-white p-5"
                        >
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default LandingNavbar;
