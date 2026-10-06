import Image from 'next/image';
import { cn } from '@/lib/utils';

interface EmployeeAvatarProps {
    src?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function EmployeeAvatar({
    src,
    name,
    size = 'md',
    className,
}: EmployeeAvatarProps) {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
    };

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            className={cn(
                'rounded-full bg-gray-200 flex items-center justify-center overflow-hidden',
                sizeClasses[size],
                className,
            )}
        >
            {src ? (
                <Image
                    src={src || '/user4.jpg'}
                    alt={name}
                    width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
                    height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
                    className="object-cover"
                />
            ) : (
                <span className="text-sm font-medium text-gray-600">
                    {initials}
                </span>
            )}
        </div>
    );
}
