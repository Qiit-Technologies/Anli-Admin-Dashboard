// 'use client';

const FacilityBookingCalendar = () => {
    return <div>FacilityBookingCalendar</div>;
};

export default FacilityBookingCalendar;
// import type { Facility, MemberBooking } from '@/types/membership/membership';
// import {
//     addDays,
//     addHours,
//     format,
//     isSameDay,
//     isWithinInterval,
//     startOfDay,
// } from 'date-fns';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { useMemo, useState } from 'react';

// interface FacilityBookingCalendarProps {
//     bookings: MemberBooking[];
//     facilities: Facility[];
//     selectedFacility?: Facility;
//     onFacilityChange?: (facility: Facility) => void;
//     onBookingClick?: (
//         booking: MemberBooking | null,
//         date: Date,
//         timeSlot: number,
//     ) => void;
// }

// interface BookingCellProps {
//     booking?: MemberBooking;
//     onClick: () => void;
//     isStart?: boolean;
//     isEnd?: boolean;
//     isMiddle?: boolean;
//     isEmpty?: boolean;
// }

// const DAYS_TO_SHOW = 7;
// const START_HOUR = 6; // 6 AM
// const END_HOUR = 14; // 2 PM (exclusive)
// const HOURS_TO_SHOW = END_HOUR - START_HOUR; // 8 hours: 6AM-1PM

// // Booking Cell Component (fixed styling)
// function BookingCell({
//     booking,
//     onClick,
//     isStart,
//     isEnd,
//     isMiddle,
//     isEmpty = false,
// }: BookingCellProps) {
//     const getBgColor = () => {
//         if (isEmpty || !booking) return '';

//         switch (booking.status) {
//             case 'confirmed':
//                 return 'bg-green-100 border-l-green-600 text-black';
//             case 'pending':
//                 return 'bg-orange-100 border-l-orange-600 text-black';
//             case 'cancelled':
//                 return 'bg-red-100 border-l-red-600 text-black';
//             case 'completed':
//                 return 'bg-blue-100 border-l-blue-600 text-black';
//             default:
//                 return 'bg-gray-100 border-l-gray-600 text-black';
//         }
//     };

//     // For spanning pills, always show content and use full rounded corners
//     const getRoundedClasses = () => {
//         return 'rounded-3xl'; // Always fully rounded for spanning pills
//     };

//     const getBorderClasses = () => {
//         return 'border-l-8'; // Always show left border for spanning pills
//     };

//     if (isEmpty || !booking) {
//         return (
//             <button
//                 onClick={onClick}
//                 className="relative w-full h-full transition-colors cursor-pointer flex items-center justify-center bg-white text-gray-500 border border-gray-200 hover:bg-gray-100 "
//             />
//         );
//     }

//     return (
//         <button
//             onClick={onClick}
//             className={`relative w-full h-full transition-colors cursor-pointer flex items-center justify-between p-2 gap-2 text-sm ${getBgColor()} ${getRoundedClasses()} ${getBorderClasses()}`}
//         >
//             <div className="flex items-center">
//                 <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold mr-2">
//                     {booking.member.firstName.charAt(0)}
//                 </div>
//                 <span className="truncate">
//                     {booking.member.firstName} {booking.member.lastName}
//                 </span>
//             </div>
//             <div className="flex items-center">
//                 <span className="text-xs opacity-75 mr-2">
//                     {format(new Date(booking.startTime), 'HH:mm')} -{' '}
//                     {format(new Date(booking.endTime), 'HH:mm')}
//                 </span>
//             </div>
//         </button>
//     );
// }

// // Time Header Component (fixed time format)
// function TimeHeader() {
//     const timeSlots = useMemo(() => {
//         const slots = [];
//         for (let hour = START_HOUR; hour < END_HOUR; hour++) {
//             slots.push({
//                 hour,
//                 label: format(
//                     new Date().setHours(hour, 0, 0, 0),
//                     'ha', // Fixed: Use 'ha' for proper 12-hour format (6a, 7a, 1p, 2p)
//                 ),
//             });
//         }
//         return slots;
//     }, []);

//     return (
//         <thead>
//             <tr>
//                 <th className="sticky left-0 bg-slate-700 z-20 w-20"></th>
//                 {timeSlots.map((slot) => (
//                     <th
//                         key={slot.hour}
//                         className="bg-gray-200 text-gray-700 p-3 text-center min-w-32 font-normal text-sm"
//                     >
//                         {slot.label}
//                     </th>
//                 ))}
//             </tr>
//         </thead>
//     );
// }

