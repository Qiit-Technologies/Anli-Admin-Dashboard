import { removeStaff } from '@/app/actions/staff';
import Toast from '@/components/toast';
import useStaff from '@/hooks/useStaff';
import { SimplifiedStaff, StaffColumn } from '@/types/staff.types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
    Button,
    Input,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@heroui/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdAddCircleOutline, IoMdRefresh } from 'react-icons/io';
import InviteModal from './InviteModal';
import renderCell from './renderCell';

const columns = [
    { name: 'Name', uid: 'fullName' },
    { name: 'Role', uid: 'department' },
    { name: 'Email', uid: 'email' },
    { name: 'Date of creation', uid: 'createdAt' },
    { name: 'Actions', uid: 'actions' },
];

const TableView = () => {
    const [refreshTable, setRefreshTable] = useState(1);
    const [editedStaff, setEditedStaff] = useState<SimplifiedStaff>();
    const {
        staff,
        isLoading,
        searchQuery,
        setSearchQuery,
        page,
        lastPage,
        setPage,
    } = useStaff(refreshTable);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    // const {
    //     isOpen: isCreateModalOpen,
    //     onOpen: onCreateModalOpen,
    //     onClose: onCreateModalClose,
    // } = useDisclosure();

    // const onCreate = () => {
    //     onCreateModalOpen();
    // };
    const editModal = useDisclosure();
    const onEdit = (staff: SimplifiedStaff) => {
        setEditedStaff(staff);
        editModal.onOpen();
    };

    const onDelete = async (item: number) => {
        const { data, status } = await removeStaff(item);
        if (status >= 400) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={
                        data.message ||
                        `Failed to delete staff member. Please try again.`
                    }
                    type="error"
                />
            ));
            return;
        }
        toast.custom(() => (
            <Toast
                title="Success!"
                description={`Staff deleted successfully`}
                type="success"
            />
        ));
        setRefreshTable(refreshTable + 1);
    };

    return (
        <>
            <Table
                isStriped
                aria-label="Staff members table"
                topContent={
                    <div className="flex justify-between gap-3">
                        <div className="flex w-full justify-end gap-2">
                            <Input
                                isClearable
                                className="w-[20%] focus-within:w-[40%] transition-width"
                                placeholder="Search"
                                startContent={
                                    <MagnifyingGlassIcon width={20} />
                                }
                                value={searchQuery}
                                onClear={() => {
                                    // setPage(1);
                                }}
                                onValueChange={setSearchQuery}
                            />
                            <Button
                                color="primary"
                                startContent={<IoMdAddCircleOutline />}
                                variant="bordered"
                                id="add-item-btn"
                                className="capitalize"
                                onPress={() => onOpen()}
                            >
                                invite member
                            </Button>
                            {/* <Button
                                color="default"
                                startContent={<IoMdAddCircleOutline />}
                                id="add-item-btn"
                                className="capitalize bg-btnDark text-white"
                                onPress={() => onCreate()}
                            >
                                Create role
                            </Button> */}
                            <Button
                                onPress={() =>
                                    setRefreshTable(refreshTable + 1)
                                }
                                isIconOnly
                                aria-label="Like"
                                color="default"
                                isLoading={isLoading}
                            >
                                <IoMdRefresh className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                }
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            classNames={{
                                cursor: 'bg-orion-blue',
                            }}
                            color="default"
                            page={page}
                            total={lastPage}
                            onChange={(page) => setPage(page)}
                        />
                    </div>
                }
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} allowsSorting>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={'No items to display.'} items={staff}>
                    {(staff) => (
                        <TableRow key={staff.id}>
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(
                                        staff,
                                        columnKey as StaffColumn,
                                        () => onEdit(staff),
                                        () => onDelete(staff.id),
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <InviteModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                setRefreshTable={setRefreshTable}
                refreshTable={refreshTable}
            />
            {editedStaff && (
                <InviteModal
                    isEdit
                    editedStaff={editedStaff}
                    isOpen={editModal.isOpen}
                    onOpenChange={editModal.onOpenChange}
                    setRefreshTable={setRefreshTable}
                    refreshTable={refreshTable}
                />
            )}
            {/* <CreateRoleModal
                isOpen={isCreateModalOpen}
                onOpenChange={onCreateModalClose}
                setRefreshTable={setRefreshTable}
                refreshTable={refreshTable}
            /> */}
        </>
    );
};

export default TableView;
