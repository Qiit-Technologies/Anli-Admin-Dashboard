'use client';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';

export default function AccessDeniedPage() {
    const router = useRouter();
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
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

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                    <Button
                        onClick={() => router.back()}
                        className="bg-orion-blue hover:bg-orion-blue"
                        variant="default"
                    >
                        Go Back
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="border-orion-blue text-orion-blue hover:text-orion-blue"
                    >
                        <Link href="/contact">Contact Support</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
