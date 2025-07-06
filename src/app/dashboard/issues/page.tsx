
import Header from "../components/layout/header";
import IssuesTable from "../components/issues/issuesTable";
import Sidebar from "../components/layout/sidebar";

export default function IssuesPage() {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Issues Logs" />
        <main className="px-12 py-10 space-y-6 bg-white">
          <IssuesTable />
        </main>
      </div>
    </div>
  );
}
