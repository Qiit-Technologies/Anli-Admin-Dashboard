import { deleteReservation } from '@/app/actions/reservation';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationId: number;
    onDeleteSuccess: (id: number) => void;
}
const DeleteModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    reservationId,
    onDeleteSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await deleteReservation(reservationId);
            if (response) {
                if (response.message === 'Reservation deleted successfully') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    onDeleteSuccess(reservationId);
                    onClose();
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this reservation?
                    </DialogDescription>
                </DialogHeader>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default DeleteModal;
