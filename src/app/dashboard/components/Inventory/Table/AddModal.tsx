// import { updateInventory } from '@/app/actions/inventory';
// import { ItemInterface } from '@/types';
// import {
//     Button,
//     Input,
//     Modal,
//     ModalBody,
//     ModalContent,
//     ModalFooter,
//     ModalHeader,
//     Select,
//     SelectItem,
// } from '@heroui/react';
// import React, { useState } from 'react';

// interface AddModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSave: (item: updateInventory) => void;
//     onOpenChange: (isOpen: boolean) => void;
//     items: ItemInterface[];
// }

// const initialItemState: updateInventory = {
//     quantity: 0,
//     itemId: 0,
//     minStock: 0,
// };

// const AddModal: React.FC<AddModalProps> = ({
//     isOpen,
//     onClose,
//     onSave,
//     onOpenChange,
//     items,
// }) => {
//     const [newItem, setNewItem] = useState<updateInventory>(initialItemState);

//     const selectedItem = items.find((item) => item.id === newItem.itemId);
//     const maxQuantity = selectedItem?.quantity || 0;

//     const handleChange = (value: Partial<updateInventory>) => {
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
//         setNewItem(initialItemState);
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange}>
//             <ModalContent>
//                 <ModalHeader>Add Item</ModalHeader>
//                 <ModalBody>
//                     <Select
//                         items={items}
//                         label="Item to add"
//                         placeholder="Select an item"
//                         onChange={(e) =>
//                             handleChange({ itemId: parseInt(e.target.value) })
//                         }
//                     >
//                         {(item) => (
//                             <SelectItem key={item.id} textValue={item.name}>
//                                 {item.name}
//                             </SelectItem>
//                         )}
//                     </Select>
//                     <Input
//                         label={`Quantity to add (Max: ${maxQuantity})`}
//                         type="number"
//                         value={newItem.quantity.toString()}
//                         min={0}
//                         max={maxQuantity}
//                         disabled={!newItem.itemId}
//                         onChange={(e) => {
//                             const value = Math.min(
//                                 parseInt(e.target.value) || 0,
//                                 maxQuantity,
//                             );
//                             handleChange({ quantity: value });
//                         }}
//                     />
//                     <Input
//                         label={'Choose your minimum stock'}
//                         type="number"
//                         value={newItem.minStock.toString()}
//                         min={0}
//                         disabled={!newItem.itemId}
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
//                             !newItem.itemId ||
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

// export default AddModal;
