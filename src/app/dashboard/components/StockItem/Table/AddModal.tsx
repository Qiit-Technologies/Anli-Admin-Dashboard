// import { Item } from '@/types';
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

// interface AddModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSave: (item: Item) => void;
//     onOpenChange: (isOpen: boolean) => void;
// }

// const initialItemState: Item = {
//     name: '',
//     description: '',
//     price: 0,
//     quantity: 0,
//     minStock: 0,
// };

// const AddModal: React.FC<AddModalProps> = ({
//     isOpen,
//     onClose,
//     onSave,
//     onOpenChange,
// }) => {
//     const [newItem, setNewItem] = useState<Item>(initialItemState);

//     const handleChange = (value: Partial<Item>) => {
//         setNewItem({
//             ...newItem,
//             ...value,
//         });
//     };

//     const handleSave = () => {
//         onSave(newItem);
//         setNewItem(initialItemState);
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange}>
//             <ModalContent>
//                 <ModalHeader>Add New Item</ModalHeader>
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

// export default AddModal;
