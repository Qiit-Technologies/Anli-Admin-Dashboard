import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface SettingCardProps {
    title: string;
    description: string;
    isChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

export function SettingCard({
    title,
    description,
    isChecked,
    onCheckedChange,
}: SettingCardProps) {
    return (
        <div
            onClick={() => onCheckedChange?.(!isChecked)}
            role="button"
            aria-label={title}
            className={cn(
                'border flex items-center bg-white p-4 rounded-xl',
                isChecked && 'border-hexbrand',
            )}
        >
            <div>
                <h1 className="text-sm font-semibold">{title}</h1>
                <span className="text-sm text-muted-foreground">
                    {description}
                </span>
            </div>
            <Checkbox
                className={cn(
                    'rounded-full ml-auto w-5 h-5 data-[state=checked]:bg-hexbrand data-[state=checked]:border-hexbrand',
                )}
                checked={isChecked}
                onCheckedChange={onCheckedChange}
            />
        </div>
    );
}
