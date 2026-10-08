'use client';
import { ReactNode } from 'react';

export const MFormColumn = ({ children }: { children: ReactNode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    );
};
