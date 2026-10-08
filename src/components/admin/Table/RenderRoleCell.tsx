import { Tooltip } from '@heroui/react';
import { AiOutlineEdit } from 'react-icons/ai';
import { MdDeleteForever } from 'react-icons/md';

type Role = {
    id: string;
    name: string;
    department: string;
    description: string;
    createdAt: string;
};

const renderRolesCell = (
    role: Role,
    columnKey: RoleColumn,
    onEdit: () => void,
    onDelete: () => void,
) => {
    switch (columnKey) {
        case 'name':
            return role.name;
        // case 'department':
        // return role.department;
        case 'description':
            return role.description;
        case 'createdAt':
            return role.createdAt;
        case 'actions':
            return (
                <div className="flex justify-start gap-4 w-full">
                    <Tooltip size="sm" content="Edit Role">
                        <button
                            className="text-2xl text-default-400 cursor-pointer active:opacity-50"
                            onClick={onEdit}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onEdit();
                                }
                            }}
                            tabIndex={0}
                        >
                            <AiOutlineEdit />
                        </button>
                    </Tooltip>
                    <Tooltip size="sm" color="danger" content="Delete Role">
                        <button
                            className="text-2xl text-danger cursor-pointer active:opacity-50"
                            onClick={onDelete}
                        >
                            <MdDeleteForever />
                        </button>
                    </Tooltip>
                </div>
            );
        default:
            return null;
    }
};

type RoleColumn =
    | 'name'
    // | 'department'
    | 'description'
    | 'createdAt'
    | 'actions';

export default renderRolesCell;
