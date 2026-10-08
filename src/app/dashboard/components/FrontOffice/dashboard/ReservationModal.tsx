import { createReservation, editReservation } from '@/app/actions/reservation';
import { getRoomTypesByHotelId } from '@/app/actions/roomType';
import GuestPersonalInfo from '@/app/reservation/GuestPersonalInfo';
import PaymentMethod from '@/app/reservation/PaymentMethod';
import ReservationDetails from '@/app/reservation/ReservationDetails';
import Toast from '@/components/toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineClose } from 'react-icons/ai';
import { MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';

interface NewReservationModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    roomType?: string;
    roomNumber?: string;
    date?: Date;
    guestDetails?: any;
    roomTypeId?: string;
}

export interface FormDataType {
    roomtype: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    fullName: string;
    phoneNumber?: string;
    numberOfGuests: number;
    email?: string;
    secondGuestFullName: string;
    secondGuestPhoneNumber: string;
    secondGuestType: 'adult' | 'child';
    paymentMethod: string;
    amountPaid: number;
    outstanding: number;
    nights?: number;
    gender?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    purposeOfVisit?: string;
    loyaltyTier?: string;
    loyaltyPoints?: number;
    eligibleForReward?: boolean;
    birthday?: string;
    feedbackNotes?: string;
    customerType?: string;
    emailConsent?: boolean;
    preferredContactMethod?: string;
    // services?: { name: string; price: number; notes: string; status: string }[];
}

