'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Key, Navigation, Search, User } from 'lucide-react';
import useSWR from 'swr';
import { useMemo, useState, useEffect } from 'react';
import { getModules } from '@/app/actions/modules';
import { getPermissions } from '@/app/actions/permissions';
import { getEmployees } from '@/app/actions/employee';
import useHotel from '@/hooks/useHotel';

export default function EmployeePermissions() {
    // Fetch all employees (staff)
    const { organization } = useHotel();
    const { data: employees } = useSWR('/staff', getEmployees);
    const employeesData = useMemo(() => employees ?? [], [employees]);
    const { data: modulesData } = useSWR('/modules/public-modules', getModules);
    const allModules = useMemo(() => modulesData?.data ?? [], [modulesData]);

    const { data: permissionsData } = useSWR(
        '/permissions/public-permissions',
        getPermissions,
    );
    const allPermissions = useMemo(
        () => permissionsData?.data?.permissions ?? [],
        [permissionsData],
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
        null,
    );
    const [employeePermissions, setEmployeePermissions] = useState<
        Record<
            string,
            {
                modules: number[];
                pages: string[];
                permissions: string[];
            }
        >
    >({});

    useEffect(() => {
        if (selectedEmployee && !employeePermissions[selectedEmployee]) {
            const emp = employeesData.find(
                (e: any) => e.id === selectedEmployee,
            );
            if (emp) {
                setEmployeePermissions((prev) => ({
                    ...prev,
                    [selectedEmployee]: {
                        modules: emp.modules
                            ? emp.modules.map((m: any) => m.id)
                            : [],
                        permissions: emp.permissions
                            ? emp.permissions.map((p: any) => p.id)
                            : [],
                        pages: [], // Ensure pages property is always present
                    },
                }));
            }
        }
    }, [selectedEmployee, employeesData, employeePermissions]);

    const filteredEmployees = employeesData.filter(
        (employee: any) =>
            employee.fullName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.roles.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    const handleEmployeeSelect = (employeeId: string, checked: boolean) => {
        if (checked) {
            setSelectedEmployees((prev) => [...prev, employeeId]);
            if (!selectedEmployee) {
                setSelectedEmployee(employeeId);
            }
        } else {
            setSelectedEmployees((prev) =>
                prev.filter((id) => id !== employeeId),
            );
            if (selectedEmployee === employeeId) {
                setSelectedEmployee(
                    selectedEmployees.find((id) => id !== employeeId) || null,
                );
            }
        }
    };

    const toggleModule = (employeeId: string, moduleId: number) => {
        setEmployeePermissions((prev) => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                modules: prev[employeeId].modules.includes(moduleId)
                    ? prev[employeeId].modules.filter((id) => id !== moduleId)
                    : [...prev[employeeId].modules, moduleId],
            },
        }));
    };

    // const togglePage = (employeeId: string, page: string) => {
    //     setEmployeePermissions((prev) => ({
    //         ...prev,
    //         [employeeId]: {
    //             ...prev[employeeId],
    //             pages: prev[employeeId].pages.includes(page)
    //                 ? prev[employeeId].pages.filter((p) => p !== page)
    //                 : [...prev[employeeId].pages, page],
    //         },
    //     }));
    // };

    const togglePermission = (employeeId: string, perm: string) => {
        setEmployeePermissions((prev) => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                permissions: prev[employeeId].permissions.includes(perm)
                    ? prev[employeeId].permissions.filter((p) => p !== perm)
                    : [...prev[employeeId].permissions, perm],
            },
        }));
    };

    const currentEmployee = selectedEmployee
        ? employees.find((emp: any) => emp.id === selectedEmployee)
        : null;
    const currentPermissions = selectedEmployee
        ? employeePermissions[selectedEmployee]
        : null;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex h-[calc(100vh-3rem)] bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="w-80 border-r border-gray-200 flex flex-col">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 border-gray-300 focus:border-gray-400 focus:ring-0"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 space-y-2">
                                {filteredEmployees.map((employee: any) => (
                                    <div
                                        key={employee.id}
                                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                            selectedEmployee === employee.id
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={() =>
                                            setSelectedEmployee(employee.id)
                                        }
                                    >
                                        <Checkbox
                                            checked={selectedEmployees.includes(
                                                employee.id,
                                            )}
                                            onCheckedChange={(checked) =>
                                                handleEmployeeSelect(
                                                    employee.id,
                                                    checked as boolean,
                                                )
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {employee.fullName}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">
                                                {employee.email}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="mt-1 text-xs"
                                            >
                                                {employee?.roles?.name}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            {currentEmployee && currentPermissions ? (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h1 className="text-xl font-semibold text-gray-900">
                                                    {currentEmployee.fullName}
                                                </h1>
                                                <p className="text-gray-600">
                                                    {currentEmployee.email}
                                                </p>
                                                <Badge className="mt-1">
                                                    {currentEmployee.roles.name}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Card className="border-gray-200">
                                        <CardHeader>
                                            <CardTitle className="flex items-center space-x-2">
                                                <Navigation className="h-5 w-5" />
                                                <span>Accessible Modules</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                                {allModules.map(
                                                    (module: any) => {
                                                        const isEnabled =
                                                            currentPermissions.modules.includes(
                                                                module.id,
                                                            );
                                                        return (
                                                            <div
                                                                key={module.id}
                                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {
                                                                            module.name
                                                                        }
                                                                    </p>
                                                                    {/* <p className="text-sm text-gray-600">
                                                                    {
                                                                        module.path
                                                                    }
                                                                </p> */}
                                                                </div>
                                                                <Switch
                                                                    checked={
                                                                        isEnabled
                                                                    }
                                                                    onCheckedChange={() =>
                                                                        toggleModule(
                                                                            selectedEmployee ||
                                                                                '',
                                                                            module.id,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Functions */}
                                    <Card className="border-gray-200">
                                        <CardHeader>
                                            <CardTitle className="flex items-center space-x-2">
                                                <Key className="h-5 w-5" />
                                                <span>
                                                    Function Permissions
                                                </span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                                {allPermissions.map(
                                                    (perm: any) => {
                                                        const isEnabled =
                                                            currentPermissions.permissions.includes(
                                                                perm.id,
                                                            );
                                                        return (
                                                            <div
                                                                key={perm.id}
                                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                            >
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {perm.name}
                                                                </span>
                                                                <Switch
                                                                    checked={
                                                                        isEnabled
                                                                    }
                                                                    onCheckedChange={() =>
                                                                        togglePermission(
                                                                            selectedEmployee ||
                                                                                '',
                                                                            perm.id,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-gray-200">
                                        <CardHeader>
                                            <CardTitle>
                                                User Object Preview
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm overflow-x-auto">
                                                <code>
                                                    {JSON.stringify(
                                                        {
                                                            id: currentEmployee.id,
                                                            name: currentEmployee.fullName,
                                                            email: currentEmployee.email,
                                                            hotelId:
                                                                organization?.id,
                                                            role: currentEmployee
                                                                .roles.name,
                                                            modules:
                                                                allModules.filter(
                                                                    (m: any) =>
                                                                        currentPermissions.modules.includes(
                                                                            m.id,
                                                                        ),
                                                                ),
                                                            pages: currentPermissions.pages,
                                                            permissions:
                                                                Object.fromEntries(
                                                                    allPermissions.map(
                                                                        (
                                                                            perm: any,
                                                                        ) => [
                                                                            perm.name,
                                                                            currentPermissions.permissions.includes(
                                                                                perm.id,
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                        },
                                                        null,
                                                        2,
                                                    )}
                                                </code>
                                            </pre>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">
                                            Select an employee to view their
                                            permissions
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
