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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Save, X, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const questionRef = useRef(null);
  const answerRef = useRef(null);

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
    try {
      const response = await fetch(
        `http://localhost:3001/collections/${collection.id}/flashcards`
      );
      if (!response.ok) {
        throw new Error("Error al cargar las flashcards");
      }
      const data = await response.json();
      setFlashcards(data);
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
      let response;
      const newFlashcard = {
        question: questionContent,
        answer: answerContent,
      };

      if (isEditing && editingFlashcard) {
        response = await fetch(
          `http://localhost:3001/flashcards/${editingFlashcard.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newFlashcard),
          }
        );
      } else {
        response = await fetch(
          `http://localhost:3001/collections/${collection.id}/flashcards`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newFlashcard),
          }
        );
      }

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const savedFlashcard = await response.json();

      // Actualizar la lista local de flashcards sin recargar
      if (isEditing) {
        setFlashcards(flashcards.map(f => 
          f.id === editingFlashcard.id ? savedFlashcard : f
        ));
      } else {
        setFlashcards(prev => [...prev, savedFlashcard]);
      }

      // Notificar al componente padre
      if (onFlashcardAdded) {
        onFlashcardAdded(savedFlashcard);
      }

      // Limpiar el formulario
      setQuestionContent("");
      setAnswerContent("");
      setEditingFlashcard(null);
      setIsEditing(false);

      toast.success(
        isEditing
          ? "Flashcard actualizada con éxito!"
          : "Flashcard añadida con éxito!"
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        isEditing
          ? "Error al actualizar la flashcard"
          : "Error al crear la flashcard"
      );
    }
  };

  const editFlashcard = (flashcard) => {
    setQuestionContent(flashcard.question);
    setAnswerContent(flashcard.answer);
    setEditingFlashcard(flashcard);
    setIsEditing(true);
    setTimeout(() => {
      if (questionRef.current) {
        questionRef.current.focus();
      }
    }, 100);
  };

  const startNewFlashcard = () => {
    setQuestionContent("");
    setAnswerContent("");
    setEditingFlashcard(null);
    setIsEditing(false);
    setTimeout(() => {
      if (questionRef.current) {
        questionRef.current.focus();
      }
    }, 100);
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
                  onClick={startNewFlashcard}
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
                      onClick={() => editFlashcard(flashcard)}
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
                  className="relative min-h-[200px] resize-none rounded-lg border-zinc-200 bg-white/80 px-4 py-3 text-base placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900/80 dark:placeholder:text-zinc-600 dark:focus:border-emerald-400 dark:focus:ring-emerald-400 backdrop-blur-sm"
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
                  className="relative min-h-[200px] resize-none rounded-lg border-zinc-200 bg-white/80 px-4 py-3 text-base placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900/80 dark:placeholder:text-zinc-600 dark:focus:border-emerald-400 dark:focus:ring-emerald-400 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={saveFlashcard}
                disabled={!questionContent.trim() || !answerContent.trim()}
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
