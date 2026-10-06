'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { TUser } from '@/types/user';
import { LogOut } from 'lucide-react';

interface Props {
    user: TUser | undefined;
    logOut: () => void;
}

const UserComponent = ({ user, logOut }: Props) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full h-auto p-2 justify-start gap-3"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={
                                user?.profileImage ??
                                'https://res.cloudinary.com/dhkwjizxu/image/upload/v1736109984/assets/fwaq9bud8tyqsps9hwjy.png'
                            }
                        />
                        <AvatarFallback className="bg-gray-500">
                            {user?.fullName?.charAt(0) ?? '-'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left overflow-hidden">
                        <p className="font-semibold text-black truncate">
                            {user?.fullName ?? user?.orgName}
                        </p>
                        <p className="text-[#555] text-sm truncate capitalize">
                            {user?.email ?? '------'}
                        </p>
                    </div>
                    <LogOut />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
                <div className="flex flex-col gap-1">
                    <div className="px-2 py-1.5">
                        <p className="font-medium">
                            {user?.fullName ?? '-----'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                            {user?.email ?? '------'}
                        </p>
                    </div>
                    <hr className="my-2" />
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-500 hover:text-red-500 hover:bg-red-50"
                        onClick={logOut}
                    >
                        <LogOut className="w-4 h-4" />
                        Log out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default UserComponent;
