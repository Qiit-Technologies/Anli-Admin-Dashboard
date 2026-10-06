'use client';
import Image from 'next/image';
import { useRouter } from 'nextjs-toploader/app';
import { Button } from '../ui/button';

function WelcomePage() {
    const router = useRouter();
    return (
        <div className="flex w-full h-screen">
            <div className="w-full h-full flex flex-col gap-4 items-center justify-center p-10">
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Image
                        src={'/logos/anli-logo.png'}
                        width={50}
                        height={50}
                        alt={'verify-email'}
                    />
                    <h1 className="text-lg font-bold text-black">
                        Welcome to Anli
                    </h1>
                    <p>Your Organization is set up!</p>
                    <span>First user created successfully</span>
                </div>
                <div className="w-full flex gap-3 items-center justify-center">
                    <Button
                        variant={'outline'}
                        className="border-orion-blue text-orion-blue"
                        onClick={() => router.push('/admin')}
                    >
                        Home Page
                    </Button>
                    <Button
                        className="bg-orion-blue text-white hover:bg-orion-blue"
                        onClick={() => router.push('/admin/staffing')}
                    >
                        Add Users
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default WelcomePage;
