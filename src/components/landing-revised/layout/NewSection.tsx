import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    bgChildren?: ReactNode;
    bgClassName?: string;
}

const NewSection = React.forwardRef<HTMLDivElement, SectionProps>(
    ({ children, className, bgClassName, bgChildren, ...props }, ref) => {
        return (
            <section className={cn('w-full', bgClassName)}>
                {bgChildren}
                <div
                    ref={ref}
                    {...props}
                    className={cn(
                        'w-full relative px-4 py-10 lg:px-24 max-w-2xl md:max-w-[900px] lg:max-w-[1200px] xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto',
                        className,
                    )}
                >
                    {children}
                </div>
            </section>
        );
    },
);

NewSection.displayName = 'NewSection';

export default NewSection;
