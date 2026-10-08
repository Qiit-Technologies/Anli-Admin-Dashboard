import { BadgePercent, Ban, Gift } from 'lucide-react';

interface ColorLegendProps {
    className?: string;
}

export const ColorLegend = ({ className = '' }: ColorLegendProps) => {
    return (
        <div className={`flex items-center gap-6 p-3 bg-muted/30 rounded-lg border ${className}`}>
            <div className="text-sm font-medium text-muted-foreground">
                Reservation Types:
            </div>
            <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-muted-foreground">Regular</span>
            </div>
            <div className="flex items-center gap-1">
                <Gift className="w-3 h-3 text-green-600" />
                <span className="text-xs text-muted-foreground">Complimentary</span>
            </div>
            <div className="flex items-center gap-1">
                <BadgePercent className="w-3 h-3 text-orange-600" />
                <span className="text-xs text-muted-foreground">Discount</span>
            </div>
            <div className="flex items-center gap-1">
                <Ban className="w-3 h-3 text-red-600" />
                <span className="text-xs text-muted-foreground">Void</span>
            </div>
        </div>
    );
};
