import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import React from 'react';

interface CollapsibleCardProps {
    title: string;
    subTitle?: string;
    children: React.ReactNode;
}
const CollapsibleCard = ({
    title,
    subTitle,
    children,
}: CollapsibleCardProps) => {
    const [isOpen, setIsOpen] = React.useState(true);
    return (
        <Collapsible
            open={isOpen}
            className="rounded-xl border overflow-hidden"
        >
            <CollapsibleTrigger
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-100 h-fit p-4 flex items-center justify-between"
            >
                <div className="flex flex-col justify-start items-start">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{subTitle}</p>
                </div>
                <ArrowUp className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent
                className={cn(
                    'p-4 flex flex-col gap-6',
                    isOpen ? 'flex' : 'hidden',
                )}
            >
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
};

export default CollapsibleCard;
