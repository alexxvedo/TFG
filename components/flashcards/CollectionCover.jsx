import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useRouter } from "next/navigation";
import { isToday } from "date-fns";

export default function CollectionCover({ collection }) {
  const router = useRouter();
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const setActiveCollection = useCollectionStore(
    (state) => state.setActiveCollection
  );

  const handleClick = (e) => {
    e.preventDefault();
    setActiveCollection(collection);
    router.push(`/workspaces/${activeWorkspace.id}/collection/${collection.id}`);
  };

  // Calcular estadísticas de las flashcards
  const totalCards = collection.flashcards?.length || 0;
  const reviewDueCards = collection.flashcards?.filter(card => 
    card.nextReviewDate && isToday(new Date(card.nextReviewDate))
  ).length || 0;
  const newCards = collection.flashcards?.filter(card => 
    card.reviewCount === 0
  ).length || 0;

  return (
    <Link
      href={`/workspaces/${activeWorkspace.id}/collection/${collection.id}`}
      passHref
    >
      <Card
        onClick={handleClick}
        className="group relative overflow-hidden flex flex-col h-32 justify-center items-center hover:border-primary transition-colors"
      >
        <CardContent className="p-4 flex flex-col justify-center items-center w-full gap-4">
          <h3 className="font-semibold text-xl">{collection.name}</h3>
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col items-center">
              <span className="font-medium">{totalCards}</span>
              <span>Total</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">{reviewDueCards}</span>
              <span>Due</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">{newCards}</span>
              <span>New</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
