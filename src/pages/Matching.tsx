import { AdminLayout } from "@/components/admin/AdminLayout";
import { MatchingManager } from "@/components/admin/MatchingManager";

const Matching = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <MatchingManager />
      </div>
    </AdminLayout>
  );
};

export default Matching;
