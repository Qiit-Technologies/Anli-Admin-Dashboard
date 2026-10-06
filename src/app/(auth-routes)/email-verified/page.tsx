'use client';

import { itemOrderCheckedIllustration } from '@/components/house-keeping/common/illustrations';
import { Button } from '@/components/ui/button';
import useHotel from '@/hooks/useHotel';
import { useRouter } from 'nextjs-toploader/app';

const EmailVerifiedPage = () => {
    const router = useRouter();
    const hotel = useHotel();
    return (
        <div className="flex w-full h-screen">
            <div className="w-full h-full flex items-center justify-center p-10">
                <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
                    <div>{itemOrderCheckedIllustration}</div>
                    <h1 className="text-lg font-bold">
                        Welcome Onboard {hotel?.organization?.name}
                    </h1>
                    <p>
                        Your Organization email has been fully verified. <br />
                        Now let&apos;s create your first user
                    </p>
                    <Button
                        onClick={() => router.replace('/create-staff')}
                        className="bg-orion-blue w-full hover:bg-orion-blue text-white h-12"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerifiedPage;
