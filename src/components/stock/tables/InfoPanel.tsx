import React from 'react';
import StatusComponent from './StatusComponent';

interface InfoFieldProps {
    label: string;
    value: string;
    labelClassName?: string;
    valueClassName?: string;
    status?: string;
    statusStyles?: any;
}

const InfoField: React.FC<InfoFieldProps> = ({
    label,
    value,
    labelClassName = 'text-gray-500 capitalize',
    valueClassName = 'text-gray-600',
    status,
    statusStyles,
}) => (
    <div className="flex items-center gap-1 text-sm text-nowrap">
        <span className={labelClassName}>{label}:</span>
        {label === 'Status' ? (
            <>
                <StatusComponent
                    status={status as string}
                    statusStyles={statusStyles}
                />
            </>
        ) : (
            <span className={valueClassName}>{value}</span>
        )}
    </div>
);

interface InfoPanelProps {
    fields: InfoFieldProps[];
    status?: string;
    statusStyles?: any;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
    fields,
    status,
    statusStyles,
}) => (
    <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
            <InfoField
                status={status}
                statusStyles={statusStyles}
                key={index}
                {...field}
            />
        ))}
    </div>
);

interface RequestInfoPanelProps {
    status: string;
    statusStyles?: any;
    fields: InfoFieldProps[];
}

export const RequestInfoPanel: React.FC<RequestInfoPanelProps> = ({
    status,
    statusStyles,
    fields,
}) => {
    return (
        <InfoPanel
            status={status}
            statusStyles={statusStyles}
            fields={fields}
        />
    );
};

export default InfoPanel;
