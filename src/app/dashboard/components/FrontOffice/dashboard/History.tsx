import { getNights } from '@/lib/helpers';
import { Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { IoIosMan } from 'react-icons/io';
import { LuHotel } from 'react-icons/lu';

interface HistoryProps {
    reservation: any;
}

export default function History({ reservation }: HistoryProps) {
    return (
        // <Card
        //     key={reservation.id}
        //     className="w-full max-w-md p-2 shadow-lg rounded-md"
        // >
        //     <CardHeader className="flex gap-2">
        //         <MdImage className="w-10 h-10" />
        //         <div className="flex flex-col items-start">
        //             <span className="text-xl font-bold">
        //                 {reservation.fullName}
        //             </span>
        //             <span className="text-sm text-gray-500">
        //                 {reservation.phoneNumber}
        //             </span>
        //         </div>
        //     </CardHeader>

        //     <Divider />

        //     <CardBody className="flex flex-col gap-4">
        //         <div className="flex w-full bg-slate-50 text-center items-center rounded-md px-2">
        //             <div className="flex flex-1 flex-col py-2">
        //                 <span>
        //                     {new Date(reservation.startDate).toLocaleDateString(
        //                         'en-US',
        //                         {
        //                             day: 'numeric',
        //                             month: 'long',
        //                             year: 'numeric',
        //                         },
        //                     )}
        //                 </span>
        //                 <span>{reservation.startTime}</span>
        //             </div>
        //             <div className="flex flex-col bg-slate-200 p-1 py-2">
        //                 <span className="text-xl font-bold">
        //                     {getNights(
        //                         reservation.startDate,
        //                         reservation.endDate,
        //                     )}
        //                 </span>
        //                 <span className="text-sm">nights</span>
        //             </div>
        //             <div className="flex flex-1 flex-col py-2">
        //                 <span>
        //                     {' '}
        //                     {new Date(reservation.endDate).toLocaleDateString(
        //                         'en-US',
        //                         {
        //                             day: 'numeric',
        //                             month: 'long',
        //                             year: 'numeric',
        //                         },
        //                     )}
        //                 </span>
        //                 <span>{reservation.endTime}</span>
        //             </div>
        //         </div>

        //         <div className="flex justify-between items-center">
        //             <div className="flex flex-col">
        //                 <span className="font-bold">Booking Date</span>
        //                 <span className="text-slate-600">
        //                     {new Date(reservation.createdAt).toLocaleDateString(
        //                         'en-US',
        //                         {
        //                             day: 'numeric',
        //                             month: 'long',
        //                             year: 'numeric',
        //                         },
        //                     )}
        //                 </span>
        //             </div>
        //             <div className="flex gap-1 text-slate-600">
        //                 <div className="flex items-center gap-1">
        //                     <IoIosMan />
        //                     <span>{reservation.numberOfGuests}</span>
        //                 </div>
        //                 <div className="flex items-center gap-1">
        //                     <Icon icon="vaadin:child" />
        //                     <span>0</span>
        //                 </div>
        //             </div>
        //         </div>

        //         <div className="flex justify-between items-center">
        //             <div className="flex flex-col">
        //                 <span className="font-bold">Room / Rate Type</span>
        //                 <span className="text-slate-600">
        //                     101 / Bed & Breakfast Rate
        //                 </span>
        //             </div>
        //             <div className="text-blue-600">Confirm Booking</div>
        //         </div>

        //         <div className="flex flex-col text-slate-600 pt-4">
        //             <div className="flex justify-between items-center">
        //                 <span>Total</span>
        //                 <span>
        //                     ₦ {reservation.amountPaid + reservation.outstanding}
        //                 </span>
        //             </div>
        //             <div className="flex justify-between items-center">
        //                 <span>Paid</span>
        //                 <span>₦ {reservation.amountPaid}</span>
        //             </div>
        //             <div className="flex justify-between items-center text-red-400">
        //                 <span>Balance</span>
        //                 <span>
        //                     ₦{' '}
        //                     {reservation.amountPaid +
        //                         reservation.outstanding -
        //                         reservation.amountPaid}
        //                 </span>
        //             </div>
        //         </div>
        //     </CardBody>

        //     <Divider />

        //     <CardFooter className="flex justify-between items-center">
        //         <div className="flex items-center gap-4 text-slate-500">
        //             <IoPrintOutline className="w-6 h-6" />
        //             <GoChecklist className="w-6 h-6" />
        //             <IoFastFoodOutline className="w-6 h-6" />
        //         </div>
        //         <Button
        //             color="primary"
        //             size="lg"
        //             className="rounded-md capitalize bg-gray-400 cursor-not-allowed opacity-50"
        //             disabled
        //         >
        //             Check-out
        //         </Button>
        //     </CardFooter>
        // </Card>

        <Card
            key={reservation.id}
            className="w-full max-w-80 p-1 shadow-md rounded-md text-sm"
        >
            <CardHeader className="py-2 px-2 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-sm text-white bg-brand flex items-center justify-center">
                        <LuHotel className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-sm leading-none">
                            {reservation.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                            {reservation.phoneNumber}
                        </div>
                    </div>
                </div>
                <div className="flex gap-1 text-base text-slate-600">
                    <div className="flex items-center">
                        <IoIosMan className="mr-1" />
                        {reservation.numberOfGuests}
                    </div>
                    <div className="flex items-center ml-2">
                        <Icon icon="vaadin:child" className="mr-1" />0
                    </div>
                </div>
            </CardHeader>

            <Divider />

            <CardBody className="py-1 px-2 flex flex-col gap-1">
                {/* Date section - more compact */}
                <div className="flex w-full bg-slate-50 my-1 items-center rounded-md text-sm">
                    <div className="flex-1 text-center py-1">
                        <div>
                            {new Date(reservation.startDate).toLocaleDateString(
                                'en-US',
                                {
                                    month: 'short',
                                    day: 'numeric',
                                },
                            )}
                        </div>
                        <div>{reservation.startTime}</div>
                    </div>
                    <div className="bg-slate-200 px-2 py-1 flex flex-col items-center">
                        <span className="font-bold">
                            {getNights(
                                reservation.startDate,
                                reservation.endDate,
                            )}
                        </span>
                        <span className="text-xs">nights</span>
                    </div>
                    <div className="flex-1 text-center py-1">
                        <div>
                            {new Date(reservation.endDate).toLocaleDateString(
                                'en-US',
                                {
                                    month: 'short',
                                    day: 'numeric',
                                },
                            )}
                        </div>
                        <div>{reservation.endTime}</div>
                    </div>
                </div>

                <Divider className="bg-gray-300" />

                {/* Room info and financial summary */}
                <div className="grid grid-cols-2 gap-1 text-sm">
                    <div>
                        <div className="font-bold">Room / Type</div>
                        <div className="text-muted-foreground">
                            {reservation?.roomNumber} /{' '}
                            {reservation?.roomType?.name}
                        </div>
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="font-bold ml-auto">Booked</div>
                        <div className="text-muted-foreground ml-auto">
                            {new Date(reservation.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                },
                            )}
                        </div>
                    </div>
                </div>

                <Divider className="bg-gray-300" />

                {/* Financial info */}
                <div className="flex justify-between text-sm mt-1">
                    <div className="flex gap-3">
                        <div>
                            <div className="text-slate-600">Total</div>
                            <div className="font-bold">
                                ₦{' '}
                                {reservation.amountPaid +
                                    reservation.outstanding}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-600">Paid</div>
                            <div className="font-bold">
                                ₦ {reservation.amountPaid}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-slate-600">Balance</div>
                        <div className="font-bold text-red-400">
                            ₦ {reservation.outstanding}
                        </div>
                    </div>
                </div>
            </CardBody>
            <Divider className="bg-gray-300" />
            {/* <CardFooter className="py-2 px-2 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-500">
                <button
                    className="border p-1 rounded-sm border-slate-300"
                    onClick={() => setIsReservationOpen(true)}
                >
                    <FiEdit className="w-5 h-5 cursor-pointer" />
                </button>
                <button
                    className="border p-1 rounded-sm border-slate-300"
                   
                >
                    <AiOutlineDelete className="w-5 h-5 cursor-pointer" />
                </button>
            </div>
            <Button
                color="primary"
                size="lg"
                className="rounded-sm h-8 shadow-none bg-brand capitalize text-sm px-2 py-1"
                disabled
            >
                Check-Out
            </Button>
        </CardFooter> */}
        </Card>
    );
}
