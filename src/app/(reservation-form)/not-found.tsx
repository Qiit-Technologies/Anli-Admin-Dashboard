'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex w-full h-screen items-center justify-center flex-col gap-4 bg-[#F9FCFF]">
            <Image
                alt="Not found Illustration"
                src="/404.svg"
                width={500}
                height={500}
            />
            <p className="text-xl font-semibold text-[#101828] text-center px-4">Hotel or Page not found</p>
            <p className="text-[#667085] text-center px-4 -mt-2 max-w-[400px]">The hotel reservation link you are looking for does not exist.</p>
            <button
                onClick={() => router.back()}
                className="bg-orion-blue px-6 py-3 text-white rounded-md hover:bg-opacity-90 transition-opacity mt-4 font-medium"
            >
                Go Back
            </button>
        </div>
    );
}