// // Date Row Component - Fixed with proper spanning logic
// function DateRow({
//     date,
//     bookings,
//     onCellClick,
// }: {
//     date: Date;
//     bookings: MemberBooking[];
//     onCellClick: (
//         booking: MemberBooking | null,
//         date: Date,
//         hour: number,
//     ) => void;
// }) {
//     // Filter bookings for this specific date - REVERTED TO ORIGINAL
//     const dateBookings = useMemo(() => {
//         return bookings.filter((booking) => {
//             const bookingStart = new Date(booking.startTime);
//             const bookingEnd = new Date(booking.endTime);
//             return (
//                 isSameDay(bookingStart, date) ||
//                 isSameDay(bookingEnd, date) ||
//                 (bookingStart <= startOfDay(date) &&
//                     bookingEnd >= addDays(startOfDay(date), 1))
//             );
//         });
//     }, [bookings, date]);

//     const getBookingForTimeSlot = (hour: number) => {
//         const slotStart = addHours(startOfDay(date), hour);
//         const slotEnd = addHours(slotStart, 1);

//         return dateBookings.find((booking) => {
//             const bookingStart = new Date(booking.startTime);
//             const bookingEnd = new Date(booking.endTime);

//             return (
//                 isWithinInterval(slotStart, {
//                     start: bookingStart,
//                     end: bookingEnd,
//                 }) ||
//                 isWithinInterval(slotEnd, {
//                     start: bookingStart,
//                     end: bookingEnd,
//                 }) ||
//                 (bookingStart <= slotStart && bookingEnd >= slotEnd)
//             );
//         });
//     };

//     const isBookingStart = (booking: MemberBooking, hour: number) => {
//         const slotStart = addHours(startOfDay(date), hour);
//         const bookingStart = new Date(booking.startTime);
//         return Math.abs(slotStart.getTime() - bookingStart.getTime()) < 3600000;
//     };

//     return (
//         <tr>
//             <td className="sticky left-0 bg-slate-700 text-white z-10 w-20 p-4">
//                 <div className="text-center">
//                     <div className="text-sm font-medium">
//                         {format(date, 'EEE')}
//                     </div>
//                     <div className="text-lg font-bold">{format(date, 'd')}</div>
//                 </div>
//             </td>
//             {(() => {
//                 const cells = [];
//                 let hourIndex = 0;

//                 while (hourIndex < HOURS_TO_SHOW) {
//                     const hour = hourIndex + START_HOUR;
//                     const booking = getBookingForTimeSlot(hour);

//                     if (booking) {
//                         const isFirstHourOfBooking = isBookingStart(
//                             booking,
//                             hour,
//                         );
//                         const isFirstVisibleHourOfOngoingBooking =
//                             hourIndex === 0;

//                         if (
//                             isFirstHourOfBooking ||
//                             isFirstVisibleHourOfOngoingBooking
//                         ) {
//                             // Calculate span for this booking
//                             const bookingStart = new Date(booking.startTime);
//                             const bookingEnd = new Date(booking.endTime);
//                             let span = 0;
//                             let tempIndex = hourIndex;

//                             while (tempIndex < HOURS_TO_SHOW) {
//                                 const tempHour = tempIndex + START_HOUR;
//                                 const tempSlotStart = addHours(
//                                     startOfDay(date),
//                                     tempHour,
//                                 );
//                                 const tempSlotEnd = addHours(tempSlotStart, 1);

//                                 // Check if this slot is within the booking time
//                                 if (
//                                     bookingStart < tempSlotEnd &&
//                                     bookingEnd > tempSlotStart
//                                 ) {
//                                     span++;
//                                     tempIndex++;
//                                 } else {
//                                     break;
//                                 }
//                             }

