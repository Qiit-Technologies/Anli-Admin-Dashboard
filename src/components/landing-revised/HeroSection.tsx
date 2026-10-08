'use client';

import { PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ShimmerEffectButton } from './ButtonShimmer';

export default function HeroSection() {
    const router = useRouter();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center mt-12">
            <button className="rounded-full border border-dashed border-[#FF910C] bg-[#002955] w-[221px] lg:w-[319px] h-8 lg:h-[44px] flex justify-center items-center">
                <p className="text-[#E8ECF5] text-[10px] lg:text-[12px] font-semibold leading-[20px] tracking-[-0.24px] text-center">
                    All-in-one Cloud-Based Hospitality PMS
                </p>
            </button>

            <div className="max-w-[983px] mt-4">
                <p className="text-[#E8ECF5] text-[32px] lg:text-[64px] font-semibold leading-[35px] lg:leading-[72px] tracking-[-0.64px] lg:tracking-[-1.28px] text-center max-w-[313px] lg:max-w-full">
                    The Smarter Way to Run Hot-els and Restaurants
                </p>
            </div>

            <div className="flex flex-col lg:flex-row justify-center items-center gap-3 lg:gap-6 mt-4 lg:mt-12 w-full">
                <ShimmerEffectButton
                    bg="w-full lg:w-fit"
                    className="rounded-lg lg:rounded-md border border-[#FF910C] bg-[#FF910C] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] px-7 h-[60px] hover:bg-[#FF910C]"
                    onClick={() => router.push('/start-free-trial')}
                >
                    <p className="text-[#241102] text-[18px] font-semibold leading-[28px] text-center">
                        Start FREE Trial
                    </p>
                </ShimmerEffectButton>

                <button
                    onClick={() => router.push('/get-a-demo')}
                    className="w-full lg:w-fit rounded-lg lg:rounded-md border border-[#FF910C] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] flex justify-center items-center gap-3 px-7 h-[60px]"
                >
                    <PlayCircle color="#E8ECF5" fontSize={20} />
                    <p className="text-[#E8ECF5] text-[18px] font-semibold leading-[28px]">
                        Get a Demo
                    </p>
                </button>
            </div>
        </div>
    );
}
