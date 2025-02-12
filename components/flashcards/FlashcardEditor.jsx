import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Save, X, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/api";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useUser } from "@clerk/nextjs";

export default function FlashcardEditor({
  open,
  onOpenChange,
  collection,
  onFlashcardAdded,
}) {
  const [questionContent, setQuestionContent] = useState("");
  const [answerContent, setAnswerContent] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const questionRef = useRef(null);
  const answerRef = useRef(null);
  const api = useApi();
  const { addFlashcard, updateFlashcard, removeFlashcard } =
    useCollectionStore();
  const { user } = useUser();

  useEffect(() => {
    if (open && collection) {
      fetchFlashcards();
    }
  }, [open, collection]);

  useEffect(() => {
    if (!open) {
      setQuestionContent("");
      setAnswerContent("");
      setEditingFlashcard(null);
      setIsEditing(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (isEditing && questionRef.current) {
        setTimeout(() => {
          questionRef.current.focus();
        }, 100);
      } else if (!isEditing && questionRef.current) {
        setTimeout(() => {
          questionRef.current.focus();
        }, 100);
      }
    }
  }, [isEditing, open]);

  const fetchFlashcards = async () => {
    if (!collection?.id) return;

    try {
      const response = await api.flashcards.listByCollection(collection.id);
      setFlashcards(response.data || []);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error("Error al cargar las flashcards");
    }
  };

  const saveFlashcard = async () => {
    if (!questionContent.trim() || !answerContent.trim()) {
      toast.error("Por favor, completa tanto la pregunta como la respuesta.");
      return;
    }

    try {
      setIsLoading(true);
      const newFlashcard = {
        question: questionContent,
        answer: answerContent,
        status: "SIN_HACER",
        collectionId: collection.id,
      };

      console.log("Intentando guardar flashcard:", newFlashcard);
      console.log("Estado actual:", {
        isEditing,
        editingFlashcard,
        collection,
      });

      let savedFlashcard;
      if (isEditing && editingFlashcard) {
        console.log("Actualizando flashcard existente:", editingFlashcard.id);
        const response = await api.flashcards.update(
          collection.id,
          editingFlashcard.id,
          newFlashcard
        );
        savedFlashcard = response.data;
        console.log("Flashcard actualizada:", savedFlashcard);
        updateFlashcard(savedFlashcard);
      } else {
        console.log("Creando nueva flashcard");
        const response = await api.flashcards.create(
          collection.id,
          newFlashcard,
          user.id
        );
        savedFlashcard = response.data;
        console.log("Nueva flashcard creada:", savedFlashcard);
        addFlashcard(savedFlashcard);
      }

      setQuestionContent("");
      setAnswerContent("");
      setEditingFlashcard(null);
      setIsEditing(false);

      if (onFlashcardAdded) {
        onFlashcardAdded(savedFlashcard);
      }

      toast.success(
        isEditing
          ? "Flashcard actualizada correctamente"
          : "Flashcard creada correctamente"
      );

      await fetchFlashcards();
    } catch (error) {
      console.error("Error saving flashcard:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      toast.error(
        isEditing
          ? "Error al actualizar la flashcard"
          : "Error al crear la flashcard"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlashcard = async (id) => {
    try {
      setIsLoading(true);
      await api.flashcards.delete(id);

      // Eliminar la flashcard del estado local
      setFlashcards((currentFlashcards) =>
        currentFlashcards.filter((f) => f.id !== id)
      );

      // Eliminar la flashcard de la colección activa
      removeFlashcard(id);

      toast.success("Flashcard eliminada correctamente");

      if (onFlashcardAdded) {
        onFlashcardAdded();
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Error al eliminar la flashcard");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (flashcard) => {
    setEditingFlashcard(flashcard);
    setQuestionContent(flashcard.question);
    setAnswerContent(flashcard.answer);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingFlashcard(null);
    setQuestionContent("");
    setAnswerContent("");
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[900px] bg-gradient-to-br from-white to-zinc-50/95 dark:from-zinc-900 dark:to-zinc-950/95 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-indigo-500/10"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            {editingFlashcard ? "Editar Flashcard" : "Crear Nueva Flashcard"}
          </DialogTitle>
          <p className="text-zinc-600 dark:text-zinc-400">
            {editingFlashcard
              ? "Modifica el contenido de tu flashcard"
              : "Escribe el contenido de tu flashcard. ¡Sé creativo y preciso!"}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-[300px,1fr] gap-6">
          {/* Lista de Flashcards */}
          <div className="border-r border-zinc-200 dark:border-zinc-800 pr-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Flashcards
              </h3>
              {editingFlashcard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                  className="text-xs"
                >
                  + Nueva
                </Button>
              )}
            </div>
            <ScrollArea className="h-[500px] pr-4 -mr-4">
              <div className="space-y-3 pr-4">
                {flashcards.map((flashcard) => (
                  <motion.div
                    key={flashcard.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg overflow-hidden"
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        editingFlashcard?.id === flashcard.id
                          ? "ring-2 ring-emerald-500 shadow-lg"
                          : "hover:scale-[1.02]"
                      }`}
                      onClick={() => startEditing(flashcard)}
                    >
                      <p className="font-medium text-sm mb-2 line-clamp-2 text-zinc-900 dark:text-zinc-100">
                        {flashcard.question}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {flashcard.answer}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Pregunta
              </label>
              <div className="group relative">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur transition duration-1000 group-hover:opacity-30 group-hover:duration-200"></div>
                <Textarea
                  ref={questionRef}
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Escribe la pregunta o el concepto principal..."
                  className="relative min-h-[200px] resize-none rounded-lg border-zinc-200 bg-card px-4 py-3 text-base placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-800 dark:placeholder:text-zinc-600 dark:focus:border-emerald-400 dark:focus:ring-emerald-400 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Respuesta
              </label>
              <div className="group relative">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur transition duration-1000 group-hover:opacity-30 group-hover:duration-200"></div>
                <Textarea
                  ref={answerRef}
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Escribe la respuesta o la explicación..."
                  className="relative min-h-[200px] resize-none rounded-lg border-zinc-200 bg-card px-4 py-3 text-base placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-800 dark:placeholder:text-zinc-600 dark:focus:border-emerald-400 dark:focus:ring-emerald-400 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={saveFlashcard}
                disabled={
                  !questionContent.trim() || !answerContent.trim() || isLoading
                }
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/35 hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
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
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {editingFlashcard ? "Actualizar" : "Guardar"} Flashcard
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
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
            className="text-emerald-500"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            Tip: Escribe preguntas claras y respuestas concisas para un mejor
            aprendizaje
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
