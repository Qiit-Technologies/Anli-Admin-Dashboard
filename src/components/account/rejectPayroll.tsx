import { Button, Modal, ModalContent, Spinner } from '@heroui/react';
import { CircleX } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import React from 'react';

interface CreateRoleModalProps {
    isLoading: boolean;
    isOpen: boolean;
    onOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onReject: () => void;
    reason: string;
    setReason: (val: string) => void;
}

const RejectPayroll: React.FC<CreateRoleModalProps> = ({
    isLoading,
    isOpen,
    onClose,
    onReject,
    reason,
    setReason,
}) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} hideCloseButton>
            <ModalContent className="rounded-none py-7">
                <div>
                    <div className="flex justify-between  px-8">
                        <div>
                            <p className="text-black text-[20px] font-medium leading-normal">
                                Reject Payroll
                            </p>
                        </div>
                        <CircleX
                            size={24}
                            onClick={onClose}
                            className="cursor-pointer"
                        />
                    </div>
                    <div className="h-[1px] bg-[#DCDCDC] w-full mt-2 mb-6" />
                    <div className="px-8 flex flex-col gap-5 items-stretch">
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="rounded-lg bg-[#FAFAFA] border-none"
                            placeholder="Enter Reason"
                        />

                        <Button
                            onPress={onReject}
                            className="bg-orion-blue hover:bg-orion-blue text-[#F3F3F3] text-sm font-medium leading-5 px-[10px] py-4 rounded-lg"
                        >
                            {isLoading ? (
                                <Spinner size="sm" color="white" />
                            ) : null}
                            Reject
                        </Button>
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
};

export default RejectPayroll;
