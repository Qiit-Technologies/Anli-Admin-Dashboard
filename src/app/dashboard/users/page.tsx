import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import UsersTable from "../components/users/usersTable";

export default function PaymentHistoryPage() {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Payment History" />
        <main className="px-12 py-10 space-y-6 bg-white">
          <UsersTable />
        </main>
      </div>
    </div>
  );
}
