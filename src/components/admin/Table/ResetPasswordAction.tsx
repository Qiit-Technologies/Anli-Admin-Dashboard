import { resetStaffPassword } from '@/app/actions/users';
import BrandButton from '@/components/common/Button';
import Toast from '@/components/toast';
import { SimplifiedStaff } from '@/types/staff.types';
import { Row } from '@tanstack/react-table';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaKey } from 'react-icons/fa';

interface Props {
    row: Row<SimplifiedStaff>;
}

const ResetPasswordAction = ({ row }: Props) => {
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (id: number) => {
        setLoading(true);
        try {
            const response = await resetStaffPassword(id);
            if (response.message === 'Reset password successfully') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Reset password successfully.`}
                        type="success"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={`Reset password failed.`}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Failed to reset password:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <BrandButton
                onClick={() => handleResetPassword(row.original.id)}
                className="text-sm bg-white border border-orion-blue text-orion-blue hover:bg-white"
                size="sm"
                loading={loading}
                icon={loading ? undefined : <FaKey />}
                iconPosition="left"
                disabled={loading}
            >
                {loading ? ' Resetting...' : 'Reset Password'}
            </BrandButton>
        </div>
    );
};

export default ResetPasswordAction;
