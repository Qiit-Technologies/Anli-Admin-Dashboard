// import { formatDate } from '@/lib/helpers';
// import { ItemInterface } from '@/types';
// import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
// import { MdImage } from 'react-icons/md';
// import DetailsTabs from './DetailsTabs';

// interface DetailsModalProps {
//     isOpen: boolean;
//     item: ItemInterface;
//     onOpenChange: (isOpen: boolean) => void;
// }

// function DetailsModal({ isOpen, item, onOpenChange }: DetailsModalProps) {
//     return (
//         <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
//             <ModalContent>
//                 <ModalHeader className="flex gap-4 capitalize text-md">
//                     <div>
//                         <MdImage className="h-28 w-28 bg-black/50 object-contain" />
//                     </div>
//                     <div className="flex flex-col w-full">
//                         <div className="flex flex-col gap-1 h-full justify-center">
//                             <span>{item.name}</span>
//                             <div className="flex gap-1 text-xs">
//                                 <div className="flex flex-col p-1 pt-0 bg-orion-blue/40 rounded-md">
//                                     <span className="font-light">quantity</span>
//                                     <span className="text-center font-bold">
//                                         {item.quantity}
//                                     </span>
//                                 </div>
//                                 <div className="flex flex-col p-1 pt-0 bg-orion-blue/40 rounded-md">
//                                     <span className="font-light">price</span>
//                                     <span className="text-center">
//                                         ₦ {item.price.toFixed(2)}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                         <span className="flex text-xs self-end">
//                             {formatDate(item.createdAt)}
//                         </span>
//                     </div>
//                 </ModalHeader>
//                 <ModalBody>
//                     <DetailsTabs item={item} />
//                 </ModalBody>
//             </ModalContent>
//         </Modal>
//     );
// }

// export default DetailsModal;
