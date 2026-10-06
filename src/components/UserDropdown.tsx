'use client';
import { useUser } from '@/context/useUser';
import { useUserProfile } from '@/hooks/useUser';
import {
    Avatar,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    User as UserComponent,
} from '@heroui/react';
import { useRouter } from 'nextjs-toploader/app';
import { ReactNode } from 'react';
import {
    FaBed,
    FaBuilding,
    FaEnvelope,
    FaLock,
    FaUser,
    FaUsers,
} from 'react-icons/fa';

type MenuItemColor =
    | 'danger'
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning';

const UserDropdown = ({ role }: { role: string }) => {
    useUserProfile();
    const { user } = useUser();

    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const userMenuItems: Array<{
        key: string;
        label: string;
        description?: string;
        path: string;
        color?: MenuItemColor;
        onClick?: () => void;
        icon?: ReactNode;
    }> = [
        {
            key: 'My Profile',
            label: 'My Profile',
            path: '/admin/settings',
            icon: <FaUser className="h-4 w-4" />,
        },
        {
            key: 'bookings',
            label: 'Bookings',
            path: '/front-office/reservations',
            icon: <FaBed className="h-4 w-4" />,
        },
        {
            key: 'staff',
            label: 'Staff',
            path: '/admin/staffing',
            icon: <FaUsers className="h-4 w-4" />,
        },
        {
            key: 'rooms',
            label: 'Rooms',
            path: '/front-office/room-management',
            icon: <FaBuilding className="h-4 w-4" />,
        },
        {
            key: 'contact',
            label: 'Contact Support',
            path: '/admin/support',
            icon: <FaEnvelope className="h-4 w-4" />,
        },
    ];

    return (
        <Dropdown
            placement="bottom-end"
            className="w-64 rounded-md border shadow-lg p-0 overflow-hidden"
            classNames={{
                base: 'p-0',
            }}
        >
            <DropdownTrigger>
                <Avatar
                    as="button"
                    className="h-10 w-10 border overflow-hidden transition-transform hover:scale-105"
                    src={
                        user?.profileImage ??
                        'https://res.cloudinary.com/dhkwjizxu/image/upload/v1736109984/assets/fwaq9bud8tyqsps9hwjy.png'
                    }
                />
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Profile Actions"
                className="p-0"
                itemClasses={{
                    base: [
                        'rounded-none',
                        'py-3 px-4',
                        'text-sm font-medium',
                        'transition-colors',
                        'border-y border-y-transparent',
                        'transition-opacity',
                        'data-[hover=true]:border-gray-200',
                        'dark:data-[hover=true]:bg-default-50',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                    ],
                }}
            >
                <DropdownSection
                    className="p-0 overflow-hidden mb-0"
                    showDivider
                    dividerProps={{
                        className: 'mt-0',
                    }}
                >
                    <DropdownItem
                        key="profile"
                        isReadOnly
                        onPress={() => handleNavigation('/profile')}
                    >
                        <UserComponent
                            avatarProps={{
                                size: 'sm',
                                src:
                                    user?.profileImage ??
                                    'https://res.cloudinary.com/dhkwjizxu/image/upload/v1736109984/assets/fwaq9bud8tyqsps9hwjy.png',
                            }}
                            classNames={{
                                base: 'flex items-center justify-start gap-2 h-full',
                                name: 'font-semibold text-black',
                                description: 'text-muted-foreground capitalize',
                            }}
                            name={user?.fullName}
                            description={role}
                        />
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection className="mb-0">
                    {userMenuItems.map((item) => (
                        <DropdownItem
                            key={item.key}
                            as="a"
                            href={item.path}
                            startContent={item.icon}
                            description={item.description}
                        >
                            {item.label}
                        </DropdownItem>
                    ))}
                </DropdownSection>
                <DropdownItem
                    key={'logout'}
                    as="a"
                    href="/logout"
                    className="bg-danger text-white data-[hover=true]:bg-danger"
                    classNames={{
                        base: ['text-white'],
                        description: 'text-white',
                    }}
                    startContent={<FaLock />}
                >
                    Log Out
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};

export default UserDropdown;
