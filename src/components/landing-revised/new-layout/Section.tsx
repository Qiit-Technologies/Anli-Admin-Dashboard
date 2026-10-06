import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    bgClassName?: string;
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
    ({ children, className, bgClassName, ...props }, ref) => {
        return (
            <section className={cn('w-full', bgClassName)}>
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

Section.displayName = 'Section';

export default Section;
