import BrandButton from '@/components/common/Button';
import { ReactNode } from 'react';
import { BiSearch } from 'react-icons/bi';
import { MdOutlineHotel } from 'react-icons/md';

interface EmptyStateProps {
    type: 'no-data' | 'no-search-results';
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    icon?: ReactNode;
}

export const EmptyState = ({
    type,
    title,
    description,
    actionLabel,
    onAction,
    icon,
}: EmptyStateProps) => {
    const defaultIcon =
        type === 'no-search-results' ? (
            <BiSearch className="text-6xl text-gray-400" />
        ) : (
            <MdOutlineHotel className="text-6xl text-gray-400" />
        );

    return (
        <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
            {icon || defaultIcon}
            <p className="text-lg font-semibold mt-2">{title}</p>
            <p className="text-sm text-gray-400">{description}</p>
            <BrandButton
                onClick={onAction}
                className={`mt-4 px-4 py-2 rounded-md transition-colors ${
                    type === 'no-search-results'
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-orion-blue text-white hover:bg-blue-700'
                }`}
            >
                {actionLabel}
            </BrandButton>
        </div>
    );
};
