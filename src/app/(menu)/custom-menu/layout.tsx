import type { Metadata } from 'next';
import type React from 'react';
import './menu.css';

export const metadata: Metadata = {
    title: 'Anli Solutions — Digital Menu',
    description: 'Anli QR Digital Menu',
};

export default function CustomMenuLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
