'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { GroupSelectField, GroupTextField } from '../form/GroupFormFields';
import { useGroupOptions } from '../useGroupOptions';
import { ActionFooter } from './ActionFooter';

export function AddRoomPanel({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (roomTypeId: string, quantity: number) => void;
}) {
    const [roomTypeId, setRoomTypeId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const qty = Math.max(1, Number(quantity) || 1);
    const { roomTypeOptions } = useGroupOptions();

    return (
        <>
            <div className="space-y-4">
                <GroupSelectField
                    id="add-room-type"
                    label="Room Type"
                    placeholder="Select room type"
                    value={roomTypeId}
                    options={roomTypeOptions}
                    onChange={setRoomTypeId}
                />
                <GroupTextField
                    id="add-room-qty"
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={setQuantity}
                />
            </div>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Add Room',
                    disabled: !roomTypeId,
                    icon: <ArrowRight className="size-4" />,
                    onClick: () => onAdd(roomTypeId, qty),
                }}
            />
        </>
    );
}
