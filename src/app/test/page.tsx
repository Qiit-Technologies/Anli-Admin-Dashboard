import React from 'react';
import { FiArrowLeft, FiBell, FiInfo, FiSearch } from 'react-icons/fi';
import { IoCheckbox } from 'react-icons/io5';
import { RiCheckboxCircleFill } from 'react-icons/ri';

export default function TeamManagement() {
    return (
        <div className="min-h-screen bg-white px-8 pb-4">
            {/* Header */}
            <header className="border-b border-l border-gray-200 bg-white ml-[180px] rounded-sm">
                <div className="flex items-center justify-between px-8 py-4">
                    <h1 className="text-xl font-semibold text-black ml-4 font-sans">
                        Welcome Super Admin
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="relative mr-[100px]">
                            <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search"
                                className="w-80 rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="rounded-full border p-1.5">
                            <FiInfo className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className=" rounded-full border p-1.5">
                            <FiBell className="h-5 w-5 text-gray-500 " />
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                            SA
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex justify-between p-4">
                <div className="flex items-center gap-3 text-lg text-black">
                    <FiArrowLeft className="h-5 w-6 mr-4" />
                    <span className="font-bold text-black font-sans">
                        Add Team Members
                    </span>
                    <span className="text-xs ml-2 p-2 rounded-md bg-gray-100 font-sans text-gray-600">
                        Draft
                    </span>
                </div>
                <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                    <RiCheckboxCircleFill className="h-5 w-5 text-orange-400 rounded-full" />
                    Auto save on
                </div>
            </div>

            <div className="border-[0.5px]" />

            <div className="flex">
                {/* Sidebar */}
                <div className="w-[400px] bg-white">
                    <div className="mt-8 space-y-6">
                        <div className="flex items-start gap-3">
                            <div className="rounded-sm p-1">
                                <IoCheckbox className="h-5 w-5 text-orange-500 rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-black font-sans">
                                    Add Team members
                                </h3>
                                <p className="text-sm text-black font-sans">
                                    Setting up shop allows the tailor reach more
                                    customers on regalia
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="rounded-sm p-1">
                                <IoCheckbox className="h-5 w-5 text-gray-400 rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-black font-sans">
                                    Assign roles
                                </h3>
                                <p className="text-sm text-gray-400 font-sans">
                                    This allows customers easy access to locate
                                    tailors around them.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="rounded-sm p-1">
                                <IoCheckbox className="h-5 w-5 text-gray-400 rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-black font-sans">
                                    Business Setting
                                </h3>
                                <p className="text-sm text-gray-400 font-sans">
                                    This allows customers easy access to locate
                                    tailors around them.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-6 border rounded-lg mt-6">
                    <div className="mt-6">
                        <h2 className="text-2xl font-semibold text-black font-sans">
                            Team Members
                        </h2>
                        <p className="text-sm text-gray-400 font-sans">
                            Manage who access to this workspace
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-black font-sans">
                                    Add Team members
                                </h3>
                                <p className="text-sm text-gray-400 font-sans">
                                    Setting up shop allows the tailor reach more{' '}
                                    <br /> customers on regalia
                                </p>
                            </div>
                            <button className="px-4 py-2 border border-blue-600 rounded-md text-sm text-blue-600 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-sans">
                                Import CSV
                            </button>
                        </div>

                        <div className="mt-4 flex gap-4">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    placeholder="Add name of team members"
                                    className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                />
                            </div>
                            <button className="px-4 py-2 bg-orion-blue text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-sans">
                                Send Invites
                            </button>
                        </div>

                        <div className="mt-16 text-center">
                            <div className="mx-auto w-16">
                                <FiSearch className="h-16 w-16 text-orange-500" />
                            </div>
                            <h3 className="mt-4 font-medium text-gray-600 font-sans">
                                No Members added currently
                            </h3>
                            <p className="mt-1 text-sm text-gray-400 font-sans">
                                Setting up shop allows the tailor reach more
                                <br /> customers on regalia
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto text-center">
                        <button className="mt-8 w-[350px] py-2 bg-orion-blue text-white rounded-md text-sm font-medium hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 opacity-60 font-sans">
                            Continue
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
