'use client';

import { InputField, SelectField } from '@/components/common/Form';
import {
    EmergencyContact,
    FormColumn,
    MedicalInfo,
    NextOfKin,
    Refree,
} from './index';
import { Dispatch, SetStateAction, useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// type Props = {
//     formData: Partial<Employee>;
//     handleInputChange: (field: keyof Employee, value: any) => void;
// };

type Prop = {
    refrees: Refree[];
    setRefrees: Dispatch<SetStateAction<Refree[]>>;
    medicalInfo: MedicalInfo;
    setMedicalInfo: Dispatch<SetStateAction<MedicalInfo>>;
    nextOfKin: NextOfKin;
    setNextOfKin: Dispatch<SetStateAction<NextOfKin>>;
    emergencyContact: EmergencyContact;
    setEmergencyContact: Dispatch<SetStateAction<EmergencyContact>>;
};

const Step4 = ({
    refrees,
    setRefrees,
    medicalInfo,
    setMedicalInfo,
    nextOfKin,
    setNextOfKin,
    emergencyContact,
    setEmergencyContact,
}: Prop) => {
    const [refree, setRefree] = useState<Refree>({
        name: '',
        phone: '',
        profession: '',
        occupation: '',
    });

    const [isRefreesOpen, setRefreesOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4 border rounded-lg p-4">
            <span className="text-sm font-semibold">
                Emergency Contact Information
            </span>
            <FormColumn>
                <InputField
                    id="name"
                    label="Contact Name"
                    type="text"
                    name="name"
                    value={emergencyContact.name}
                    onChange={(e) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            name: e.target.value,
                        });
                    }}
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="phone"
                    label="Contact Phone"
                    type="text"
                    name="phone"
                    value={emergencyContact.phone}
                    onChange={(e) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            phone: e.target.value,
                        });
                    }}
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="email"
                    label="Contact Email"
                    type="text"
                    name="email"
                    value={emergencyContact.email}
                    onChange={(e) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            email: e.target.value,
                        });
                    }}
                />
            </FormColumn>
            <FormColumn>
                <SelectField
                    id="relationship"
                    label="Relationship"
                    name="relationship"
                    value={emergencyContact.relationship}
                    onValueChange={(value) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            relationship: value,
                        });
                    }}
                    options={[
                        { value: 'Parent', label: 'Parent' },
                        { value: 'Sibling', label: 'Sibling' },
                        { value: 'Spouse', label: 'Spouse' },
                        { value: 'Child', label: 'Child' },
                        { value: 'Other', label: 'Other' },
                    ]}
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="address"
                    label="Address"
                    type="text"
                    name="address"
                    value={emergencyContact.address}
                    onChange={(e) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            address: e.target.value,
                        });
                    }}
                />
            </FormColumn>

            <>
                <p className="font-bold text-lg">Next of kin</p>
                <FormColumn>
                    <InputField
                        id="name"
                        label="Name"
                        type="text"
                        name="name"
                        value={nextOfKin.name}
                        onChange={(e) => {
                            setNextOfKin({
                                ...nextOfKin,
                                name: e.target.value,
                            });
                        }}
                    />
                </FormColumn>

                <FormColumn>
                    <InputField
                        id="phone"
                        label="Phone"
                        type="text"
                        name="phone"
                        value={nextOfKin.phone}
                        onChange={(e) => {
                            setNextOfKin({
                                ...nextOfKin,
                                phone: e.target.value,
                            });
                        }}
                    />
                </FormColumn>

                <FormColumn>
                    <InputField
                        id="email"
                        label="Email"
                        type="text"
                        name="email"
                        value={nextOfKin.email}
                        onChange={(e) => {
                            setNextOfKin({
                                ...nextOfKin,
                                email: e.target.value,
                            });
                        }}
                    />
                </FormColumn>

                <FormColumn>
                    <SelectField
                        id="relationship"
                        label="Relationship"
                        name="relationship"
                        value={nextOfKin.relationship}
                        onValueChange={(value) => {
                            setNextOfKin({
                                ...nextOfKin,
                                relationship: value,
                            });
                        }}
                        options={[
                            { value: 'Parent', label: 'Parent' },
                            { value: 'Sibling', label: 'Sibling' },
                            { value: 'Spouse', label: 'Spouse' },
                            { value: 'Child', label: 'Child' },
                            { value: 'Other', label: 'Other' },
                        ]}
                    />
                </FormColumn>

                <FormColumn>
                    <InputField
                        id="address"
                        label="Address"
                        type="text"
                        name="address"
                        value={nextOfKin.address}
                        onChange={(e) => {
                            setNextOfKin({
                                ...nextOfKin,
                                address: e.target.value,
                            });
                        }}
                    />
                </FormColumn>
            </>

            <>
                <p className="font-bold text-lg">Medical Information</p>
                <FormColumn>
                    <InputField
                        id="bloodGroup"
                        label="Blood Group"
                        type="text"
                        name="bloodGroup"
                        value={medicalInfo.bloodGroup}
                        onChange={(e) => {
                            setMedicalInfo({
                                ...medicalInfo,
                                bloodGroup: e.target.value,
                            });
                        }}
                    />
                </FormColumn>

                <FormColumn>
                    <InputField
                        id="genotype"
                        label="Genotype"
                        type="text"
                        name="genotype"
                        value={medicalInfo.genotype}
                        onChange={(e) => {
                            setMedicalInfo({
                                ...medicalInfo,
                                genotype: e.target.value,
                            });
                        }}
                    />
                </FormColumn>

                <FormColumn>
                    <InputField
                        id="allergy"
                        label="Allergy"
                        type="text"
                        name="allergy"
                        value={medicalInfo.allergy}
                        onChange={(e) => {
                            setMedicalInfo({
                                ...medicalInfo,
                                allergy: e.target.value,
                            });
                        }}
                    />
                </FormColumn>
            </>

            <div className="flex flex-row justify-between items-center">
                <p className="font-bold text-lg">Refree</p>
                {!isRefreesOpen ? (
                    <PlusIcon
                        color="#000"
                        className="cursor-pointer"
                        onClick={() => setRefreesOpen(!isRefreesOpen)}
                    />
                ) : (
                    <MinusIcon
                        color="#000"
                        className="cursor-pointer"
                        onClick={() => setRefreesOpen(!isRefreesOpen)}
                    />
                )}
            </div>
            <table>
                <thead>
                    <tr>
                        <td>Phone</td>
                        <td>Profession</td>
                        <td>Occupation</td>
                        <td>Name</td>
                    </tr>
                </thead>
                <tbody>
                    {refrees?.map((refree: Refree, i) => (
                        <tr key={i}>
                            <td>{refree.phone}</td>
                            <td>{refree.profession}</td>
                            <td>{refree.occupation}</td>
                            <td>{refree.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isRefreesOpen && (
                <>
                    <FormColumn>
                        <InputField
                            id="name"
                            label="Name"
                            type="text"
                            name="name"
                            value={refree.name}
                            onChange={(e) => {
                                setRefree((refree) => ({
                                    ...refree,
                                    name: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>

                    <FormColumn>
                        <InputField
                            id="phone"
                            label="Phone"
                            type="text"
                            name="phone"
                            value={refree.phone}
                            onChange={(e) => {
                                setRefree((refree) => ({
                                    ...refree,
                                    phone: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>

                    <FormColumn>
                        <InputField
                            id="profession"
                            label="Designation"
                            type="text"
                            name="profession"
                            value={refree.profession}
                            onChange={(e) => {
                                setRefree((refree) => ({
                                    ...refree,
                                    profession: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>

                    <FormColumn>
                        <InputField
                            id="occupation"
                            label="Occupation"
                            type="text"
                            name="occupation"
                            value={refree.occupation}
                            onChange={(e) => {
                                setRefree((refree) => ({
                                    ...refree,
                                    occupation: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>

                    <Button
                        className="bg-orion-blue hover:bg-orion-blue"
                        onClick={() => {
                            setRefrees([...refrees, refree]);
                            setRefree({
                                name: '',
                                phone: '',
                                profession: '',
                                occupation: '',
                            });
                            setRefreesOpen(false);
                        }}
                    >
                        Add refree
                    </Button>
                </>
            )}
        </div>
    );
};

export default Step4;
