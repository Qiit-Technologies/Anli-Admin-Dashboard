import Header from "./components/layout/header";
import Sidebar from "./components/layout/sidebar";
import Image from "next/image";
import PaymentTable from "./components/general/paymentTable";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="General Info" />
        <main className="px-12 py-10 space-y-6 bg-white">
          {/* Top grid section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-[#F5EFEB] p-6 rounded-xl shadow-sm text-center space-y-3 w-[387px]">
              <div className="mx-auto rounded-full flex items-center justify-center">
                <Image
                  src="/sample-company.png"
                  alt="Company Logo"
                  width={180}
                  height={180}
                />
              </div>
              <h2 className="text-xl font-semibold text-[#0B0B0B]">
                Corner Stone
              </h2>
              <p className="text-md font-medium text-[#0B0B0B]">
                cornerstone1@gmail.com
              </p>
              <p className="text-sm text-[#0B0B0B]">+234 8070 234 000</p>
              <button className="rounded-[10px] mt-4 bg-[#007BFF] hover:bg-blue-700 text-white w-[260px] !py-[16px] !px-[37px]">
                Add more modules
              </button>
            </div>

            {/* Assigned Modules */}
            <div className="md:col-span-2 space-y-4">
              <div className=" bg-white p-6 rounded-xl space-y-4 border-1 border-[#E0E0E0]">
                <h3 className="text-sm font-semibold text-[#354052]">
                  Assigned Modules
                </h3>
                <hr className="my-3 m-0 border-1 border-[#DFDFDF]"></hr>
                <ul className="text-sm space-y-4">
                  <li className="flex justify-between">
                    <span className="font-medium text-[#474747]">
                      House Keeping
                    </span>
                    <span className="font-normal text-[#111111]">
                      0 updates (Inactive for 3 weeks)
                    </span>
                  </li>
                  <li className="flex justify-between font-normal">
                    <span className="font-medium text-[#474747]">Bookings</span>
                    <span className="font-normal text-[#111111]">
                      120 bookings created this month
                    </span>
                  </li>
                  <li className="flex justify-between font-normal">
                    <span className="font-medium text-[#474747]">Payments</span>
                    <span className="font-normal text-[#111111]">
                      50 successful transactions
                    </span>
                  </li>
                </ul>
              </div>

              <div className=" bg-white p-6 rounded-xl space-y-4 border-1 border-[#E0E0E0]">
                <div className="text-sm">
                  <h4 className="font-semibold mb-2 text-[#354052]">
                    Low Activity Alerts
                  </h4>
                  <h4 className="mb-2 text-[#474747] text-sm font-normal">
                    inactivity or underuse by module:
                  </h4>

                  <hr className="my-3 m-0 border-1 border-[#DFDFDF]"></hr>
                  <ul className="space-y-4">
                    <li>⚠️ Housekeeping module not used in 3 weeks</li>
                    <li>⚠️ Only 1 report generated this month</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* General Activity + Plan Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graph placeholder */}
            <div className="lg:col-span-2 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">General Actives Growth</h3>
                <div className="space-x-2 text-sm text-gray-500 border-1 border-gray-300 rounded-md">
                  <button className="hover:text-black bg-gray-50 border-r-1 rounded-tl-md rounded-bl-md border-[#D0D5DD] py-[10px] px-[16px]">
                    12 months
                  </button>
                  <button className="hover:text-black border-r-1 border-[#D0D5DD] py-[10px] px-[16px]">
                    30 days
                  </button>
                  <button className="hover:text-black py-[10px] px-[16px]">
                    7 days
                  </button>
                </div>
              </div>
              <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-500">
                {/* Replace this with real chart */}
                Activity Chart Placeholder
              </div>
            </div>

            {/* Current Plan */}
            <div className="bg-white p-6 rounded-xl border-1 space-y-3">
              <h4 className="font-medium text-md mb-2 text-gray-900">
                Current Plan
              </h4>

              <hr className="my-3 m-0 border-1 border-[#DFDFDF]"></hr>
              <div className="text-sm text-gray-600 pb-8 border-b-2 border-[#dfdfdf]">
                <ul className="text-sm space-y-4">
                  <li className="flex justify-between">
                    <span className="font-medium text-[#474747]">
                      Plan Name
                    </span>
                    <span className="font-normal text-[#111111]">Free</span>
                  </li>
                  <li className="flex justify-between font-normal">
                    <span className="font-medium text-[#474747]">
                      Renewal Date:
                    </span>
                    <span className="font-normal text-[#111111]">
                      July 15, 2025. 3 days left
                    </span>
                  </li>
                  <li className="flex justify-between font-normal">
                    <span className="font-medium text-[#474747]">
                      Billing Cycle
                    </span>
                    <span className="font-normal text-[#111111]">Monthly</span>
                  </li>
                  <li className="flex justify-between font-normal">
                    <span className="font-medium text-[#474747]">
                      Modules Allowed
                    </span>
                    <span className="font-normal text-[#111111]">
                      Front office, Restaurant, Bar
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-2 justify-between">
                <button className="rounded-[10px] bg-[#007BFF] hover:bg-blue-700 text-white py-[16px] px-[37px] text-md">
                  Upgrade Plan
                </button>
                <button className="rounded-[10px] font-semibold text-[#007BFF] border-1 border-[#007BFF] px-[37px] text-md">
                  Send Payment Reminder
                </button>
              </div>
            </div>
          </div>
          <PaymentTable />
        </main>
      </div>
    </div>
  );
}