const NewReservationModal: React.FC<NewReservationModalProps> = ({
    open,
    onClose,
    onSubmit,
    date,
    guestDetails,
    roomType,
}) => {
    const [, setErrors] = useState<any>(null);
    const router = useRouter();
    const [sectionData, setSectionData] = useState<any>(null);
    const [roomtype, setRoomType] = useState<{ id: number; name: string }[]>(
        [],
    );
    const [expandedSection, setExpandedSection] = useState(0);
    const [formData, setFormData] = useState<FormDataType>({
        roomtype: 0,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        fullName: '',
        phoneNumber: '',
        numberOfGuests: 1,
        email: '',
        secondGuestFullName: '',
        secondGuestPhoneNumber: '',
        secondGuestType: 'adult',
        paymentMethod: '',
        amountPaid: 0,
        outstanding: 0,
        nights: 0,
        gender: '',
        dateOfBirth: '',
        nationality: '',
        address: '',
        purposeOfVisit: '',
        loyaltyTier: '',
        loyaltyPoints: undefined,
        eligibleForReward: undefined,
        birthday: '',
        feedbackNotes: '',
        customerType: '',
        emailConsent: undefined,
        preferredContactMethod: '',
        // services: [{ name: '', price: 0, notes: '', status: '' }],
    });

    const selectedRoom = useMemo(() => {
        return roomtype.find((room) => room.name === roomType) || null;
    }, [roomType, roomtype]);

    useEffect(() => {
        const fetchRoomTypes = async () => {
            const result = (await getRoomTypesByHotelId()) as any;
            if (result && result.error) {
                console.log('Error:', result.error);
            } else if (result && result.data) {
                setRoomType(result.data);
            }
        };
        fetchRoomTypes();
    }, []);

    useEffect(() => {
        if ((open && guestDetails) || date) {
            setFormData((prevData) => ({
                ...prevData,
                roomtype: guestDetails?.roomType?.name
                    ? guestDetails.roomType.name
                    : (selectedRoom?.id ?? 0),
                fullName: guestDetails?.fullName || '',
                phoneNumber: guestDetails?.phoneNumber ?? '',
                email: guestDetails?.email || '',

                startDate: guestDetails?.startDate
                    ? new Date(guestDetails?.startDate)
                          .toISOString()
                          .split('T')[0]
                    : new Date(date ?? '').toISOString().split('T')[0],
                endDate: guestDetails?.endDate
                    ? new Date(guestDetails?.endDate)
                          .toISOString()
                          .split('T')[0]
                    : new Date(date ?? '').toISOString().split('T')[0],
                secondGuestFullName: guestDetails?.secondGuestFullName || '',
                secondGuestPhoneNumber:
                    guestDetails?.secondGuestPhoneNumber || '',
                secondGuestType: guestDetails?.secondGuestType || 'adult',
                startTime: guestDetails?.startTime || '',
                endTime: guestDetails?.endTime || '',
                amountPaid: guestDetails?.amountPaid,
                outstanding: guestDetails?.outstanding,
                paymentMethod: guestDetails?.paymentMethod,
                numberOfGuests: guestDetails?.numberOfGuests,
                gender: guestDetails?.gender || '',
                dateOfBirth: guestDetails?.dateOfBirth || '',
                nationality: guestDetails?.nationality || '',
                address: guestDetails?.address || '',
                purposeOfVisit: guestDetails?.purposeOfVisit || '',
                loyaltyTier: guestDetails?.loyaltyTier || '',
                loyaltyPoints:
                    guestDetails?.loyaltyPoints !== undefined
                        ? guestDetails.loyaltyPoints
                        : undefined,
                eligibleForReward:
                    guestDetails?.eligibleForReward !== undefined
                        ? guestDetails.eligibleForReward
                        : undefined,
                birthday: guestDetails?.birthday || '',
                feedbackNotes: guestDetails?.feedbackNotes || '',
                customerType: guestDetails?.customerType || '',
                emailConsent:
                    guestDetails?.emailConsent !== undefined
                        ? guestDetails.emailConsent
                        : undefined,
                preferredContactMethod:
                    guestDetails?.preferredContactMethod || '',
            }));
        }
    }, [open, guestDetails, selectedRoom]);

    if (!open) return null;

    const components = [
        {
            component: (
                <ReservationDetails data={formData} onChange={setFormData} />
            ),
            label: 'Reservation Details',
            validate: () => {
                const newErrors: any = {};
                if (!formData.roomtype)
                    newErrors.roomtype = 'Room type is required.';
                if (!formData.startDate)
                    newErrors.startDate = 'Start date is required.';
                if (!formData.endDate)
                    newErrors.endDate = 'End date is required.';
                return newErrors;
            },
        },
        {
            component: (
                <GuestPersonalInfo data={formData} onChange={setFormData} />
            ),
            label: 'Guest Personal Info',
            validate: () => {
                const newErrors: any = {};
                if (!formData.fullName)
                    newErrors.fullName = 'Full name is required.';
                if (!formData.phoneNumber)
                    newErrors.phoneNumber = 'Phone number is required.';
                if (!formData.email) newErrors.email = 'Email is required.';
                return newErrors;
            },
        },
        {
            component: <PaymentMethod data={formData} onChange={setFormData} />,
            label: 'Payment Method',
            validate: () => {
                const newErrors: any = {};
                if (!formData.paymentMethod)
                    newErrors.paymentMethod = 'Payment method is required.';
                if (!formData.amountPaid)
                    newErrors.amountPaid = 'Amount is required.';

                return newErrors;
            },
        },
        // {
        // component: (
        // <AdditionalServices
        //     data={formData.services}
        //     onChange={(updatedServices) =>
        //         setFormData((prevData) => ({
        //             ...prevData,
        //             services: updatedServices,
        //         }))
        //     }
        // />
        // ),
        // label: 'Additional Services',
        // },
    ];

    const validateSection = (index: number) => {
        const newErrors = (components[index].validate as any)
            ? components[index].validate()
            : {};
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleToggleSection = (index: any) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    const updateFormData = () => {
        setFormData((prevData) => ({
            ...prevData,
            ...sectionData,
        }));
        setSectionData(null);
    };

    const handleNext = (index: number) => {
        if (index < components.length - 1) {
            updateFormData();
            setExpandedSection(index + 1);
        }
    };

    const handleBack = (index: number) => {
        if (index > 0) {
            setExpandedSection(index - 1);
        }
    };

    const handleSubmit = async () => {
        let valid = true;
        components.forEach((_, index) => {
            if (!validateSection(index)) valid = false;
        });

        if (!valid) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please fill in all required fields"
                    type="error"
                />
            ));
            return;
        }
        updateFormData();

        try {
            let response;
            if (guestDetails) {
                response = await editReservation(guestDetails.id, formData);
            } else {
                response = await createReservation(formData);
            }
            if (typeof response.message === 'string') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`${response.message}`}
                        type="success"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="An unexpected error occurred"
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={`Failed to ${guestDetails ? 'edit' : 'create'} reservation. Please try again.`}
                    type="error"
                />
            ));
            console.error('Error submitting reservation:', error);
        }
        onSubmit(formData);
        onClose();
        router.refresh();
    };

    const isLastSection = expandedSection === components.length - 1;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* {errors && <p className="text-red-500">{errors}</p>} */}

                    <div className="relative bg-white p-6 shadow-lg rounded-lg w-[70vw]  max-w-[70vw] max-h-[80vh] overflow-y-auto mx-4">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                            aria-label="Close"
                        >
                            <AiOutlineClose size={24} />
                        </button>

                        <h1 className="text-xl font-bold mb-4">
                            New Reservation Form
                        </h1>
                        {components.map((item, index) => (
                            <div key={index} className="mb-4">
                                <button
                                    className="w-full bg-gray-100 text-left p-3 rounded-md shadow-sm mb-2 flex items-center gap-4"
                                    onClick={() => handleToggleSection(index)}
                                >
                                    {formData[
                                        item.label as keyof typeof formData
                                    ] ? (
                                        <MdCheckCircle
                                            size={24}
                                            className="text-blue"
                                        />
                                    ) : (
                                        <MdRadioButtonUnchecked
                                            size={24}
                                            className="text-gray-400"
                                        />
                                    )}
                                    {item.label}
                                </button>

                                <AnimatePresence>
                                    {expandedSection === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: 'auto',
                                                opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white p-4 shadow-md rounded-md"
                                        >
                                            {item.component}
                                            <div className="flex justify-between mt-4">
                                                <button
                                                    onClick={() =>
                                                        handleBack(index)
                                                    }
                                                    className={`bg-[#E6F2FC] text-blue text-xs font-bold px-8 py-2 rounded ${index === 0 && 'opacity-50 cursor-not-allowed'}`}
                                                    disabled={index === 0}
                                                >
                                                    Back to{' '}
                                                    {index > 0
                                                        ? components[index - 1]
                                                              .label
                                                        : ''}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (isLastSection) {
                                                            handleSubmit();
                                                        } else {
                                                            handleNext(index);
                                                        }
                                                    }}
                                                    className={`bg-orion-blue text-white px-8 py-2 text-xs font-bold rounded     
                                                    `}
                                                >
                                                    {isLastSection
                                                        ? guestDetails
                                                            ? 'Update Reservation'
                                                            : 'Submit Reservation'
                                                        : `Next: ${components[index + 1]?.label}`}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewReservationModal;
