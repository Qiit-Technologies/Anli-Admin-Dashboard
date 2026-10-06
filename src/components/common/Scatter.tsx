import { cn } from '@/lib/utils'; // Adjust import path
import React from 'react';

interface ScatterProps {
    count?: number;
    children: React.ReactNode;
    className?: string;
    spread?: number;
    rotation?: boolean;
}

export const Scatter = ({
    count = 5,
    children,
    className,
    spread = 100,
    rotation = false,
}: ScatterProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * spread;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                const rotate = rotation ? Math.random() * 360 : 0;

                return (
                    <div
                        key={i}
                        className={cn('absolute', className)}
                        style={{
                            transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
                            left: '50%',
                            top: '50%',
                        }}
                    >
                        {React.isValidElement(children)
                            ? React.cloneElement(children, {
                                  ...children.props,
                                  style: {
                                      ...children.props?.style,
                                  },
                              })
                            : children}
                    </div>
                );
            })}
        </>
    );
};
