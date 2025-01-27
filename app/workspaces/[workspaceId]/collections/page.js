"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CrearCollectionDialog from "@/components/collections/CreateCollectionDialog";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton"; // Asegúrate de que este componente esté disponible
import { isToday } from "date-fns";
import { useCollectionStore } from "@/store/collections-store/collection-store";

export default function CollectionsPage() {
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );

  const setActiveCollection = useCollectionStore(
    (state) => state.setActiveCollection
  );
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (activeWorkspace) {
      setIsLoading(false);
    }
  }, [activeWorkspace]);

  const handleCreateCollection = async (name) => {
    try {
      const response = await fetch(
        `http://localhost:3001/workspaces/${activeWorkspace.id}/collections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        throw new Error("Error creando la colección");
      }

      const newCollection = await response.json();
      updateActiveWorkspace({
        ...activeWorkspace,
        collections: [...(activeWorkspace.collections || []), newCollection],
      });
    } catch (error) {
      console.error("Error creando la colección:", error);
    }
  };

  return (
    <div className="flex-1 max-h-screen min-h-screen overflow-hidden flex flex-col bg-background items-center">
      <div className="flex items-center justify-between w-full p-4">
        <h1 className="text-2xl font-bold">
          {isLoading ? (
            <Skeleton className="w-40 h-8" />
          ) : (
            activeWorkspace?.name
          )}
        </h1>
        <CrearCollectionDialog onCreateCollection={handleCreateCollection} />
      </div>
      <Separator />

      <div className="w-full px-4 py-6">
        {isLoading ? (
          // Skeleton para la tabla
          <Table className="w-full">
            <TableHeader>
              <TableRow className="text-lg ">
                <TableHead>
                  <Skeleton className="w-20 h-6" />
                </TableHead>
                <TableHead>
                  <Skeleton className="w-20 h-6" />
                </TableHead>
                <TableHead>
                  <Skeleton className="w-20 h-6" />
                </TableHead>
                <TableHead>
                  <Skeleton className="w-20 h-6" />
                </TableHead>
                <TableHead>
                  <Skeleton className="w-20 h-6" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="w-32 h-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-12 h-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-12 h-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-12 h-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-12 h-6" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : activeWorkspace?.collections?.length > 0 ? (
          <Table className="w-full">
            <TableCaption>Lista de colecciones en el workspace</TableCaption>
            <TableHeader>
              <TableRow className="text-lg ">
                <TableHead className="text-lg ">Titulo</TableHead>
                <TableHead className="text-lg ">Sin Hacer</TableHead>
                <TableHead className="text-lg ">Hechas</TableHead>
                <TableHead className="text-lg ">Por Revisar</TableHead>
                <TableHead className="text-lg ">Total Flashcards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeWorkspace.collections.map((card) => {
                const sinHacer =
                  card.flashcards?.filter(
                    (flashcard) => flashcard.status === "SIN_HACER"
                  ).length || 0;

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

                const totalFlashcards = sinHacer + hechas + porRevisar;

                return (
                  <TableRow key={card.id}>
                    <TableCell className="font-semibold text-lg">
                      <Link
                        onClick={() => setActiveCollection(card)}
                        href={`/workspaces/${activeWorkspace.id}/collection/${card.id}`}
                      >
                        {card.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-[hsl(340,75%,55%)] font-bold text-lg">
                      <span className="flex items-center justify-center w-full">
                        {sinHacer}
                      </span>
                    </TableCell>
                    <TableCell className="text-[hsl(220,70%,50%)] font-bold text-lg">
                      <span className="flex items-center justify-center w-full">
                        {hechas}
                      </span>
                    </TableCell>
                    <TableCell className="text-[hsl(160,60%,45%)] font-bold text-lg">
                      <span className="flex items-center justify-center w-full">
                        {porRevisar}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      <span className="flex items-center justify-center w-full">
                        {totalFlashcards}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p>No se encontraron colecciones</p>
        )}
      </div>
    </div>
  );
}
