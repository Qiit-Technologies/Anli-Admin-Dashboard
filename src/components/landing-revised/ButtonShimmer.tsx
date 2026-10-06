import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShimmerEffectButtonProps extends ButtonProps {
    trailColor?: string;
    bg?: string;
}
export const ShimmerEffectButton = ({ ...props }: ShimmerEffectButtonProps) => {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-md shadow border p-0.5',
                'dark:bg-zinc-900 bg-white',
                'dark:border-zinc-800 border-zinc-400 group',
                `${props.bg}`,
            )}
        >
            <span
                className={cn(
                    'absolute inset-[-1000%]',
                    'animate-[spin_5s_linear_infinite_reverse]',
                    'group-hover:bg-none group-hover:text-white',
                    'dark:bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,#2828fb_7%)]',
                    `bg-[conic-gradient(from_90deg_at_50%_50%,#ff8629_0%,#fff_5%)]`,
                )}
            />
            <Button
                {...props}
                className={cn(
                    'h-10 px-2 w-full rounded-md font-semibold backdrop-blur-xl',
                    'text-zinc-800 dark:text-zinc-200',
                    'bg-zinc-50 dark:bg-zinc-900',
                    props.className,
                )}
            />
        </div>
    );
};
