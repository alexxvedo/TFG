"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  RefreshCw,
  Check,
  X,
  Clock,
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useStudySessionStore } from "@/store/studySession-store/studySession-store";
import { useUserStore } from "@/store/user-store/user-store";
import { useApi } from "@/lib/api";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";

export default function StudySession({ params }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const activeCollection = useCollectionStore(
    (state) => state.activeCollection
  );
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const studySession = useStudySessionStore((state) => state.studySession);
  const api = useApi();

  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [evaluation, setEvaluation] = useState("none");
  const [studyProgress, setStudyProgress] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [completedCards, setCompletedCards] = useState(0);

  console.log("Current collection:", activeCollection);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await api.flashcards.listByCollection(
          params.collectionId
        );
        const data = response.data;

        // Incluir todas las flashcards que no están completadas
        const filteredFlashcards = data.filter(
          (card) => !card.completionDate && card.status === "SIN_HACER"
        );

        console.log("Flashcards disponibles:", filteredFlashcards);
        setFlashcards(filteredFlashcards);
        setTotalCards(filteredFlashcards.length);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
    };

    fetchFlashcards();
  }, [params.collectionId]);

  const handleEvaluation = async (status) => {
    try {
      // Calcular el siguiente intervalo de repaso basado en el resultado
      const now = new Date();
      let nextReviewDate = new Date();

      // Implementar el algoritmo SM-2 de repetición espaciada
      const getNextReviewInterval = (status) => {
        switch (status) {
          case "MAL": // Si la respuesta fue incorrecta
            return 1; // Revisar en 1 día
          case "REGULAR": // Si la respuesta fue parcialmente correcta
            return 3; // Revisar en 3 días
          case "BIEN": // Si la respuesta fue correcta
            return 7; // Revisar en 7 días
          default:
            return 1;
        }
      };

      const intervalDays = getNextReviewInterval(status);
      nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

      // Convertir el estado de evaluación a un resultado de revisión
      const reviewResult = {
        flashcardId: flashcards[currentCardIndex].id,
        collectionId: params.collectionId,
        result:
          status === "MAL"
            ? "WRONG"
            : status === "REGULAR"
            ? "PARTIAL"
            : "CORRECT",
        timeSpentMs: 0, // TODO: Implementar tracking de tiempo
        nextReviewDate: nextReviewDate.toISOString(),
      };

      // Enviar la revisión al backend
      await api.flashcards.submitReview(
        flashcards[currentCardIndex].id,
        reviewResult
      );

      // Incrementar el contador de tarjetas completadas
      setCompletedCards((prev) => prev + 1);

      // Actualizar el progreso basado en las tarjetas completadas
      setStudyProgress(((completedCards + 1) / totalCards) * 100);

      const updatedFlashcards = flashcards.filter(
        (_, index) => index !== currentCardIndex
      );
      setFlashcards(updatedFlashcards);

      setEvaluation("none");
      setIsFlipped(false);

      if (updatedFlashcards.length > 0) {
        const newIndex =
          currentCardIndex >= updatedFlashcards.length
            ? updatedFlashcards.length - 1
            : currentCardIndex;

        setCurrentCardIndex(newIndex);
      } else {
        setSessionCompleted(true);
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
    }
  };

  const renderEvaluationButtons = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 20 }}
      transition={{ duration: 0.3 }}
      className="mb-8 flex justify-center space-x-12"
    >
      <Button
        variant="ghost"
        onClick={() => handleEvaluation("MAL")}
        className={`
          relative h-20 w-20 rounded-full transition-all duration-300
          hover:bg-red-500/20 hover:scale-110
          ${!isFlipped ? "pointer-events-none opacity-50" : ""}
        `}
        disabled={!isFlipped}
      >
        <X className="h-12 w-12 text-red-500" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => handleEvaluation("REGULAR")}
        className={`
          relative h-20 w-20 rounded-full transition-all duration-300
          hover:bg-yellow-500/20 hover:scale-110
          ${!isFlipped ? "pointer-events-none opacity-50" : ""}
        `}
        disabled={!isFlipped}
      >
        <Clock className="h-12 w-12 text-yellow-500" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => handleEvaluation("BIEN")}
        className={`
          relative h-20 w-20 rounded-full transition-all duration-300
          hover:bg-green-500/20 hover:scale-110
          ${!isFlipped ? "pointer-events-none opacity-50" : ""}
        `}
        disabled={!isFlipped}
      >
        <Check className="h-12 w-12 text-green-500" />
      </Button>
    </motion.div>
  );

  if (sessionCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-8"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <Star className="h-16 w-16 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Study Session Completed!</h1>
          <Button
            onClick={() =>
              router.push(
                `/workspaces/${activeWorkspace.id}/collection/${activeCollection.id}`
              )
            }
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <RefreshCw className="h-5 w-5 mr-2" /> Back to Collection
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-blue-400" />
          <p>No flashcards available for study</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container w-full p-4 max-w-full flex justify-between flex-col h-screen">
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-accent"
                onClick={() =>
                  router.push(
                    `/workspaces/${activeWorkspace.id}/collection/${activeCollection.id}`
                  )
                }
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Sesión de Estudio
                </h1>
                <p className="text-sm text-muted-foreground">
                  {activeCollection?.name}
                </p>
              </div>
            </div>
            <PomodoroTimer />
          </div>
        </div>
      </div>

      <div className="flex-grow relative">
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 mb-2">
          <Progress
            value={studyProgress}
            className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-in-out"
          />
          <span className="text-zinc-400 ml-4 text-sm">
            {completedCards} / {totalCards}
          </span>
        </div>

        <div className="flex justify-center items-center h-full relative px-4 mt-8">
          <div className="w-full max-w-[800px] mx-auto">
            <Card
              onClick={() => setIsFlipped(!isFlipped)}
              className={`
                transform-gpu transition-all duration-700
                shadow-2xl cursor-pointer hover:scale-105
                ${isFlipped ? "rotate-y-180" : ""}
                bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700
              `}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                {!isFlipped ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center w-full"
                  >
                    <Target className="h-16 w-16 mx-auto mb-6 text-blue-400 animate-pulse" />
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                      {flashcards[currentCardIndex].question}
                    </h2>
                    <p className="text-zinc-400 mt-4 text-lg">
                      Click to reveal answer
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center w-full rotate-y-180"
                  >
                    <Zap className="h-16 w-16 mx-auto mb-6 text-yellow-400" />
                    <h2 className="text-3xl font-bold text-zinc-100">
                      {flashcards[currentCardIndex].answer}
                    </h2>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {renderEvaluationButtons()}

      <div className="flex justify-center space-x-6 mt-4">
        <Button
          variant="outline"
          disabled={currentCardIndex === 0}
          onClick={() => {
            setCurrentCardIndex((prev) => Math.max(0, prev - 1));
            setIsFlipped(false);
          }}
          className="border-zinc-700 text-white hover:bg-zinc-800 hover:scale-105 transition-all duration-300 px-6 py-2 text-lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Previous
        </Button>
        <Button
          variant="outline"
          disabled={currentCardIndex === flashcards.length - 1}
          onClick={() => {
            setCurrentCardIndex((prev) =>
              Math.min(flashcards.length - 1, prev + 1)
            );
            setIsFlipped(false);
          }}
          className="border-zinc-700 text-white hover:bg-zinc-800 hover:scale-105 transition-all duration-300 px-6 py-2 text-lg"
        >
          Next <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
