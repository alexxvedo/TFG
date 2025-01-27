import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useRouter } from "next/navigation";
import { isToday } from "date-fns";

export default function FlashcardHome({ card }) {
  const router = useRouter();

  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const setActiveCollection = useCollectionStore(
    (state) => state.setActiveCollection
  );

  const handleClick = (e) => {
    e.preventDefault(); // Evita la navegación predeterminada del link para ejecutar lógica adicional
    setActiveCollection(card);
    router.push(`/workspaces/${activeWorkspace.id}/collection/${card.id}`);
  };

  // Calcular los estados de las flashcards en tiempo real
  const sinHacer =
    card.flashcards?.filter((flashcard) => flashcard.status === "SIN_HACER")
      .length || 0;
  const hechas =
    card.flashcards?.filter(
      (flashcard) =>
        flashcard.status === "COMPLETADA" &&
        !isToday(new Date(flashcard.nextReviewDate))
    ).length || 0;
  const porRevisar =
    card.flashcards?.filter(
      (flashcard) =>
        flashcard.status === "COMPLETADA" &&
        isToday(new Date(flashcard.nextReviewDate))
    ).length || 0;

  return (
    <Link
      href={`/workspaces/${activeWorkspace.id}/collection/${card.id}`}
      passHref
    >
      <Card
        key={card}
        onClick={handleClick} // Ejecuta la función en el click
        className="group relative overflow-hidden flex flex-col h-32 justify-center items-center "
      >
        <CardContent className="p-4 flex flex-col justify-center items-center w-full gap-8">
          <h3 className="font-semibold text-xl text-white">{card.name}</h3>
          <div className="flex items-center justify-between gap-8">
            <p className="text-xs md:text-sm text-gray-500">
              <span className="font-semibold text-lg md:text-sm xl:text-lg">
                Sin hacer: <span className="text-red-500">{sinHacer}</span>
              </span>
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              <span className="font-semibold text-lg md:text-sm xl:text-lg">
                Hechas: <span className="text-blue-500">{hechas}</span>
              </span>
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              <span className="font-semibold text-lg md:text-sm xl:text-lg">
                Por revisar:{" "}
                <span className="text-green-500">{porRevisar}</span>
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
