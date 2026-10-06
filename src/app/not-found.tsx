'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex w-full h-screen items-center justify-center flex-col gap-4">
            <Image
                alt="Not found Illustration"
                src="/404.svg"
                width={500}
                height={500}
            />
            <p className="text-xl font-semibold">Page not found</p>
            <button
                onClick={() => router.back()}
                className="bg-orion-blue px-4 py-2 text-white rounded-md hover:bg-opacity-90 transition-opacity"
            >
                Go Back
            </button>
        </div>
    );
}
