import { MultiStepForm } from '@/components/front-office/common/Form/MultiStepFrom';
import { StepperDialog } from '@/components/front-office/common/Form/StepperDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNights } from '@/lib/helpers';
import { Card, CardBody, CardFooter, CardHeader, Divider } from '@heroui/react';
import { Baby, Edit, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { LuHotel } from 'react-icons/lu';
import CheckOutModal from './CheckOutCard';
import DeleteModal from './DeleteModal';
import NewReservationModal from './ReservationModal';

const formatAmount = (value: number | undefined | null) =>
    new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

interface CheckedInProps {
    reservation: any;
    handleSubmit: any;
    onDeleteSuccess?: any;
}

export default function CheckedIn({
    reservation,
    handleSubmit,
    onDeleteSuccess,
}: CheckedInProps) {
    const [isCheckOutOpen, setIsCheckOutOpen] = useState<boolean>(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<
        number | null
    >(null);
    const [reservationOpen, setReservationOpen] = useState(false);

    const handleFormSubmit = () => {};

    const handleDeleteSuccess = (deletedId: number) => {
        onDeleteSuccess(deletedId);
    };
    const handleCheckOut = () => {
        if (reservation) {
            handleSubmit(reservation.id);
        } else {
            setIsCheckOutOpen(true);
        }
    };
    return (
        <>
            <Card
                key={reservation.id}
                className="w-full max-w-80 p-1 shadow-none border rounded-md text-sm"
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 px-2 py-1"
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>{reservation.numberOfGuests}</span>
                        </Badge>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 px-2 py-1"
                        >
                            <Baby className="w-3.5 h-3.5" />
                            <span>0</span>
                        </Badge>
                    </div>
                </CardHeader>

                <CardBody className="py-1 px-2 flex flex-col gap-1">
                    {/* Date section - more compact */}
                    <div className="flex w-full bg-slate-50 rounded-md mb-2 overflow-hidden border">
                        <div className="flex-1 flex flex-col items-center justify-center py-2">
                            <span className="text-xs text-muted-foreground">
                                Check-in
                            </span>
                            <span className="font-medium">
                                {new Date(
                                    reservation.startDate,
                                ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                            <span className="text-xs">
                                {reservation.startTime}
                            </span>
                        </div>

                        <div className="bg-slate-100 px-3 flex flex-col items-center justify-center">
                            <span className="font-bold text-lg">
                                {getNights(
                                    reservation.startDate,
                                    reservation.endDate,
                                )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                nights
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center py-2">
                            <span className="text-xs text-muted-foreground">
                                Check-out
                            </span>
                            <span className="font-medium">
                                {new Date(
                                    reservation.endDate,
                                ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                            <span className="text-xs">
                                {reservation.endTime}
                            </span>
                        </div>
                    </div>

                    {/* Room info and financial summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Room / Type
                            </h4>
                            <p className="font-medium">
                                {reservation?.roomNumber} /{' '}
                                {reservation?.roomType?.name}
                            </p>
                        </div>
                        <div className="text-right">
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Booked on
                            </h4>
                            <p className="font-medium">
                                {new Date(
                                    reservation.createdAt,
                                ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Financial info */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-md">
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Total
                            </h4>
                            {(() => {
                                // Calculate total cost
                                const totalCost =
                                    reservation.totalCost !== undefined &&
                                    reservation.totalCost !== null
                                        ? Number(reservation.totalCost)
                                        : (reservation.paidAmount ||
                                              reservation.amountPaid ||
                                              0) +
                                              (reservation.totalDue !==
                                                  undefined &&
                                              reservation.totalDue !== null
                                                  ? Number(reservation.totalDue)
                                                  : Math.max(
                                                        0,
                                                        reservation.outstanding ||
                                                            0,
                                                    )) || 0;

                                // Total should always show what the guest has actually used/spent (all services)
                                // This is the totalCost - the actual amount used in the hotel
                                const displayTotal = totalCost;

                                return (
                                    <p className="font-semibold">
                                        ₦ {formatAmount(displayTotal)}
                                    </p>
                                );
                            })()}
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Paid
                            </h4>
                            <p className="font-semibold">
                                ₦{' '}
                                {formatAmount(
                                    reservation.paidAmount !== undefined &&
                                        reservation.paidAmount !== null
                                        ? Number(reservation.paidAmount)
                                        : reservation.amountPaid || 0,
                                )}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Balance
                            </h4>
                            {(() => {
                                // Prioritize payable (credit) - if it exists, guest has credit
                                // A guest can only have ONE receivable OR payable at a time
                                const payableBalance =
                                    reservation.payableBalance !== undefined &&
                                    reservation.payableBalance !== null
                                        ? Math.max(
                                              0,
                                              Number(
                                                  reservation.payableBalance,
                                              ),
                                          ) // Ensure never negative
                                        : 0;

                                // Only check receivable if no payable exists
                                const receivableBalance =
                                    payableBalance > 0
                                        ? 0 // If payable exists, no receivable
                                        : reservation.receivableBalance !==
                                                undefined &&
                                            reservation.receivableBalance !==
                                                null
                                          ? Number(
                                                reservation.receivableBalance,
                                            )
                                          : 0;

                                // Determine balance type - payable takes priority
                                const balanceType =
                                    payableBalance > 0
                                        ? 'payable'
                                        : receivableBalance > 0
                                          ? 'receivable'
                                          : 'zero';

                                const displayBalance =
                                    balanceType === 'payable'
                                        ? payableBalance // Always positive
                                        : balanceType === 'receivable'
                                          ? receivableBalance
                                          : 0;

                                return (
                                    <p
                                        className={`font-semibold ${
                                            balanceType === 'receivable'
                                                ? 'text-red-500'
                                                : balanceType === 'payable'
                                                  ? 'text-green-500'
                                                  : 'text-orion-blue'
                                        }`}
                                    >
                                        {balanceType === 'receivable'
                                            ? `-₦ ${formatAmount(displayBalance)}`
                                            : balanceType === 'payable'
                                              ? `₦ ${formatAmount(displayBalance)}`
                                              : '₦ 0.00'}
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                </CardBody>
                <Divider className="bg-gray-300" />
                <CardFooter className="p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <StepperDialog
                            open={reservationOpen}
                            onOpenChange={setReservationOpen}
                            trigger={
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setReservationOpen(true)}
                                >
                                    <Edit className="w-3 h-3" />
                                </Button>
                            }
                            title="Edit Reservation"
                            content={
                                <MultiStepForm
                                    guestDetails={reservation}
                                    onClose={() => setReservationOpen(false)}
                                />
                            }
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                                setSelectedReservationId(reservation.id);
                                setShowDeleteModal(true);
                            }}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                    <Button
                        className="bg-brand shadow-none hover:bg-hexbrand text-white rounded-md px-3 h-7 text-sm"
                        onClick={() => handleCheckOut()}
                    >
                        Check-Out
                    </Button>
                </CardFooter>
            </Card>
            {!reservation && (
                <CheckOutModal
                    isOpen={isCheckOutOpen}
                    onClose={() => setIsCheckOutOpen(false)}
                    id={reservation.id}
                    reservation={reservation}
                />
            )}
            <NewReservationModal
                open={isReservationOpen}
                onClose={() => setIsReservationOpen(false)}
                onSubmit={handleFormSubmit}
                guestDetails={reservation}
            />
            {showDeleteModal && selectedReservationId && (
                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    reservationId={selectedReservationId}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}
        </>
    );
}
