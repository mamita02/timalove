import { InscriptionsManager } from "@/components/AdminDashboard";
import { AdminLayout } from "../components/admin/AdminLayout";

const AdminInscriptions = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <InscriptionsManager />
      </div>
    </AdminLayout>
  );
};

export default AdminInscriptions;