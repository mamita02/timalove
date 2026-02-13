import { MatchingManager } from "@/components/admin/MatchingManager";

const Matching = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matching</h1>
        <p className="text-muted-foreground">
          Créez des matchs entre vos membres
        </p>
      </div>
      <MatchingManager />
    </div>
  );
};

export default Matching;
