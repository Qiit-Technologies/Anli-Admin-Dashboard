import React from 'react';

interface ChannelIconProps {
    channelType: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const ChannelIcon: React.FC<ChannelIconProps> = ({
    channelType,
    size = 'md',
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const getChannelLogo = (type: string) => {
        switch (type) {
            case 'BOOKING_COM':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* Booking.com logo - blue circle with checkmark */}
                        <circle cx="12" cy="12" r="10" fill="#003580" />
                        <path
                            d="M9 12l2 2 4-4"
                            stroke="white"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            case 'EXPEDIA':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* Expedia logo - blue square with E */}
                        <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            fill="#00A3E0"
                        />
                        <path
                            d="M8 8h8v2H8V8zm0 3h6v2H8v-2zm0 3h8v2H8v-2z"
                            fill="white"
                        />
                    </svg>
                );
            case 'AIRBNB':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* Airbnb logo - red heart */}
                        <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            fill="#FF5A5F"
                        />
                    </svg>
                );
            case 'HOTELS_COM':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* Hotels.com logo - green building */}
                        <path
                            d="M12 3L4 9v12h16V9l-8-6zm-6 6h12v8H6V9z"
                            fill="#00A3E0"
                        />
                        <rect x="8" y="11" width="2" height="2" fill="white" />
                        <rect x="12" y="11" width="2" height="2" fill="white" />
                        <rect x="16" y="11" width="2" height="2" fill="white" />
                        <rect x="8" y="15" width="2" height="2" fill="white" />
                        <rect x="12" y="15" width="2" height="2" fill="white" />
                        <rect x="16" y="15" width="2" height="2" fill="white" />
                    </svg>
                );
            case 'TRIPADVISOR':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* TripAdvisor logo - green circle with T */}
                        <circle cx="12" cy="12" r="10" fill="#00AA6C" />
                        <path
                            d="M9 7h6v2H9V7zm0 3h6v2H9v-2zm0 3h6v2H9v-2z"
                            fill="white"
                        />
                    </svg>
                );
            case 'AGODA':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* Agoda logo - orange circle with A */}
                        <circle cx="12" cy="12" r="10" fill="#FF6B35" />
                        <path
                            d="M12 4l3 8H9l3-8zm-2 10h4v2h-4v-2z"
                            fill="white"
                        />
                    </svg>
                );
            case 'SEVEN':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* 7even logo - dark blue circular 7 */}
                        <circle cx="12" cy="12" r="10" fill="#0F172A" />
                        <path
                            d="M8 8h8l-5 8"
                            stroke="white"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            case 'CORNICHE':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* Corniche logo - gold crown/C */}
                        <circle cx="12" cy="12" r="10" fill="#B59410" />
                        <path
                            d="M16 16c-1.1 1.25-2.9 2-4 2-3.3 0-6-2.7-6-6s2.7-6 6-6c1.1 0 2.9.75 4 2"
                            stroke="white"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>
                );
            case 'WAKANOW':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* Wakanow logo - teal globe */}
                        <circle cx="12" cy="12" r="10" fill="#00A69C" />
                        <path
                            d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
                            fill="white"
                            opacity="0.3"
                        />
                        <path
                            d="M12 4v16M4 12h16M12 4a15 15 0 0 1 0 16M12 4a15 15 0 0 0 0 16"
                            stroke="white"
                            strokeWidth="1"
                            fill="none"
                        />
                    </svg>
                );
            case 'CUSTOM':
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* Custom logo - purple gear */}
                        <path
                            d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5zm7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.65-.07-.97l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.97 0 .33.03.65.07.97l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z"
                            fill="#8B5CF6"
                        />
                    </svg>
                );
            default:
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className={`${sizeClasses[size]} ${className}`}
                        fill="currentColor"
                    >
                        {/* Default logo - gray globe */}
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                            fill="#6B7280"
                        />
                    </svg>
                );
        }
    };

    return getChannelLogo(channelType);
};

export default ChannelIcon;
