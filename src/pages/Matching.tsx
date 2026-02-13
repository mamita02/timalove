import { MatchingManager } from "@/components/admin/MatchingManager";
import { NotificationCenter } from "@/components/admin/NotificationCenter";

const Matching = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matching</h1>
          <p className="text-muted-foreground">
            Créez des matchs entre vos membres
          </p>
        </div>
        <NotificationCenter />
      </div>
      <MatchingManager />
    </div>
  );
};

export default Matching;
