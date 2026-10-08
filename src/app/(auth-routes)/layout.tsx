import { ReactNode } from 'react';

export default async function ProtectedLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div>
            <main>{children}</main>
        </div>
    );
}
