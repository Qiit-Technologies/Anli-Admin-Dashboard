import { useVerifiedAccess } from '@/hooks/useVerifiedAccess';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { itemOrderCheckedIllustration } from '../house-keeping/common/illustrations';
import { Button } from '../ui/button';

const EmailVerifiedPage = () => {
    const router = useRouter();
    const { organization, loading, accessState } = useVerifiedAccess();
    if (loading || accessState !== 'verified' || accessState === 'verified') {
        return (
            <div className="flex w-full h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin" />{' '}
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
                    <div>{itemOrderCheckedIllustration}</div>
                    <h1 className="text-lg font-bold">
                        Welcome Onboard {organization?.name}
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
