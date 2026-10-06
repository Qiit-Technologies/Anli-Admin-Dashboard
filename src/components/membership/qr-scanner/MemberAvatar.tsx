'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MemberAvatarProps {
    photoUrl?: string | null;
    name: string;
    memberId?: string;
    size?: 'md' | 'lg';
    className?: string;
}

export default function MemberAvatar({
    photoUrl,
    name,
    memberId,
    size = 'lg',
    className,
}: Readonly<MemberAvatarProps>) {
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(Boolean(photoUrl));

    const dimensions =
        size === 'lg' ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-14 w-14';

    useEffect(() => {
        if (!photoUrl?.trim()) {
            setLoadedSrc(null);
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);
        setLoadedSrc(null);

        const img = new window.Image();
        img.decoding = 'async';
        img.onload = () => {
            if (!cancelled) {
                setLoadedSrc(photoUrl);
                setIsLoading(false);
            }
        };
        img.onerror = () => {
            if (!cancelled) {
                setLoadedSrc(null);
                setIsLoading(false);
            }
        };
        img.src = photoUrl;

        return () => {
            cancelled = true;
        };
    }, [photoUrl, memberId]);

    return (
        <div
            className={cn(
                'relative shrink-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-100 shadow-sm',
                dimensions,
                className,
            )}
        >
            {isLoading ? (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
            ) : null}

            {loadedSrc ? (
                <img
                    key={`${memberId ?? 'member'}-${loadedSrc}`}
                    src={loadedSrc}
                    alt={name}
                    className={cn(
                        'h-full w-full object-cover transition-opacity duration-200',
                        isLoading ? 'opacity-0' : 'opacity-100',
                    )}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                    <User className={size === 'lg' ? 'h-9 w-9' : 'h-6 w-6'} />
                </div>
            )}
        </div>
    );
}
