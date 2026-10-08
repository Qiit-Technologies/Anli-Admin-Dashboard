// import { ItemInterface } from '@/types';
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
//     item: ItemInterface;
//     onClose: () => void;
//     onSave: (item: Partial<ItemInterface> & { id: number }) => void;
//     onOpenChange: (isOpen: boolean) => void;
// }

// const EditModal: React.FC<EditModalProps> = ({
//     isOpen,
//     item,
//     onClose,
//     onSave,
//     onOpenChange,
// }) => {
//     const [newItem, setNewItem] = useState<ItemInterface>(item);

//     const handleChange = (value: Partial<ItemInterface>) => {
//         setNewItem({
//             ...newItem,
//             ...value,
//         });
//     };

//     const handleSave = () => {
//         if (newItem) onSave(newItem);
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange}>
//             <ModalContent>
//                 <ModalHeader>Edit Item</ModalHeader>
//                 <ModalBody>
//                     <Input
//                         label="Name"
//                         value={newItem.name}
//                         onChange={(e) => handleChange({ name: e.target.value })}
//                     />
//                     <Input
//                         label="Description"
//                         value={newItem.description}
//                         onChange={(e) =>
//                             handleChange({ description: e.target.value })
//                         }
//                     />
//                     <Input
//                         label="Price"
//                         type="number"
//                         value={newItem.price.toString()}
//                         onChange={(e) =>
//                             handleChange({
//                                 price: parseInt(e.target.value),
//                             })
//                         }
//                     />
//                     <Input
//                         label="Current Stock"
//                         type="number"
//                         value={newItem.quantity.toString()}
//                         onChange={(e) =>
//                             handleChange({ quantity: parseInt(e.target.value) })
//                         }
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
//                     <Button color="warning" onPress={handleSave}>
//                         Save
//                     </Button>
//                 </ModalFooter>
//             </ModalContent>
//         </Modal>
//     );
// };

// export default EditModal;
