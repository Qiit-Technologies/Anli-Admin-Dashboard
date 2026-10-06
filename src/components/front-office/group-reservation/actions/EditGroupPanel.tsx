'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { GROUP_TYPE_OPTIONS } from '../constants';
import { GroupSelectField, GroupTextField } from '../form/GroupFormFields';
import type { GroupBooking, GroupType } from '../types';
import { ActionFooter } from './ActionFooter';

export function EditGroupPanel({
    booking,
    onClose,
    onSave,
}: {
    booking: GroupBooking;
    onClose: () => void;
    onSave: (patch: {
        name: string;
        groupType: GroupType;
        contactName: string;
        contactPhone: string;
    }) => void;
}) {
    const [name, setName] = useState(booking.name);
    const [groupType, setGroupType] = useState<GroupType>(booking.groupType);
    const [contactName, setContactName] = useState(booking.contactName);
    const [contactPhone, setContactPhone] = useState(booking.contactPhone);

    return (
        <>
            <div className="space-y-4">
                <GroupTextField
                    id="edit-name"
                    label="Group Name"
                    value={name}
                    onChange={setName}
                />
                <GroupSelectField
                    id="edit-type"
                    label="Group Type"
                    value={groupType}
                    options={GROUP_TYPE_OPTIONS}
                    onChange={(value) => setGroupType(value as GroupType)}
                />
                <GroupTextField
                    id="edit-contact"
                    label="Contact Person"
                    value={contactName}
                    onChange={setContactName}
                />
                <GroupTextField
                    id="edit-phone"
                    label="Phone Number"
                    value={contactPhone}
                    onChange={setContactPhone}
                />
            </div>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Save Changes',
                    disabled: !name.trim() || !contactName.trim(),
                    icon: <ArrowRight className="size-4" />,
                    onClick: () =>
                        onSave({
                            name: name.trim(),
                            groupType,
                            contactName: contactName.trim(),
                            contactPhone,
                        }),
                }}
            />
        </>
    );
}
