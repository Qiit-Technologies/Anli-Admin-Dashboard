import { SimplifiedStaff, StaffColumn } from '@/types/staff.types';
import { Tooltip } from '@heroui/react';
import { AiOutlineEdit } from 'react-icons/ai';
import { MdDeleteForever } from 'react-icons/md';

const renderCell = (
    staff: SimplifiedStaff,
    columnKey: StaffColumn,
    onEdit: () => void,
    onDelete: () => void,
) => {
    switch (columnKey) {
        case 'fullName':
            return staff.fullName;
        case 'department':
            return staff.department;
        case 'email':
            return staff.email;
        case 'createdAt':
            return staff.createdAt;
        case 'actions':
            return (
                <div className="flex justify-start gap-4 w-full">
                    <Tooltip size="sm" content="Edit">
                        <span
                            className="text-2xl text-default-400 cursor-pointer active:opacity-50"
                            onClick={onEdit}
                        >
                            <AiOutlineEdit />
                        </span>
                    </Tooltip>
                    <Tooltip size="sm" color="danger" content="Delete Staff">
                        <span
                            className="text-2xl text-danger cursor-pointer active:opacity-50"
                            onClick={onDelete}
                        >
                            <MdDeleteForever />
                        </span>
                    </Tooltip>
                </div>
            );
        default:
            return null;
    }
};

export default renderCell;
