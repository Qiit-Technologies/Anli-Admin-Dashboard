import React from 'react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: React.JSX.Element;
    children?: React.ReactNode;
}
const EmptyState = ({
    icon,
    title,
    description,
    children,
}: EmptyStateProps) => {
    return (
        <div className="bg-gray-100 text-center flex flex-col py-10 px-14 w-[600px] rounded-md items-center justify-center">
            <div>{icon}</div>
            <h1 className="font-bold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
            {children}
        </div>
    );
};

export default EmptyState;
