'use client';
import { toggleRoomStatus } from '@/app/actions/room';
import Toast from '@/components/toast';
import { ROOM } from '@/types';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { mutate } from 'swr';

interface RowData {
    original: ROOM;
}

interface StatusToggleButtonProps {
    row: RowData;
}

const StatusToggleButton: React.FC<StatusToggleButtonProps> = ({ row }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleStatusToggle = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await toggleRoomStatus(row.original.id, 'AVAIL');

            setLoading(false);

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.error}
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Room ${row.original.roomNumber} status updated successfully`}
                        type="success"
                    />
                ));
            }
            mutate('/rooms');
            mutate('/room/stat');
            mutate('/hotelRooms');
        } catch (error: any) {
            setLoading(false);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={
                        error instanceof Error
                            ? error.message
                            : 'An error occurred'
                    }
                    type="error"
                />
            ));
        }
    };
    return (
        <button
            onClick={handleStatusToggle}
            disabled={row.original.status !== 'DIRTY' || loading}
            className="text-white flex items-center justify-center gap-1 bg-orion-blue px-3 py-1 rounded-md disabled:opacity-40 disabled:bg-gray-300 w-[100px]"
        >
            {loading ? (
                <div className="flex items-center gap-2 justify-center">
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>Updating...</span>
                </div>
            ) : (
                <span>Update</span>
            )}
        </button>
    );
};
export default StatusToggleButton;
