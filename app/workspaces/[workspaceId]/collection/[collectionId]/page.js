"use client";

import { useEffect, useState, useCallback } from "react";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
} from "@/components/ui/dialog";
import { Plus, Bot, ArrowLeft, Play } from "lucide-react";
import { useParams } from "next/navigation";
import AIGenerator from "@/components/flashcards/AIGenerator";
import FlashcardList from "@/components/flashcards/FlashcardList";
import FlashcardEditor from "@/components/flashcards/FlashcardEditor";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useStudySessionStore } from "@/store/studySession-store/studySession-store";
import { useUserStore } from "@/store/user-store/user-store";
import Link from "next/link";
import Stats from "@/components/flashcards/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

export default function CollectionsPage() {
  const params = useParams();
  const router = useRouter();
  const { activeWorkspace } = useSidebarStore();
  const { activeCollection, setActiveCollection } = useCollectionStore();
  const { updateStudySession } = useStudySessionStore();
  const { user } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [flashcardsDataBD, setFlashcardsDataBD] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [openEditor, setOpenEditor] = useState(false);
  const [currentCollectionId, setCurrentCollectionId] = useState(null);

  const fetchFlashcardsData = useCallback(async (collectionId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/collections/${collectionId}/stats`
      );
      const data = await response.json();
      setFlashcardsDataBD(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const fetchCollection = useCallback(
    async (collectionId) => {
      if (!collectionId) {
        console.error("No collection ID provided");
        return;
      }

      try {
        setIsLoading(true);
        console.log("Fetching collection data for:", collectionId);

        const collectionResponse = await fetch(
          `http://localhost:3001/workspaces/${params.workspaceId}/collections`
        );

        if (!collectionResponse.ok) {
          throw new Error("Error al cargar la colección");
        }

        const collections = await collectionResponse.json();
        const currentCollection = collections.find(
          (c) => c.id === parseInt(collectionId)
        );

        if (!currentCollection) {
          throw new Error("Colección no encontrada");
        }

        console.log("Fetching flashcards for collection:", collectionId);
        const flashcardsResponse = await fetch(
          `http://localhost:3001/collections/${collectionId}/flashcards`
        );

        if (!flashcardsResponse.ok) {
          throw new Error("Error al cargar las flashcards");
        }

        const flashcards = await flashcardsResponse.json();

        setActiveCollection({
          ...currentCollection,
          flashcards: flashcards,
        });

        await fetchFlashcardsData(collectionId);
      } catch (error) {
        console.error("Error loading collection:", error);
        setActiveCollection(null);
      } finally {
        setIsLoading(false);
      }
    },
    [params.workspaceId, setActiveCollection, fetchFlashcardsData]
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !params.collectionId) return;

    const newCollectionId = parseInt(params.collectionId);

    // Solo cargar si cambia la colección
    if (newCollectionId !== currentCollectionId) {
      setCurrentCollectionId(newCollectionId);
      fetchCollection(newCollectionId);
    }
  }, [isHydrated, params.collectionId, currentCollectionId, fetchCollection]);

  const handleAddFlashcard = useCallback(() => {
    setOpenEditor(true);
  }, []);

  const handleFlashcardAdded = useCallback(async () => {
    if (currentCollectionId) {
      await fetchCollection(currentCollectionId);
    }
  }, [currentCollectionId, fetchCollection]);

  const handleCreateStudySession = useCallback(async () => {
    if (!activeCollection?.id || !user?.id) return;

    try {
      const response = await fetch(
        `http://localhost:3001/collections/${activeCollection.id}/studySession`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            collectionId: activeCollection.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear la sesión de estudio");
      }

      const studySession = await response.json();
      updateStudySession(studySession);
      router.push(
        `/workspaces/${params.workspaceId}/collection/${params.collectionId}/studySession/${studySession.id}`
      );
    } catch (error) {
      console.error("Error:", error);
    }
  }, [
    activeCollection?.id,
    params.workspaceId,
    params.collectionId,
    router,
    user?.id,
    updateStudySession,
  ]);

  if (!isHydrated || isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Cargando colección...</div>
          <div className="text-sm text-gray-500">Por favor espera</div>
        </div>
      </div>
    );
  }

  if (!activeCollection) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">No se pudo cargar la colección</div>
          <div className="text-sm text-gray-500">
            <Link
              href={`/workspaces/${params.workspaceId}/collections`}
              className="text-blue-500 hover:underline"
            >
              Volver a colecciones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container min-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Link
                href={`/workspaces/${params.workspaceId}/collections`}
                className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver</span>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                {activeCollection.name}
              </h1>
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setOpenEditor(true)}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/35 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:shadow-emerald-500/15 dark:hover:shadow-emerald-500/25 dark:focus:ring-offset-zinc-900 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                <div className="relative flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:rotate-180"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span className="relative bg-gradient-to-r from-white to-white bg-clip-text font-semibold tracking-wide">
                    Añadir Flashcard
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
              </button>
              <button
                onClick={() => setIsAIDialogOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-xl hover:shadow-sky-500/35 hover:translate-y-[-1px] active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:shadow-sky-500/15 dark:hover:shadow-sky-500/25 dark:focus:ring-offset-zinc-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-sparkles"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
                Generar con IA
              </button>
              <button
                onClick={handleCreateStudySession}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/35 hover:translate-y-[-1px] active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:shadow-amber-500/15 dark:hover:shadow-amber-500/25 dark:focus:ring-offset-zinc-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-brain"
                >
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                </svg>
                Iniciar Estudio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container min-w-full mx-auto px-6 py-4 ">
        <div className="flex justify-center">
          <Tabs defaultValue="flashcards" className="w-full max-w-[full]">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm p-1 text-zinc-500 dark:text-zinc-400 mx-auto mb-8 border border-zinc-200/20 dark:border-zinc-800/20 shadow-xl shadow-indigo-500/5">
              <TabsTrigger
                value="flashcards"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book-open"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Flashcards
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-bar-chart-3"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
                Estadísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards">
              <div className="rounded-2xl max-h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-xl shadow-indigo-500/5">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="inline-flex h-9 items-center justify-start rounded-full bg-zinc-100/50 dark:bg-zinc-800/30 p-1 text-zinc-500 dark:text-zinc-400 mb-8 space-x-1">
                    <TabsTrigger
                      value="all"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400"
                    >
                      Todas
                    </TabsTrigger>
                    <TabsTrigger
                      value="mastered"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400"
                    >
                      Dominadas
                    </TabsTrigger>
                    <TabsTrigger
                      value="learning"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400"
                    >
                      Aprendiendo
                    </TabsTrigger>
                    <TabsTrigger
                      value="new"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400"
                    >
                      Nuevas
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-0">
                    <div className="grid grid-cols-1 gap-4">
                      <FlashcardList
                        flashcards={activeCollection.flashcards || []}
                        onEdit={(flashcard) => {
                          setOpenEditor(true);
                        }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-8 shadow-xl shadow-indigo-500/5">
                <div className="min-w-full">
                  <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Actividad Reciente */}
                      <div className="group rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 border border-indigo-100/50 dark:border-indigo-900/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="rounded-full bg-indigo-500/10 p-2.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-indigo-500"
                            >
                              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                              <path d="M21 3v5h-5" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            Actividad Reciente
                          </h3>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                              Creadas hoy
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {flashcardsDataBD?.creadasHoy || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                flashcards
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                              Últimos 7 días
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {flashcardsDataBD?.creadasUltimos7Dias || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                flashcards
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estado General */}
                      <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 p-6 border border-purple-100/50 dark:border-purple-900/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="rounded-full bg-purple-500/10 p-2.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-purple-500"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <path d="m9 11 3 3L22 4" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                            Estado General
                          </h3>
                        </div>
                        <div className="space-y-6">
                          {flashcardsDataBD?.estados?.map((estado) => (
                            <div key={estado.status}>
                              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                {estado.status === "SIN_HACER"
                                  ? "Por hacer"
                                  : estado.status === "REVISAR"
                                  ? "Para revisar"
                                  : "Completadas"}
                              </p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                  {estado.count}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                  flashcards
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progreso */}
                      <div className="group rounded-2xl bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 p-6 border border-fuchsia-100/50 dark:border-fuchsia-900/50 transition-all hover:shadow-lg hover:shadow-fuchsia-500/10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="rounded-full bg-fuchsia-500/10 p-2.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-fuchsia-500"
                            >
                              <path d="M12 20v-6" />
                              <path d="M12 14v-6" />
                              <path d="M12 8V2" />
                              <path d="M3 20c0-3.87 3.13-7 7-7" />
                              <path d="M14 13c3.87 0 7 3.13 7 7" />
                              <path d="M3 12c0-3.87 3.13-7 7-7" />
                              <path d="M14 5c3.87 0 7 3.13 7 7" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                            Progreso
                          </h3>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400 mb-1">
                              Completadas (7 días)
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {flashcardsDataBD?.completadasUltimos7Dias || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                flashcards
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400 mb-1">
                              Total flashcards
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {activeCollection?.flashcards?.length || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                flashcards
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <FlashcardEditor
        open={openEditor}
        onOpenChange={setOpenEditor}
        collection={activeCollection}
        onFlashcardAdded={handleFlashcardAdded}
      />

      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="min-h-[80vh] min-w-[80vw] max-w-[80vw] max-h-[80vh] flex-1 flex items-center justify-center">
          <AIGenerator collection={activeCollection} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
