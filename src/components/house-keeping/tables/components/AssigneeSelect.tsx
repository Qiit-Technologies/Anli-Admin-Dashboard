'use client';
import { updateCleaningRequestHousekeeper } from '@/app/actions/houseKeeping';
import Toast from '@/components/toast';
import { fetchHousekeepers } from '@/hooks/fetcher';
import { CleaningRequestType } from '@/types';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { Combobox } from '../../common/ComboBox';

interface AssigneeCellProps {
    row: { original: CleaningRequestType };
}

const AssigneeSelect: React.FC<AssigneeCellProps> = ({ row }) => {
    const [, setLoading] = useState<boolean>(false);

    const { data: housekeepers } = useSWR(
        '/housekeeping/housekeepers',
        fetchHousekeepers,
    );

    const assignedTo = row.original.assignedTo;
    const assignees =
        housekeepers
            ?.filter(
                (housekeeper: { id: number }) =>
                    housekeeper.id !== assignedTo?.id,
            )
            .map((housekeeper: { id: number; fullName: string }) => ({
                value: housekeeper.id,
                label: housekeeper.fullName,
            })) || [];

    const handleChange = async (value: string) => {
        try {
            setLoading(true);
            const response = await updateCleaningRequestHousekeeper(
                row.original.id,
                Number(value),
            );

            setLoading(false);

            if (
                response.message ===
                'Cleaning request housekeeper reassigned successfully!'
            ) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.message}
                        type="error"
                    />
                ));
            }
            mutate('/dashboard?housekeeping=cleaning-requests');
        } catch (error: any) {
            setLoading(false);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={
                        error instanceof Error
                            ? error.message
                            : 'An error occurred!'
                    }
                    type="error"
                />
            ));
        }
    };

    return (
        <Combobox
            data={assignees}
            value={row.original.assignedTo.id?.toString()}
            placeholder={assignedTo.fullName}
            onChange={handleChange}
        />
    );
};

export default AssigneeSelect;
