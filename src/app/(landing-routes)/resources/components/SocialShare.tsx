'use client';

import { Button } from '@/components/ui/button';
import {
    Facebook,
    Link2,
    Linkedin,
    Mail,
    MessageCircle,
    Twitter,
} from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareProps {
    url: string;
    title: string;
    description?: string;
    className?: string;
    showLabels?: boolean;
    variant?: 'horizontal' | 'vertical' | 'floating' | 'compact';
}

export default function SocialShare({
    url,
    title,
    description = '',
    className = '',
    showLabels = false,
    variant = 'horizontal',
}: SocialShareProps) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    };

    const handleShare = (platform: string, shareUrl: string) => {
        if (platform === 'email') {
            window.location.href = shareUrl;
        } else {
            window.open(
                shareUrl,
                'share-dialog',
                'width=800,height=600,resizable=yes,scrollbars=yes',
            );
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const shareButtons = [
        {
            name: 'Facebook',
            icon: Facebook,
            url: shareLinks.facebook,
            color: 'hover:bg-orange-500 hover:text-white border-orange-400/30',
        },
        {
            name: 'Twitter',
            icon: Twitter,
            url: shareLinks.twitter,
            color: 'hover:bg-orange-500 hover:text-white border-orange-400/30',
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: shareLinks.linkedin,
            color: 'hover:bg-orange-500 hover:text-white border-orange-400/30',
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            url: shareLinks.whatsapp,
            color: 'hover:bg-orange-500 hover:text-white border-orange-400/30',
        },
        {
            name: 'Email',
            icon: Mail,
            url: shareLinks.email,
            color: 'hover:bg-orange-500 hover:text-white border-orange-400/30',
        },
    ];

    const getContainerClasses = () => {
        const base = `flex gap-2 ${className}`;
        switch (variant) {
            case 'vertical':
                return `${base} flex-col`;
            case 'floating':
                return `${base} fixed left-4 top-1/2 transform -translate-y-1/2 flex-col bg-white border border-orange-400/20 rounded-xl p-3 z-40`;
            case 'compact':
                return `${base} flex-row`;
            default:
                return `${base} flex-row flex-wrap`;
        }
    };

    const getButtonSize = () => {
        if (variant === 'compact') return 'sm';
        if (variant === 'floating') return 'sm';
        return showLabels ? 'default' : 'sm';
    };

    const getButtonClasses = (buttonColor: string) => {
        const baseClasses = `${buttonColor} transition-all duration-200`;

        if (variant === 'compact') {
            return `${baseClasses} w-8 h-8 p-0 rounded-md bg-white/80 hover:bg-white text-gray-600 hover:text-orange-600 border-white/50 hover:border-orange-400/50 backdrop-blur-sm`;
        }

        if (variant === 'floating') {
            return `${baseClasses} w-11 h-11 p-0 rounded-lg text-orange-600 bg-orange-50`;
        }

        return `${baseClasses} rounded-lg text-orange-600 bg-orange-50`;
    };

    return (
        <div className={getContainerClasses()}>
            {variant !== 'floating' && variant !== 'compact' && (
                <span className="text-sm font-medium text-orange-600 flex items-center">
                    Share this article:
                </span>
            )}

            {shareButtons.map((button) => {
                const IconComponent = button.icon;
                return (
                    <Button
                        key={button.name}
                        variant="outline"
                        size={getButtonSize()}
                        onClick={() =>
                            handleShare(button.name.toLowerCase(), button.url)
                        }
                        className={getButtonClasses(button.color)}
                        title={`Share on ${button.name}`}
                    >
                        <IconComponent
                            className={`${showLabels && variant !== 'compact' ? 'mr-2' : ''} ${variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}`}
                        />
                        {showLabels && variant !== 'compact' && button.name}
                    </Button>
                );
            })}

            <Button
                variant="outline"
                size={getButtonSize()}
                onClick={copyToClipboard}
                className={getButtonClasses(
                    'hover:bg-orange-500 hover:text-white border-orange-400/30',
                )}
                title="Copy link"
            >
                <Link2
                    className={`${showLabels && variant !== 'compact' ? 'mr-2' : ''} ${variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}`}
                />
                {showLabels && variant !== 'compact' && 'Copy Link'}
            </Button>
        </div>
    );
}
