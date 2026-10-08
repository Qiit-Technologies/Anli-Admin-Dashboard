'use client';

import BrandButton from '@/components/common/Button';
import Image from 'next/image';
import Link from 'next/link';

export default function BookingsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex flex-col items-center justify-center py-6 px-12 text-center w-fit bg-[#F7F7F7] rounded-3xl border border-[#FF6F00]">
                <Image
                    src="/banquet/empty-state.png"
                    alt="Bookings"
                    width={200}
                    height={200}
                    className="object-contain"
                />
                <h2
                    className="
text-2xl font-bold text-gray-900 my-4
            "
                >
                    Bookings
                </h2>
                <p className="max-w-md text-xs text-[#5B5858]">
                    You currently don&apos;t have any bookings. Please create
                    one.
                </p>
                <Link href="/banquet/bookings/new" className="mt-8 w-full">
                    <BrandButton className="w-full px-[16px] py-[24px]">
                        Create Bookings
                    </BrandButton>
                </Link>
            </div>
        </div>
    );
}
