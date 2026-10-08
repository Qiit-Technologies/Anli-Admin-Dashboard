'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Header from '@/components/reservations/layout/Header';
import EmptySpaceState from '@/components/reservations/tables/EmptySpaceState';
import SpaceList, {
    type Space,
    type Table,
} from '@/components/reservations/tables/SpaceList';
import TableHeader from '@/components/reservations/tables/TableHeader';
import NewSpaceModal from '@/components/reservations/tables/NewSpaceModal';
import NewTableModal from '@/components/reservations/tables/NewTableModal';
import DeleteConfirmationModal from '@/components/reservations/tables/DeleteConfirmationModal';
import type { SpaceFormData } from '@/components/reservations/tables/NewSpaceModal';
import type { TableFormData } from '@/components/reservations/tables/NewTableModal';
import {
    getReservationSpaces,
    createReservationSpace,
    deleteReservationSpace,
    createReservationTable,
    deleteReservationTable,
    updateReservationTableData,
    getReservationByTableId,
} from '@/app/actions/reservation';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import ReservationDetailsModal from '@/components/reservations/common/ReservationDetailsModal';
import { Reservation } from '@/components/reservations/types';

export default function TableSpacesSetup() {
    const { data: spacesResponse, isLoading } = useSWR(
        'reservation-spaces',
        getReservationSpaces,
    );
    console.log(spacesResponse);
    const spaces = ((spacesResponse?.data || []) as Space[])
        .sort((a, b) => Number(a.id) - Number(b.id))
        .map((space) => ({
            ...space,
            tables: space.tables?.sort((a, b) => Number(a.id) - Number(b.id)),
        }));

    const [spaceModalOpen, setSpaceModalOpen] = useState(false);
    const [tableModalOpen, setTableModalOpen] = useState(false);
    const [selectedSpaceId, setSelectedSpaceId] = useState<
        string | undefined
    >();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{
        id: string;
        type: 'space' | 'table';
        name?: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSavingSpace, setIsSavingSpace] = useState(false);
    const [isAddingTable, setIsAddingTable] = useState(false);
    const [tableBeingEdited, setTableBeingEdited] = useState<Table | null>(
        null,
    );
    const [, setIsFetchingReservation] = useState(false);

    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const hasSpaces = spaces.length > 0;

    const handleCreateSpace = () => {
        setSpaceModalOpen(true);
    };

    const handleSpaceSubmit = async (data: SpaceFormData) => {
        setIsSavingSpace(true);
        try {
            const result = await createReservationSpace({
                name: data.name,
                description: data.description,
            });

            if (result.success) {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description="Space created successfully"
                        type="success"
                    />
                ));
                mutate('reservation-spaces');
                setSpaceModalOpen(false);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={result.error || 'Failed to create space'}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast title="Error" description="An error occurred" type="error" />
            ));
        } finally {
            setIsSavingSpace(false);
        }
    };

    const handleAddTable = (spaceId: string) => {
        setSelectedSpaceId(spaceId);
        setTableModalOpen(true);
    };

    const handleTableSubmit = async (data: TableFormData) => {
        setIsAddingTable(true);
        try {
            let result;
            if (tableBeingEdited) {
                result = await updateReservationTableData(
                    tableBeingEdited.id.toString(),
                    {
                        tableNumber: data.tableNumber,
                        capacity: parseInt(data.capacity, 10),
                        spaceId: parseInt(data.spaceId, 10),
                    },
                );
            } else {
                result = await createReservationTable({
                    tableNumber: data.tableNumber,
                    tableType: 'Table',
                    capacity: parseInt(data.capacity, 10),
                    spaceId: parseInt(data.spaceId, 10),
                });
            }

            if (result.success) {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description={`Table ${tableBeingEdited ? 'updated' : 'added'} successfully`}
                        type="success"
                    />
                ));
                mutate('reservation-spaces');
                setTableModalOpen(false);
                setSelectedSpaceId(undefined);
                setTableBeingEdited(null);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={result.error || 'Failed to save table'}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast title="Error" description="An error occurred" type="error" />
            ));
        } finally {
            setIsAddingTable(false);
        }
    };

    const handleDeleteSpace = (spaceId: string) => {
        const space = spaces.find((s) => s.id.toString() === spaceId);
        setItemToDelete({ id: spaceId, type: 'space', name: space?.name });
        setDeleteModalOpen(true);
    };

    const handleDeleteTable = (tableId: string) => {
        setItemToDelete({ id: tableId, type: 'table' });
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            let result;
            if (itemToDelete.type === 'space') {
                result = await deleteReservationSpace(
                    parseInt(itemToDelete.id, 10),
                );
            } else {
                result = await deleteReservationTable(
                    parseInt(itemToDelete.id, 10),
                );
            }

            if (result.success) {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description={`${itemToDelete.type === 'space' ? 'Space' : 'Table'} deleted successfully`}
                        type="success"
                    />
                ));
                mutate('reservation-spaces');
                setDeleteModalOpen(false);
                setItemToDelete(null);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={result.error || `Failed to delete ${itemToDelete.type}`}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast title="Error" description="An error occurred" type="error" />
            ));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditTable = (table: Table) => {
        setTableBeingEdited(table);
        setTableModalOpen(true);
    };

    const handleViewReservation = async (tableId: string) => {
        setIsFetchingReservation(true);
        try {
            const result = await getReservationByTableId(tableId);
            console.log('getReservationByTableId result:', result);
            if (result.data) {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description="Reservation record found"
                        type="success"
                    />
                ));
                setSelectedReservation(result.data);
                setIsDetailModalOpen(true);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Info"
                        description="This table is in use, but no active reservation record was found."
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('handleViewReservation error:', error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Failed to fetch reservation detail"
                    type="error"
                />
            ));
        } finally {
            setIsFetchingReservation(false);
        }
    };

    if (isLoading) {
        return (
            <main className="bg-white min-h-screen">
                <Header />
                <div className="p-6 flex items-center justify-center">
                    <p>Loading spaces...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-white min-h-screen">
            <Header />

            <div className="p-6 flex flex-col gap-6">
                <TableHeader
                    hasSpaces={hasSpaces}
                    onAddSpace={handleCreateSpace}
                />

                {hasSpaces ? (
                    <SpaceList
                        spaces={spaces}
                        onAddTable={handleAddTable}
                        onDeleteSpace={handleDeleteSpace}
                        onDeleteTable={handleDeleteTable}
                        onEditTable={handleEditTable}
                        onViewReservation={handleViewReservation}
                    />
                ) : (
                    <EmptySpaceState onCreateSpace={handleCreateSpace} />
                )}
            </div>

            <NewSpaceModal
                open={spaceModalOpen}
                onOpenChange={setSpaceModalOpen}
                onSubmit={handleSpaceSubmit}
                isLoading={isSavingSpace}
            />

            <NewTableModal
                open={tableModalOpen}
                onOpenChange={(open) => {
                    setTableModalOpen(open);
                    if (!open) setTableBeingEdited(null);
                }}
                onSubmit={handleTableSubmit}
                spaces={spaces}
                selectedSpaceId={selectedSpaceId}
                initialData={
                    tableBeingEdited
                        ? {
                              spaceId:
                                  tableBeingEdited.spaceId?.toString() || '',
                              tableNumber: tableBeingEdited.tableNumber || '',
                              capacity:
                                  tableBeingEdited.capacity?.toString() || '',
                          }
                        : null
                }
                isLoading={isAddingTable}
            />

            <DeleteConfirmationModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={handleConfirmDelete}
                title={
                    itemToDelete?.type === 'space'
                        ? 'Delete Space'
                        : 'Delete Table'
                }
                description={
                    itemToDelete?.type === 'space'
                        ? `Are you sure you want to delete "${itemToDelete.name}"? This will also delete all tables within this space.`
                        : 'Are you sure you want to delete this table? This action cannot be undone.'
                }
                isLoading={isDeleting}
            />

            {isDetailModalOpen && (
                <ReservationDetailsModal
                    open={isDetailModalOpen}
                    onOpenChange={setIsDetailModalOpen}
                    reservation={selectedReservation}
                />
            )}
        </main>
    );
}
