'use client';

import { useRouter } from 'next/navigation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-lg w-full bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Something went wrong
                </h1>
                <p className="text-sm text-gray-600 mb-4">
                    {error?.message || 'An unexpected error occurred.'}
                </p>
                <div className="flex gap-3">
                    <button
                        className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
                        onClick={() => reset()}
                    >
                        Try again
                    </button>
                    <button
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                        onClick={() => router.push('/signin')}
                    >
                        Go to Sign In
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                    If the issue persists, please sign in again.
                </p>
            </div>
        </div>
    );
}
