import React, { useEffect, useMemo, useState } from 'react';
import { getRoomTypesByHotelId } from '../actions/roomType';

interface PaymentMethodProps {
    data: {
        roomtype?: any;
        paymentMethod?: string;
        amountPaid?: number;
        outstanding?: number;
        nights?: number;
    };
    onChange: (newData: any) => void;
}

const paymentOptions = ['Card', 'Bank Transfer', 'Cash', 'Mobile Money'];

const PaymentMethod = ({ data, onChange }: PaymentMethodProps) => {
    const [formData, setFormData] = useState(data || {});
    const [roomType, setRoomType] = useState<any[]>([]);
    useEffect(() => {
        const fetchRoomTypes = async () => {
            const result = (await getRoomTypesByHotelId()) as any;

            if (result && result.error) {
                console.error('Error:', result.error);
            } else if (result && result.data) {
                setRoomType(result.data);
            }
        };

        fetchRoomTypes();
    }, []);

    const selectedAmount = useMemo(() => {
        const roomtypeValue = formData?.roomtype ?? data?.roomtype;
        return (
            roomType.find(
                (room) => Number(room.id) === Number(roomtypeValue),
            ) || null
        );
    }, [formData?.roomtype, data?.roomtype, roomType]);

    const outstandingAmount = useMemo(() => {
        const pricePerNight = Number(selectedAmount?.rooms?.[0]?.price ?? 0);
        const paid = Number(formData?.amountPaid ?? data?.amountPaid ?? 0);
        const nights = Number(formData?.nights ?? data?.nights ?? 1);

        const totalPrice = pricePerNight * nights;
        return Math.max(totalPrice - paid, 0);
    }, [
        selectedAmount,
        formData?.amountPaid,
        data?.amountPaid,
        formData?.nights,
        data?.nights,
    ]);

    useEffect(() => {
        setFormData(data);
    }, [data]);

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const updatedData = { ...formData, paymentMethod: value };
        setFormData(updatedData);
        onChange(updatedData);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedData = {
            ...formData,
            [name]: value,
            outstanding: Math.max(
                Number(selectedAmount?.rooms?.[0]?.price ?? 0) - Number(value),
                0,
            ),
        };
        setFormData(updatedData);
        onChange(updatedData);
    };

    return (
        <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">
                        Amount Paid
                    </label>
                    <input
                        type="number"
                        name="amountPaid"
                        value={formData.amountPaid}
                        onChange={handleInputChange}
                        className="border p-2 rounded w-full"
                        placeholder="Enter amount"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Outstanding
                    </label>
                    <input
                        type="number"
                        name="outstanding"
                        value={outstandingAmount ?? 0}
                        // onChange={handleInputChange}
                        readOnly
                        className="border p-2 rounded w-full"
                        // placeholder="Enter outstanding amount"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Payment Method
                    </label>
                    <div className="flex flex-col">
                        {paymentOptions.map((option) => (
                            <label
                                key={option}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value={option}
                                    checked={formData.paymentMethod === option}
                                    onChange={handleRadioChange}
                                    className="h-4 w-4"
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethod;
