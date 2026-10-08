'use client';
import { getDineInAreas } from '@/app/actions/back-of-house';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import useSWR from 'swr';

interface AreaSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (area: any) => void;
}

const AreaSelectionModal = ({
    isOpen,
    onClose,
    onSelect,
}: AreaSelectionModalProps) => {
    const [selectedArea, setSelectedArea] = useState<string>('');
    const { data: dineInAreas, isLoading } = useSWR(
        '/restaurants/dine-in-areas',
        getDineInAreas,
    );

    const areas = dineInAreas?.data || [];

    const handleConfirm = () => {
        const area = areas.find((a: any) => String(a.id) === selectedArea);
        if (area) {
            onSelect(area);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Dine Area</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Dine Area</label>
                        <Select
                            value={selectedArea}
                            onValueChange={setSelectedArea}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Dine Area" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoading ? (
                                    <div className="p-2 text-sm text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    areas.map((area: any) => (
                                        <SelectItem
                                            key={area.id}
                                            value={String(area.id)}
                                        >
                                            {area.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedArea}
                            className="bg-orion-blue text-white"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AreaSelectionModal;
