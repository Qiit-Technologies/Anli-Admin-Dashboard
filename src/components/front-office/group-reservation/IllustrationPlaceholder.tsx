import { FolderSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IllustrationPlaceholder({
    className,
    label = 'Illustration',
}: {
    className?: string;
    label?: string;
}) {
    return (
        <div
            className={cn(
                'flex h-28 w-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted',
                className,
            )}
            aria-hidden
        >
            <FolderSearch className="size-8 text-muted-foreground" />
            <span className="text-center text-[11px] font-medium text-muted-foreground">
                {label}
            </span>
        </div>
    );
}
