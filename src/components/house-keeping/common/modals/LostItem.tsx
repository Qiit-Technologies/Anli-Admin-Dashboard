import { createLostItem } from '@/app/actions/houseKeeping';
import { CustomSheet } from '@/components/common/CustomSheet';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import LostItemForm from '../../form/LostItemForm';

interface LostItemModalProps {
    onSuccess?: () => void;
}

export const LostItemModal = ({ onSuccess }: LostItemModalProps) => {
    const [open, setOpen] = useState(false);

    const handleSubmit = async (values: any) => {
        try {
            await createLostItem(values);
            setOpen(false);
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={'Lost item has been logged successfully.'}
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
                    description={
                        'An error occurred while logging the lost item.'
                    }
                    type="error"
                />
            ));
        }
    };

    return (
        <CustomSheet
            title="Lost Item Details"
            trigger={
                <Button className="hover:bg-orion-blue bg-orion-blue text-white rounded-md w-full">
                    Log In Lost Item
                </Button>
            }
            open={open}
            setOpen={setOpen}
        >
            <LostItemForm onSubmit={handleSubmit} />
        </CustomSheet>
    );
};
