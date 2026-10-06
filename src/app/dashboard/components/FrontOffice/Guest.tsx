'use client';

import { getGuestInfoById } from '@/app/actions/guest';
import React, { useEffect, useState } from 'react';
import { FaBed, FaHistory, FaUser } from 'react-icons/fa';
import Activities from './dashboard/guest-management/Activities';
import GuestHistory from './dashboard/guest-management/GuestHistory';
import GuestInfo from './dashboard/guest-management/GuestInfo';
import RoomServices from './dashboard/guest-management/RoomServices';

interface GuestManagementPageProps {
    id: number;
    backButton?: React.ReactNode; // Accepts a button element
}

const GuestManagementPage = ({ id, backButton }: GuestManagementPageProps) => {
    const [activeTab, setActiveTab] = useState('guest-info');

    const [currentServices] = useState([
        {
            serviceName: 'Mini-Bar Usage',
            requestDate: '20 Jan 2025, 10:00',
            status: 'Completed',
            amount: 20,
            notes: 'N/A',
        },
        {
            serviceName: 'Laundary',
            requestDate: '21 Jan 2025, 14:00',
            status: 'In Progress',
            amount: 15,
            notes: 'N/A',
        },
        {
            serviceName: 'Room Cleaning',
            requestDate: '22 Jan 2025, 09:00',
            status: 'Scheduled',
            amount: 0,
            notes: 'Deep cleaning required due to coffee spill on carpet. Guest will be out of the room during service',
        },
        {
            serviceName: 'Gym Access',
            requestDate: '30 Jan 2025, 08:00',
            status: 'Completed',
            amount: 10,
            notes: 'N/A',
        },
    ]);

    const [foodOrders] = useState([
        {
            orderDate: '22 Jan 2025, 12:30 PM',
            itemName: 'Grilled Chicken',
            quantity: 2,
            unitPrice: 15,
            totalPrice: 30,
            specialInstructions: 'Extra spicy',
            status: 'Preparing',
            deliveryTime: '22 Jan 2025, 1:00 PM',
            staffResponsible: 'Tekenatel Franklin',
        },
        {
            orderDate: '22 Jan 2025, 1:15 PM',
            itemName: 'Caesar Salad',
            quantity: 1,
            unitPrice: 10,
            totalPrice: 10,
            specialInstructions: 'No croutons',
            status: 'Delivered',
            deliveryTime: '22 Jan 2025, 1:45 PM',
            staffResponsible: 'Saviour Jonah',
        },
    ]);

    const [miniBarItems] = useState([
        {
            itemName: 'Beer',
            quantity: 2,
            unitPrice: 10,
            totalPrice: 10,
        },
        {
            itemName: 'Snacks',
            quantity: 3,
            unitPrice: 9,
            totalPrice: 9,
        },
    ]);

    const [rentedItems] = useState([
        {
            itemName: 'Iron Box',
            rentDate: '20 Jan 2025, 10:00',
            returnDate: '20 Jan 2025, 10:00',
            status: 'Returned',
            amount: 20,
        },
        {
            itemName: 'Umbrella',
            rentDate: '21 Jan 2025, 14:00',
            returnDate: 'Pending',
            status: 'Rented',
            amount: 15,
        },
    ]);

    const [specialRequests] = useState([
        {
            requestType: 'Wake-Up Call',
            description: '6:30 AM',
            requestDate: '21 Jan 2025',
            status: 'Done',
            amount: 0,
        },
        {
            requestType: 'Travel Mgmt',
            description: 'Airport Pickup',
            requestDate: '22 Jan 2025',
            status: 'Scheduled',
            amount: 15,
        },
    ]);

    const tabs = [
        { id: 'guest-info', label: 'Guest Info', icon: FaUser },
        { id: 'room-services', label: 'Room Services', icon: FaBed },
        // { id: 'activities', label: 'Activities', icon: FaRunning },
        { id: 'guest-history', label: 'Guest History', icon: FaHistory },
    ];

    const [guest, setGuest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch guest data using useEffect
    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                // Simulating API call
                const result = await getGuestInfoById(String(id));
                console.log(result.data);
                if (result && result.data) {
                    setGuest(result.data);
                }
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGuestData();
    }, []);

    // Show loading state or error
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'Scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'Preparing':
                return 'bg-yellow-100 text-yellow-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderContent = (
        activeTab: any,
        currentServices: any,
        foodOrders: any,
        getStatusBadgeClass: any,
    ) => {
        switch (activeTab) {
            case 'guest-info':
                return <GuestInfo guest={guest.guest} />;
            case 'room-services':
                return (
                    <RoomServices
                        currentServices={currentServices}
                        foodOrders={foodOrders}
                        getStatusBadgeClass={getStatusBadgeClass}
                        miniBarItems={miniBarItems}
                        rentedItems={rentedItems}
                        specialRequests={specialRequests}
                        guest={guest}
                    />
                );
            case 'activities':
                return <Activities />;
            case 'guest-history':
                return <GuestHistory guest={guest} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-semibold">Guests</h2>
                    {backButton}
                </div>
                {/* Tabs */}
                <div className="border-b">
                    <div className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium
                  ${
                      activeTab === tab.id
                          ? 'border-blue rounded-md text-blue bg-white p-2 '
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
                            >
                                <tab.icon />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {renderContent(
                        activeTab,
                        currentServices,
                        foodOrders,
                        getStatusBadgeClass,
                    )}
                </div>
            </main>
        </div>
    );
};

export default GuestManagementPage;