//                             cells.push(
//                                 <td
//                                     key={`booking-${booking.id}-${hour}`}
//                                     className="bg-gray-50 min-w-32 h-16 m-0 relative p-0"
//                                     colSpan={span} // Use colSpan instead of gridColumn
//                                 >
//                                     <BookingCell
//                                         booking={booking}
//                                         onClick={() =>
//                                             onCellClick(booking, date, hour)
//                                         }
//                                         isStart={true}
//                                         isEnd={false}
//                                         isMiddle={false}
//                                         isEmpty={false}
//                                     />
//                                 </td>,
//                             );
//                             hourIndex += span;
//                         } else {
//                             hourIndex++;
//                         }
//                     } else {
//                         // Empty cell
//                         cells.push(
//                             <td
//                                 key={`empty-${hour}`}
//                                 className="bg-gray-50 min-w-32 h-16 m-0 relative p-0"
//                             >
//                                 <BookingCell
//                                     onClick={() =>
//                                         onCellClick(null, date, hour)
//                                     }
//                                     isEmpty={true}
//                                 />
//                             </td>,
//                         );
//                         hourIndex++;
//                     }
//                 }

//                 return cells;
//             })()}
//         </tr>
//     );
// }

// // Navigation Component
// function CalendarNavigation({
//     currentDate,
//     facilities,
//     selectedFacility,
//     onDateChange,
//     onFacilityChange,
// }: {
//     currentDate: Date;
//     facilities: Facility[];
//     selectedFacility?: Facility;
//     onDateChange: (days: number) => void;
//     onFacilityChange?: (facility: Facility) => void;
// }) {
//     return (
//         <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-4">
//                 <select
//                     className="border rounded px-3 py-2 text-sm"
//                     value={selectedFacility?.id || 'all'}
//                     onChange={(e) => {
//                         if (e.target.value === 'all') {
//                             onFacilityChange?.(undefined as any);
//                         } else {
//                             const facility = facilities.find(
//                                 (f) => f.id === Number.parseInt(e.target.value),
//                             );
//                             if (facility) onFacilityChange?.(facility);
//                         }
//                     }}
//                 >
//                     <option value="all">All Facilities</option>
//                     {facilities.map((facility) => (
//                         <option key={facility.id} value={facility.id}>
//                             {facility.name}
//                         </option>
//                     ))}
//                 </select>

//                 <div className="flex items-center gap-2">
//                     <button
//                         className="border rounded p-2 hover:bg-gray-50"
//                         onClick={() => onDateChange(-7)}
//                     >
//                         <ChevronLeft className="h-4 w-4" />
//                     </button>
//                     <span className="font-medium px-4">
//                         {format(currentDate, 'MMMM yyyy')}
//                     </span>
//                     <button
//                         className="border rounded p-2 hover:bg-gray-50"
//                         onClick={() => onDateChange(7)}
//                     >
//                         <ChevronRight className="h-4 w-4" />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // Main Component
// const FacilityBookingCalendar = ({
//     bookings,
//     facilities,
//     selectedFacility,
//     onFacilityChange,
//     onBookingClick,
// }: FacilityBookingCalendarProps) => {
//     const [currentDate, setCurrentDate] = useState(new Date());

//     // Generate dates for the current view
//     const dates = useMemo(() => {
//         const startDate = startOfDay(currentDate);
//         return Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
//             addDays(startDate, i),
//         );
//     }, [currentDate]);

//     // Filter bookings by selected facility
//     const facilityBookings = useMemo(() => {
//         if (!selectedFacility) return bookings;
//         return bookings.filter(
//             (booking) => booking.facility.id === selectedFacility.id,
//         );
//     }, [bookings, selectedFacility]);

//     const moveDate = (days: number) => {
//         setCurrentDate((prevDate) => {
//             const newDate = new Date(prevDate);
//             newDate.setDate(newDate.getDate() + days);
//             return newDate;
//         });
//     };

//     const handleCellClick = (
//         booking: MemberBooking | null,
//         date: Date,
//         hour: number,
//     ) => {
//         onBookingClick?.(booking, date, hour);
//     };

//     return (
//         <div className="w-full bg-white">
//             <CalendarNavigation
//                 currentDate={currentDate}
//                 facilities={facilities}
//                 selectedFacility={selectedFacility}
//                 onDateChange={moveDate}
//                 onFacilityChange={onFacilityChange}
//             />

//             <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
//                 <div className="overflow-x-auto">
//                     <table className="w-full border-collapse">
//                         <TimeHeader />
//                         <tbody>
//                             {dates.map((date) => (
//                                 <DateRow
//                                     key={date.toISOString()}
//                                     date={date}
//                                     bookings={facilityBookings}
//                                     onCellClick={handleCellClick}
//                                 />
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default FacilityBookingCalendar;
