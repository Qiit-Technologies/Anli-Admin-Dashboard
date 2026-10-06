import { cn } from '@/lib/utils';

const StatusComponent = ({
    status,
    statusStyles,
}: {
    status: string;
    statusStyles: any;
}) => {
    return (
        <div
            className={cn(
                statusStyles[status.toLowerCase() as keyof typeof statusStyles]
                    ?.bg || 'bg-gray-100',
                'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
            )}
        >
            <div
                className={cn(
                    statusStyles[
                        status.toLowerCase() as keyof typeof statusStyles
                    ]?.dot || 'bg-gray-500',
                    'w-2 h-2 rounded-full',
                )}
            />
            <span
                className={cn(
                    statusStyles[
                        status.toLowerCase() as keyof typeof statusStyles
                    ]?.text || 'text-gray-600',
                    'text-xs caption-top',
                )}
            >
                {status}
            </span>
        </div>
    );
};

export default StatusComponent;
