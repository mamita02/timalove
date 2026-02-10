import { AdminLayout } from "../components/admin/AdminLayout";
import { DashboardOverview } from "../components/admin/DashboardOverview";

const Admin = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <DashboardOverview />
      </div>
    </AdminLayout>
  );
};

export default Admin;