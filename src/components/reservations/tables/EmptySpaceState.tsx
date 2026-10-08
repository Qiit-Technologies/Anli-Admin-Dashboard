import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface EmptySpaceStateProps {
    onCreateSpace?: () => void;
}

export default function EmptySpaceState({
    onCreateSpace,
}: EmptySpaceStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <Image
                src="/reservation/emptyReservation.svg"
                alt="emptyReservation"
                width={112}
                height={112}
                className="mb-2"
            />

            <h2 className="text-xl font-semibold mb-2">Table Space</h2>
            <p className="text-[#5B5858] mb-8">You have not created any</p>

            <Button
                onClick={onCreateSpace}
                className="bg-[#0A84FF] text-white rounded-lg px-16 py-6 text-base w-96"
            >
                Create New Space
            </Button>
        </div>
    );
}
