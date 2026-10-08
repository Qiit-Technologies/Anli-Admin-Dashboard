'use client';

import React, { useState } from 'react';

const roles = [
    { id: 1, name: 'Receptionist' },
    { id: 2, name: 'Housekeeper' },
    { id: 3, name: 'Manager' },
];

const permissions = [
    {
        id: 1,
        type: 'module',
        key: 'front_office',
        label: 'Front Office',
        path: '/front-of-house',
    },
    {
        id: 2,
        type: 'module',
        key: 'housekeeping',
        label: 'Housekeeping',
        path: '/housekeeping',
    },
    { id: 3, type: 'page', key: '/reservations' },
    { id: 4, type: 'page', key: '/rooms/status' },
    { id: 5, type: 'function', key: 'canViewReservation' },
    { id: 6, type: 'function', key: 'canCreateReservation' },
    { id: 7, type: 'function', key: 'canEditStock' },
];

const InviteStaffForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        roleId: '',
        permissionIds: [] as number[],
    });

    const [submittedData, setSubmittedData] = useState<any>(null);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePermissionToggle = (id: number) => {
        setFormData((prev) => {
            const exists = prev.permissionIds.includes(id);
            return {
                ...prev,
                permissionIds: exists
                    ? prev.permissionIds.filter((pid) => pid !== id)
                    : [...prev.permissionIds, id],
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedPermissions = permissions.filter((p) =>
            formData.permissionIds.includes(p.id),
        );

        const output = {
            id: 101,
            name: formData.fullName,
            email: formData.email,
            role:
                roles.find((r) => r.id.toString() === formData.roleId)?.name ||
                null,
            hotelId: 1,
            modules: selectedPermissions
                .filter((p) => p.type === 'module')
                .map((p) => ({
                    id: p.id,
                    label: p.label,
                    module: p.key,
                    path: p.path,
                })),
            pages: selectedPermissions
                .filter((p) => p.type === 'page')
                .map((p) => p.key),
            functions: Object.fromEntries(
                selectedPermissions
                    .filter((p) => p.type === 'function')
                    .map((p) => [p.key, true]),
            ),
        };

        setSubmittedData(output);
    };

    const groupedPermissions = {
        module: permissions.filter((p) => p.type === 'module'),
        page: permissions.filter((p) => p.type === 'page'),
        function: permissions.filter((p) => p.type === 'function'),
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Invite Staff
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* MODULES */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Modules
                        </h4>
                        <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                            {groupedPermissions.module.map((perm) => (
                                <label
                                    key={perm.id}
                                    className="flex items-center space-x-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.permissionIds.includes(
                                            perm.id,
                                        )}
                                        onChange={() =>
                                            handlePermissionToggle(perm.id)
                                        }
                                        className="text-blue-600"
                                    />
                                    <span>
                                        {perm.label} ({perm.key})
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* PAGES */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Pages
                        </h4>
                        <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                            {groupedPermissions.page.map((perm) => (
                                <label
                                    key={perm.id}
                                    className="flex items-center space-x-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.permissionIds.includes(
                                            perm.id,
                                        )}
                                        onChange={() =>
                                            handlePermissionToggle(perm.id)
                                        }
                                        className="text-blue-600"
                                    />
                                    <span>{perm.key}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* FUNCTION PERMISSIONS */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Function Permissions
                        </h4>
                        <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                            {groupedPermissions.function.map((perm) => (
                                <label
                                    key={perm.id}
                                    className="flex justify-between items-center"
                                >
                                    <span>{perm.key}</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.permissionIds.includes(
                                            perm.id,
                                        )}
                                        onChange={() =>
                                            handlePermissionToggle(perm.id)
                                        }
                                        className="form-checkbox h-4 w-4 text-blue-600"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
                >
                    Simulate Invite
                </button>
            </form>

            {submittedData && (
                <div className="mt-10">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Simulated Output:
                    </h3>
                    <pre className="bg-gray-900 text-green-200 p-4 rounded-md overflow-x-auto text-sm">
                        {JSON.stringify(submittedData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default InviteStaffForm;
