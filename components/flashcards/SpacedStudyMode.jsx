import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function SpacedStudyMode({ collection, onClose }) {
  const api = useApi();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (collection?.id) {
      loadFlashcards();
    }
  }, [collection?.id]);

  const loadFlashcards = async () => {
    try {
      setIsLoading(true);
      const cards = await api.flashcards.getFlashcardsForReview(collection.id);
      if (Array.isArray(cards)) {
        setFlashcards(cards);
        setCurrentIndex(0);
        setShowAnswer(false);
        setStartTime(Date.now());
      } else {
        toast.error("Error al cargar las flashcards: formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error loading flashcards:", error);
      toast.error("No se pudieron cargar las flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleReview = async (status) => {
    if (!flashcards[currentIndex]) {
      toast.error("No hay tarjeta actual para revisar");
      return;
    }

    const timeSpentMs = Date.now() - startTime;
    const currentCard = flashcards[currentIndex];

    try {
      await api.flashcards.submitReview(currentCard.id, {
        collectionId: collection.id,
        status,
        timeSpentMs,
      });

      // Si la respuesta fue incorrecta, mover la tarjeta 3 posiciones adelante
      if (status === "WRONG") {
        const updatedFlashcards = [...flashcards];
        const currentCard = updatedFlashcards.splice(currentIndex, 1)[0];
        const newPosition = Math.min(currentIndex + 3, updatedFlashcards.length);
        updatedFlashcards.splice(newPosition, 0, currentCard);
        setFlashcards(updatedFlashcards);
      }
      // Si fue parcial, mover al final
      else if (status === "PARTIAL") {
        const updatedFlashcards = [...flashcards];
        const currentCard = updatedFlashcards.splice(currentIndex, 1)[0];
        updatedFlashcards.push(currentCard);
        setFlashcards(updatedFlashcards);
      }
      // Si fue correcta, quitar de la lista
      else {
        const updatedFlashcards = flashcards.filter((_, i) => i !== currentIndex);
        setFlashcards(updatedFlashcards);
        if (currentIndex >= updatedFlashcards.length) {
          setCurrentIndex(updatedFlashcards.length - 1);
        }
      }

      setShowAnswer(false);
      setStartTime(Date.now());

      // Si no quedan más tarjetas, recargar la lista
      if (flashcards.length <= 1) {
        await loadFlashcards();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("No se pudo guardar la revisión");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h3 className="text-xl font-semibold">¡Bien hecho! 🎉</h3>
        <p className="text-muted-foreground">No hay más tarjetas para repasar por ahora.</p>
        <Button 
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/35 hover:translate-y-[-1px] active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:shadow-amber-500/15 dark:hover:shadow-amber-500/25 dark:focus:ring-offset-zinc-900"
        >
          Cerrar
        </Button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-muted-foreground">Error al cargar la tarjeta actual.</p>
        <Button 
          onClick={loadFlashcards}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/35 hover:translate-y-[-1px] active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:shadow-amber-500/15 dark:hover:shadow-amber-500/25 dark:focus:ring-offset-zinc-900"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + (showAnswer ? "-answer" : "-question")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <Card className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-amber-50 to-amber-100/20 p-6 dark:from-zinc-900 dark:to-zinc-900/20">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Pregunta:</h4>
                  <p className="text-lg text-zinc-900 dark:text-zinc-100">{currentCard.question}</p>
                </div>

                {showAnswer && (
                  <div>
                    <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Respuesta:</h4>
                    <p className="text-lg text-zinc-900 dark:text-zinc-100">{currentCard.answer}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-center space-x-4">
          {!showAnswer ? (
            <Button 
              onClick={handleShowAnswer} 
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/35 hover:translate-y-[-1px] active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:shadow-amber-500/15 dark:hover:shadow-amber-500/25 dark:focus:ring-offset-zinc-900"
            >
              Mostrar Respuesta
            </Button>
          ) : (
            <>
              <Button
                onClick={() => handleReview("WRONG")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/35 hover:translate-y-[-1px] active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:shadow-red-500/15 dark:hover:shadow-red-500/25 dark:focus:ring-offset-zinc-900"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>No me lo sé</span>
              </Button>
              <Button
                onClick={() => handleReview("PARTIAL")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-yellow-500/25 transition-all hover:shadow-xl hover:shadow-yellow-500/35 hover:translate-y-[-1px] active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 dark:shadow-yellow-500/15 dark:hover:shadow-yellow-500/25 dark:focus:ring-offset-zinc-900"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Más o menos</span>
              </Button>
              <Button
                onClick={() => handleReview("CORRECT")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/35 hover:translate-y-[-1px] active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:shadow-green-500/15 dark:hover:shadow-green-500/25 dark:focus:ring-offset-zinc-900"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Bien</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
