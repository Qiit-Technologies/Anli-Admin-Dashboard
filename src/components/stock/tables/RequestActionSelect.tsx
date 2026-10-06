'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface ActionSelectProps {
    status?: 'pending' | 'done';
    onAction: (action: string) => void;
}

export default function ActionSelect({
    status = 'pending',
    onAction,
}: ActionSelectProps) {
    const [selectedAction, setSelectedAction] = useState<string>('');

    const handleActionSelect = (value: string) => {
        setSelectedAction(value);
        onAction(value);
    };

    return (
        <Select value={selectedAction} onValueChange={handleActionSelect}>
            <SelectTrigger className="w-[180px] border-none shadow-none focus-visible:ring-brand">
                <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="view" className="text-brand">
                    View
                </SelectItem>
                {status === 'pending' && (
                    <>
                        <SelectItem value="approve" className="text-orion-blue">
                            Approve
                        </SelectItem>
                        <SelectItem value="reject" className="text-danger">
                            Reject
                        </SelectItem>
                    </>
                )}
            </SelectContent>
        </Select>
    );
}
