// import { updateInventoryInterface } from '@/app/actions/inventory';
// import {
//     Button,
//     Input,
//     Modal,
//     ModalBody,
//     ModalContent,
//     ModalFooter,
//     ModalHeader,
// } from '@heroui/react';
// import React, { useState } from 'react';

// interface EditModalProps {
//     isOpen: boolean;
//     item: updateInventoryInterface;
//     onClose: () => void;
//     onSave: (item: updateInventoryInterface) => void;
//     onOpenChange: (isOpen: boolean) => void;
// }

// const EditModal: React.FC<EditModalProps> = ({
//     isOpen,
//     item,
//     onClose,
//     onSave,
//     onOpenChange,
// }) => {
//     const [newItem, setNewItem] = useState<updateInventoryInterface>(item);
//     const maxQuantity = item.maxQuantity || 0;

//     const handleChange = (value: Partial<updateInventoryInterface>) => {
//         setNewItem({
//             ...newItem,
//             ...value,
//         });
//     };

//     const handleSave = () => {
//         if (newItem.quantity <= 0 || newItem.quantity > maxQuantity) {
//             // Validation feedback (e.g., show a toast or an error message)
//             return;
//         }
//         onSave(newItem);
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange}>
//             <ModalContent>
//                 <ModalHeader>Edit Item</ModalHeader>
//                 <ModalBody>
//                     <Input
//                         label={`Quantity to add (Max: ${maxQuantity})`}
//                         type="number"
//                         min={0}
//                         max={maxQuantity}
//                         value={newItem.quantity.toString()}
//                         onChange={(e) => {
//                             const value = Math.min(
//                                 parseInt(e.target.value) || 0,
//                                 maxQuantity,
//                             );
//                             handleChange({ quantity: value });
//                         }}
//                     />
//                     <Input
//                         label="Minimum Stock"
//                         type="number"
//                         value={newItem.minStock.toString()}
//                         onChange={(e) =>
//                             handleChange({ minStock: parseInt(e.target.value) })
//                         }
//                     />
//                 </ModalBody>
//                 <ModalFooter>
//                     <Button onPress={onClose}>Cancel</Button>
//                     <Button
//                         color="warning"
//                         onPress={handleSave}
//                         disabled={
//                             newItem.quantity <= 0 ||
//                             newItem.quantity > maxQuantity
//                         }
//                     >
//                         Save
//                     </Button>
//                 </ModalFooter>
//             </ModalContent>
//         </Modal>
//     );
// };

// export default EditModal;
