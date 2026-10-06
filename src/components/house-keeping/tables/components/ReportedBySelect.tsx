'use client';
import { IMaintenance } from '@/types';
import React from 'react';
import { Combobox } from '../../common/ComboBox';

interface AssigneeCellProps {
    row: { original: IMaintenance };
}

const ReportByCell: React.FC<AssigneeCellProps> = ({ row }) => {
    const assignedTo = row.original.reportedBy;
    const assignees = [
        { value: '1', label: 'John Doe' },
        { value: '2', label: 'Jane Smith' },
    ];

    const handleChange = (value: string) => {
        console.log('Changing assignee for row', row.original.id, 'to', value);
    };

    return (
        <Combobox
            data={assignees}
            value={row.original.reportedBy.fullName}
            placeholder={assignedTo.fullName}
            onChange={handleChange}
        />
    );
};

export default ReportByCell;
