import { Modal, ModalContent } from '@heroui/react';
import React from 'react';
import CustomTable from '../front-of-house/tables/CustomTable';
import { PurchaseOrderColumns } from '../kitchen/tables/columns/PurchaseOrderColumns';
import { CircleX } from 'lucide-react';
import { ScopedPurchase } from '../front-of-house/types';

interface CreateRoleModalProps {
    data: ScopedPurchase;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

// Removed static purchaseData array

const ViewPurchase: React.FC<CreateRoleModalProps> = ({
    data,
    isOpen,
    onOpenChange,
}) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
            <ModalContent className="rounded-none w-full max-w-[770px] max-h-[80vh] p-0">
                {(onClose) => (
                    <div className="relative h-[80vh] flex flex-col">
                        {/* Fixed Header */}
                        <div
                            className="pt-[34px] pr-[39px] pb-[18px] pl-[47px] bg-[#000] flex justify-between w-full sticky top-0 z-20"
                            style={{ minHeight: 90 }}
                        >
                            <div className="text-[#EAECF0] ">
                                <p className="text-[32px] leading-[27px]">
                                    Purchase Order
                                    <span className="text-[16px]">
                                        ({data.poNumber})
                                    </span>
                                </p>
                                <div className="flex items-center mt-[17px] gap-[15px]">
                                    <p className="text-sm font-bold">
                                        Po Status
                                    </p>
                                    <div className="px-3 py-1 rounded-full bg-[#F9F5FF]">
                                        <p className="text-[14px] font-medium leading-[20px] text-[#D55D00]">
                                            {data.status}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <CircleX size={35} color="#fff" onClick={onClose} />
                        </div>
                        {/* Scrollable Content */}
                        <div
                            className="px-10 py-[27px] flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-hide"
                            style={{
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'thin',
                            }}
                        >
                            <div className="mb-6 px-6 py-5 border border-[#E0E0E0] rounded-[20px] bg-[#FFF1E7]">
                                <p className="text-[20px] font-bold leading-[150%] text-[#354052]">
                                    Vendors Information
                                </p>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-16">
                                    {/* First row - 3 items */}
                                    <div>
                                        <p className="text-[14px] text-[#5F738C] mb-1">
                                            Vendors Name
                                        </p>
                                        <p className="text-[14px] font-semibold text-[#354052]">
                                            {data?.vendor?.vendorName || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[14px] text-[#5F738C] mb-1">
                                            Vendors Email Address
                                        </p>
                                        <p className="text-[14px] font-semibold text-[#354052]">
                                            {data?.vendor?.emailAddress ||
                                                'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[14px] text-[#5F738C] mb-1">
                                            Vendors Phone Number
                                        </p>
                                        <p className="text-[14px] font-semibold text-[#354052]">
                                            {data?.vendor?.phoneNumber || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Second row - Location (start of row), Open Time (far right) */}
                                    <div>
                                        <p className="text-[14px] text-[#5F738C] mb-1">
                                            Vendors Location
                                        </p>
                                        <p className="text-[14px] whitespace-nowrap font-semibold text-[#354052]">
                                            {data?.vendor?.businessAddress ||
                                                'N/A'}
                                        </p>
                                    </div>

                                    <div className="md:col-start-3">
                                        <p className="text-[14px] text-[#5F738C] mb-1">
                                            Vendors open Time
                                        </p>
                                        <p className="text-[14px] font-semibold text-[#354052]">
                                            10:30am Prompt
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <CustomTable
                                isSmall
                                isPaginated={false}
                                hasHeader
                                rightHeader={<div />}
                                title="Items List of Purchase Order"
                                columns={PurchaseOrderColumns}
                                data={data.items ?? []}
                            />

                            {/* <div className="mt-7">
                                <p className="text-[16px] font-semibold text-[#000]">
                                    Attach GRN
                                </p>
                                <div className="mt-4 flex flex-col items-center justify-center gap-2 border border-dashed border-[#7F91A8] rounded-sm py-3">
                                    <img
                                        src="/purchase-order-modal.svg"
                                        alt=""
                                    />
                                    <p className="text-[14px] font-semibold text-[#4B4B4B]">
                                        Drag and drop file here or
                                        <span className="text-[#FF6F00]">
                                            browse
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-normal text-[#7F91A8]">
                                        Accepted file format is .PDF, DOCX, JPG,
                                        PNG
                                    </p>
                                </div>
                            </div> */}
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ViewPurchase;
