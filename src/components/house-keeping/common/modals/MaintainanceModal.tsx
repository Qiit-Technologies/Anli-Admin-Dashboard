import { createMaintenance } from '@/app/actions/houseKeeping';
import { CustomSheet } from '@/components/common/CustomSheet';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import MaintenanceForm from '../../form/MaintainanceForm';

interface MaintainanceModalProps {
    onSuccess?: () => void;
}

export const MaintainanceModal = ({ onSuccess }: MaintainanceModalProps) => {
    const [open, setOpen] = useState(false);

    const handleSubmit = async (values: any) => {
        try {
            const payload = {
                ...values,
                roomId: Number(values.roomId),
                reportedBy: values.reportedBy
                    ? Number(values.reportedBy)
                    : undefined,
                maintenanceDurationValue: values.maintenanceDurationValue
                    ? Number(values.maintenanceDurationValue)
                    : undefined,
                maintenanceDurationUnit: values.maintenanceDurationUnit || undefined,
            };
            await createMaintenance(payload);
            setOpen(false);
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={'Room added successfully.'}
                    type="success"
                />
            ));
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error(error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={'An error occurred while adding the room.'}
                    type="error"
                />
            ));
        }
    };

    return (
        <CustomSheet
            title="Set Room as Under Maintenance "
            trigger={
                <Button className="hover:bg-orion-blue bg-orion-blue text-white rounded-md w-full">
                    Add a room
                </Button>
            }
            open={open}
            setOpen={setOpen}
        >
            <MaintenanceForm onSubmit={handleSubmit} />
        </CustomSheet>
    );
};
