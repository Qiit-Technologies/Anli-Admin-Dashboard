'use client';
import { useUser } from '@/context/useUser';
import { useVerifiedAccess } from '@/hooks/useVerifiedAccess';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import { emailverificationIllustration } from '../common/illustrations';
import { Button } from '../ui/button';

const VerifyEmailPage = () => {
    const { user } = useUser();
    const router = useRouter();
    const { loading, accessState } = useVerifiedAccess();

    if (loading || accessState === 'verified') {
        return (
            <div className="flex w-full h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin" />
                    <p className="text-muted-foreground">
                        Checking verification status...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full h-screen">
            <div className="w-full h-full flex items-center justify-center p-10">
                <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
                    <div>{emailverificationIllustration}</div>
                    <p>
                        We&apos;ve sent a verification link to your email:{' '}
                        <br /> {user?.email}
                    </p>
                    <Link
                        href="https://mail.google.com/mail/u/0/"
                        target="_blank"
                        className="w-full"
                    >
                        <Button className="bg-orion-blue w-full hover:bg-orion-blue text-white h-12">
                            Open Email App
                        </Button>
                    </Link>
                    <span>
                        Didn&apos;t receive the email?{' '}
                        <Link href={'/'} className="text-orion-blue">
                            Click to resend
                        </Link>
                    </span>

                    <Button
                        variant={'ghost'}
                        onClick={() => router.push('/signin')}
                    >
                        <ArrowLeft />
                        Back to login
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
