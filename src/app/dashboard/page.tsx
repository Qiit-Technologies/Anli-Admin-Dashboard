import { Button } from "@/components/ui/button";
import Header from "./components/layout/header";
import Sidebar from "./components/layout/sidebar";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-10 space-y-6 bg-[#FAFAFA]">
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
                <ul className="text-sm text-[#474747] font-medium space-y-2">
                  <li className="flex justify-between">
                    <span>House Keeping</span>
                    <span className="text-orange-500 font-normal">
                      0 updates (Inactive for 3 weeks)
                    </span>
                  </li>
                  <li className="flex justify-between font-normal">
                    <span>Bookings</span>
                    <span>120 bookings created this month</span>
                  </li>
                  <li className="flex justify-between font-normal">
                    <span>Payments</span>
                    <span>50 successful transactions</span>
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
                  <ul className="space-y-1 text-orange-500">
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
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">General Actives Growth</h3>
                <div className="space-x-2 text-sm text-gray-500">
                  <button className="hover:text-black">12 months</button>
                  <button className="hover:text-black">30 days</button>
                  <button className="hover:text-black">7 days</button>
                </div>
              </div>
              <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-500">
                {/* Replace this with real chart */}
                Activity Chart Placeholder
              </div>
            </div>

            {/* Current Plan */}
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-3">
              <h3 className="text-sm font-medium text-gray-800">
                Current Plan
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Plan Name: <strong>Free</strong>
                </p>
                <p>
                  Renewal Date: <strong>July 15, 2025</strong>{" "}
                  <span className="text-orange-500">(3 days left)</span>
                </p>
                <p>
                  Billing Cycle: <strong>Monthly</strong>
                </p>
                <p>Modules Allowed: Front office, Restaurant, Bar</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Upgrade Plan</Button>
                <Button>Send Payment Reminder</Button>
              </div>
            </div>
          </div>

          {/* Current Transactions */}
          <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-800">
                Current Payment Transaction
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Select dates
                </Button>
                <Button variant="outline" size="sm">
                  Filters
                </Button>
              </div>
            </div>

            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Payment Method</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    date: "23rd March 2024",
                    amount: "₦240,000,000.00",
                    method: "Transfer",
                    status: "Paid",
                    color: "green",
                  },
                  {
                    date: "01 January 2024",
                    amount: "₦240,000,000.00",
                    method: "POS",
                    status: "Transaction Filed",
                    color: "red",
                  },
                  {
                    date: "31st June 2025",
                    amount: "₦240,000,000.00",
                    method: "Cash",
                    status: "Paid",
                    color: "green",
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 px-3">{row.date}</td>
                    <td className="py-2 px-3">{row.amount}</td>
                    <td className="py-2 px-3">{row.method}</td>
                    <td className="py-2 px-3">
                      <span className={`text-${row.color}-500 font-medium`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-blue-500 cursor-pointer">
                      View
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
