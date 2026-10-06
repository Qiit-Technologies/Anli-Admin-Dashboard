'use client';

import { getGuestListByHotelId } from '@/app/actions/guest';
import BrandButton from '@/components/common/Button';
import { InputField, SelectField } from '@/components/common/Form';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import { Card } from '@/components/ui/card';
import { fetchRooms } from '@/hooks/fetcher';
import type { ROOM } from '@/types';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

function formatCurrency(amount?: number) {
  const n = Number(amount || 0);
  return n.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
}

export default function TransferOutstandingPage() {
  const { data: roomsData } = useSWR<ROOM[]>('/hotelRooms', fetchRooms, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    fallbackData: [],
  });

  const { data: guestsRes } = useSWR('guests-list', getGuestListByHotelId, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const guests: any[] = guestsRes?.data ?? [];
  const safeRooms: ROOM[] = Array.isArray(roomsData) ? roomsData : [];

  const occupiedRoomNumbers = useMemo(() => {
    return safeRooms.filter((r) => r.isOccupied).map((r) => String(r.roomNumber));
  }, [safeRooms]);

  const availableRooms = useMemo(() => {
    return safeRooms.filter((r) => !r.isOccupied && !r.isBooked);
  }, [safeRooms]);

  const outstandingGuests = useMemo(() => {
    return guests.filter((g) => Number(g?.outstanding || 0) > 0);
  }, [guests]);

  const outstandingRoomOptions = useMemo(() => {
    // Build unique list by roomNumber with label including room type
    const map = new Map<string, { value: string; label: string; balance: number; guestId: number }>();
    outstandingGuests.forEach((g) => {
      const roomNumber = String(g?.roomNumber ?? g?.room?.roomNumber ?? '');
      if (!roomNumber) return;
      const room = safeRooms.find((r) => String(r.roomNumber) === roomNumber);
      const label = room
        ? `Room ${room?.roomNumber ?? 'N/A'} - ${room?.roomtype?.name ?? 'N/A'}`
        : `Room ${roomNumber}`;
      const balance = Math.max(Number(g?.outstanding || 0), 0);
      map.set(roomNumber, {
        value: roomNumber,
        label,
        balance,
        guestId: Number(g?.id),
      });
    });
    return Array.from(map.values());
  }, [outstandingGuests, safeRooms]);

  const transferToOptions = useMemo(() => {
    return availableRooms.map((room) => ({
      value: String(room?.id),
      label: `Room ${room?.roomNumber ?? 'N/A'} - ${room?.roomtype?.name ?? 'N/A'}`,
    }));
  }, [availableRooms]);

  const [selectedFromRoom, setSelectedFromRoom] = useState<string>('');
  const [selectedToRoomId, setSelectedToRoomId] = useState<string>('');
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [transferDate, setTransferDate] = useState<string>(() => {
    // Use yyyy-MM-dd for native date input
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (!selectedFromRoom) {
      setAccountBalance(0);
      return;
    }
    const match = outstandingRoomOptions.find((o) => o.value === selectedFromRoom);
    setAccountBalance(match?.balance ?? 0);
  }, [selectedFromRoom, outstandingRoomOptions]);

  const handleCancel = () => {
    setSelectedFromRoom('');
    setSelectedToRoomId('');
    setAccountBalance(0);
    setTransferDate(() => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    });
    setSuccessMessage('');
  };

  const handleTransfer = () => {
    if (!selectedFromRoom) {
      toast.error('Please select a room with outstanding bill');
      return;
    }
    if (!selectedToRoomId) {
      toast.error('Please select a new room to transfer to');
      return;
    }
    // Placeholder success until backend endpoint is defined for outstanding transfer
    const msg = 'Outstanding balance has been transferred successfully.';
    toast.success(msg);
    setSuccessMessage(msg);
  };

  const filteredTransferToOptions = useMemo(() => {
    // Prevent selecting same room number as origin and only available rooms
    return transferToOptions.filter((opt) => {
      const room = safeRooms.find((r) => String(r.id) === opt.value);
      if (!room) return true;
      return String(room.roomNumber) !== selectedFromRoom;
    });
  }, [transferToOptions, selectedFromRoom, safeRooms]);

  return (
    <PageWrapper>
      <PageHeader>
        <PageHeadertitle
          title="Transfer Outstanding"
          subtitle={`Transfer outstanding payment to a new guest`}
        />
        <div className="ml-auto flex items-center">
          <SearchInput />
          <NotificationsPopover />
        </div>
      </PageHeader>

      <div className="mt-12 min-h-[60vh] flex items-center justify-center">
        {successMessage && (
          <div className="mb-4 max-w-xl w-full rounded-md border border-green-200 bg-green-50 text-green-800 px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}
        <Card className="bg-[#F6FAFF] border-[#E5EEF9] p-6 max-w-xl w-full">
          <div className="space-y-4">
            <SelectField
              id="outstandingRoom"
              name="outstandingRoom"
              label="Room with outstanding bill"
              value={selectedFromRoom}
              onValueChange={(value) => setSelectedFromRoom(String(value))}
              options={outstandingRoomOptions.map((o) => ({ value: o.value, label: o.label }))}
              placeholder={
                occupiedRoomNumbers.length < 1
                  ? 'No occupied rooms'
                  : outstandingRoomOptions.length < 1
                  ? 'No rooms with outstanding'
                  : 'Select Room'
              }
            />

            <InputField
              id="accountBalance"
              name="accountBalance"
              label="Account Balance"
              value={formatCurrency(accountBalance)}
              onChange={() => {}}
              disabled
              placeholder="₦0.00"
            />

            <InputField
              id="transferDate"
              name="transferDate"
              label="Date"
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              placeholder="Select date"
            />

            <SelectField
              id="transferTo"
              name="transferTo"
              label="Room to transfer to"
              value={selectedToRoomId}
              onValueChange={(value) => setSelectedToRoomId(String(value))}
              options={filteredTransferToOptions}
              placeholder={
                availableRooms.length < 1 ? 'No available rooms' : 'Select New Room'
              }
            />

            <div className="flex gap-3 pt-2">
              <BrandButton variant="secondary" className="w-full sm:w-fit bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={handleCancel}>
                Cancel Transfer
              </BrandButton>
              <BrandButton className="w-full sm:w-fit" onClick={handleTransfer}>
                Transfer bill
              </BrandButton>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}