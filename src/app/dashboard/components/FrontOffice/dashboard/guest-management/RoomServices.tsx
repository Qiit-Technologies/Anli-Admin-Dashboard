import {
    FaCalendarAlt,
    FaCheck,
    FaClock,
    FaEdit,
    FaPlus,
    FaTrash,
} from 'react-icons/fa';

const RoomServices = ({
    currentServices,
    foodOrders,
    getStatusBadgeClass,
    miniBarItems,
    rentedItems,
    specialRequests,
}: any) => {
    return (
        <div className="space-y-8">
            {/* Current Services */}
            <div>
                <h3 className="mb-4 text-lg font-semibold">Current Services</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Request Date/Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Additional Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentServices.map((service: any) => (
                                <tr key={service.serviceName}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {service.serviceName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-400" />
                                            {service.requestDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(service.status)}`}
                                        >
                                            {service.status === 'Completed' && (
                                                <FaCheck className="mr-1" />
                                            )}
                                            {service.status ===
                                                'In Progress' && (
                                                <FaClock className="mr-1" />
                                            )}
                                            {service.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${service.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                            <FaEdit /> Edit
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {service.notes}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <FaPlus /> Add new services
                </button>
            </div>

            {/* Food Orders */}
            <div>
                <h3 className="mb-4 text-lg font-semibold">Food Orders</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Date/Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Unit Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Special Instructions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Delivery Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Staff Responsible
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {foodOrders.map((order: any) => (
                                <tr key={order.orderDate}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.orderDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.itemName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${order.unitPrice}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${order.totalPrice}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.specialInstructions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.deliveryTime}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.staffResponsible}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                                <FaEdit /> Edit
                                            </button>
                                            <button className="text-red-600 hover:text-red-900 flex items-center gap-1">
                                                <FaTrash /> Cancel
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <FaPlus /> Place New Order
                </button>
            </div>

            <div>
                <h3 className="mb-4 text-lg font-semibold">Mini-Bar Usage</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Unit Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {miniBarItems.map((item: any) => (
                                <tr key={item.itemName}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.itemName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${item.unitPrice}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${item.totalPrice}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                            <FaEdit /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <FaPlus /> Add Item
                </button>
            </div>
            <div>
                <h3 className="mb-4 text-lg font-semibold">
                    Rent Item / Return Item
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rent Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Return Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rentedItems.map((item: any) => (
                                <tr key={item.itemName}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.itemName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.rentDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.returnDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                item.status === 'Returned'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${item.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            {item.status === 'Returned'
                                                ? 'Return an Item'
                                                : 'Rent an Item'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <FaPlus /> Rent New Item
                </button>
            </div>
            <div>
                <h3 className="mb-4 text-lg font-semibold">Special Requests</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Request Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Request Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {specialRequests.map((request: any) => (
                                <tr key={request.requestType}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {request.requestType}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {request.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {request.requestDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                request.status === 'Done'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${request.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                            <FaEdit /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <FaPlus /> Add Request
                </button>
            </div>
        </div>
    );
};

export default RoomServices;
