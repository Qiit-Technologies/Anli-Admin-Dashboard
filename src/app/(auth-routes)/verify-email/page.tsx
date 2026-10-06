'use client';
import { resendVerificationEmail } from '@/app/actions/hotel';
import { emailverificationIllustration } from '@/components/common/illustrations';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import useHotel from '@/hooks/useHotel';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const router = useRouter();
    const { organization: hotel, loading } = useHotel();
    const [showContent, setShowContent] = useState(false);
    const [isloading, setIsLoading] = useState(false);

    const handleResendVerificationEmail = async () => {
        try {
            setIsLoading(true);
            const response = await resendVerificationEmail();
            if (response) {
                if (response.message === 'Verification Email Resent!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={`Verification Email Resent!`}
                            type="success"
                        />
                    ));
                    setIsLoading(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                    setIsLoading(false);
                }
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={`Failed to resend verification email: ${error.message}`}
                    type="error"
                />
            ));
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (loading || !showContent) {
        return (
            <div className="flex w-full h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin" />
                    <p className="text-muted-foreground">
                        {loading
                            ? 'Checking verification status...'
                            : 'Preparing page...'}
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
                        <br /> {hotel?.owner.email}
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
                        <button
                            onClick={handleResendVerificationEmail}
                            disabled={isloading}
                            className="text-orion-blue underline disabled:opacity-50"
                        >
                            Click to resend
                        </button>
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
export default VerifyEmail;
