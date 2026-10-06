'use client';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedCompoent() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="mx-auto flex max-w-md flex-col items-center space-y-6 text-center">
                <div className="rounded-full bg-red-100 p-6">
                    <ShieldAlert className="h-16 w-16 text-red-600" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Access Denied
                </h1>

                <p className="text-lg text-muted-foreground">
                    Sorry, you don&apos;t have permission to access this page.
                    Please contact your administrator if you believe this is an
                    error.
                </p>
            </div>
        </div>
    );
}
