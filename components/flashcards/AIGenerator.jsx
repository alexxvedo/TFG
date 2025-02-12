import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  Bot,
  User,
  Sparkles,
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useApi } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

export default function AIGenerator({ onClose }) {
  const api = useApi();
  const { activeCollection } = useCollectionStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const chatEndRef = useRef(null);
  const [contextPrompt, setContextPrompt] = useState("");
  const { user } = useUser();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!input || isLoading || !activeCollection?.id) return;
    // Tu lógica aquí
  }, [input, isLoading, contextPrompt, activeCollection, selectedFlashcards]);

  const handleSendMessage = useCallback(async () => {
    const currentPrompt = input.trim();
    if (!currentPrompt || isLoading) return;

    // Verificar que activeCollection existe y tiene un id
    if (!activeCollection?.id) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Por favor, asegúrate de que la colección esté seleccionada antes de generar flashcards.",
          sender: "bot",
        },
      ]);
      return;
    }

    if (!contextPrompt) {
      setContextPrompt(currentPrompt);
    }

    const newMessage = {
      id: Date.now(),
      text: currentPrompt,
      sender: "user",
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Enviando solicitud con activeCollection:", activeCollection);
      const { data: result } = await api.collections.generateAIFlashcards(
        activeCollection.id,
        {
          userPrompt: currentPrompt,
          contextPrompt,
          generatedFlashcardsHistory: selectedFlashcards.map((card) => ({
            question: card.question,
            answer: card.answer,
          })),
          userPreferences: {
            focusAreas: [],
          },
        }
      );

      console.log("Respuesta del servidor:", result);

      if (!result.flashcards || result.flashcards.length === 0) {
        throw new Error("No se generaron flashcards válidas");
      }

      const generatedFlashcards = result.flashcards.map((flashcard) => ({
        id: Date.now() + Math.random(),
        question: flashcard.question,
        answer: flashcard.answer,
        topic: flashcard.topic || "general",
      }));

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `He generado ${generatedFlashcards.length} flashcards. ${
            result.metadata?.validCount || generatedFlashcards.length
          } son válidas.`,
          sender: "bot",
        },
      ]);

      setFlashcards((prev) => [...prev, ...generatedFlashcards]);
    } catch (error) {
      console.error("Error al obtener flashcards:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text:
            error.message ||
            "Hubo un error generando las flashcards. Inténtalo de nuevo.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [
    input,
    isLoading,
    contextPrompt,
    activeCollection,
    selectedFlashcards,
    api,
  ]);

  const handleKeepFlashcard = useCallback(
    async (flashcard) => {
      try {
        if (!activeCollection?.id) return;
        const newFlashcard = {
          question: flashcard.question,
          answer: flashcard.answer,
          status: "SIN_HACER",
          collectionId: activeCollection.id,
        };
        const { data: createdFlashcard } = await api.flashcards.create(
          activeCollection.id,
          newFlashcard,
          user.id
        );

        setSelectedFlashcards((prev) => [...prev, createdFlashcard]);
        setFlashcards((prev) =>
          prev.filter((card) => card.id !== flashcard.id)
        );
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [activeCollection, api]
  );

  const handleDiscardFlashcard = useCallback((id) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[800px] gap-4 p-4 w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            AI Flashcard Generator
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Transform your learning journey with AI-powered flashcards ✨
        </p>
      </motion.div>

      <div className="flex-1 flex flex-row gap-4 min-h-0">
        <Card className="flex-1 flex flex-col shadow-lg border-primary/10">
          <CardContent className="flex-1 p-4 min-h-0">
            <ScrollArea className="h-[calc(100%-1rem)]">
              <div className="flex flex-col gap-3 pb-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`flex items-start gap-3 ${
                        message.sender === "bot"
                          ? "flex-row"
                          : "flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl max-w-[80%] shadow-sm transition-all duration-200 hover:shadow-md ${
                          message.sender === "bot"
                            ? "bg-secondary/80 backdrop-blur-sm"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === "bot" ? (
                            <Bot className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="font-semibold text-sm">
                            {message.sender === "bot" ? "AI Assistant" : "You"}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {message.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl"
                  >
                    <Bot className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">
                      Creating your flashcards
                      <span className="animate-pulse">...</span>
                    </span>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-3 border-t border-primary/10">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Describe what you want to learn..."
                disabled={isLoading}
                className="shadow-sm text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="shadow-sm hover:shadow-md transition-all duration-200"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </Card>

        <Card className="w-[35%] shadow-lg border-primary/10 flex flex-col">
          <CardContent className="p-4 flex-1 min-h-0">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">
                Generated Flashcards
                {selectedFlashcards.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({selectedFlashcards.length} selected)
                  </span>
                )}
              </h3>
            </div>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="flex flex-col gap-3 pb-4">
                <AnimatePresence>
                  {flashcards.map((flashcard) => (
                    <motion.div
                      key={flashcard.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="border border-primary/10 rounded-lg p-3 bg-card shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-medium text-primary mb-1">
                            Question:
                          </h4>
                          <p className="text-sm leading-relaxed">
                            {flashcard.question}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-primary mb-1">
                            Answer:
                          </h4>
                          <p className="text-sm leading-relaxed">
                            {flashcard.answer}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-primary/10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDiscardFlashcard(flashcard.id)}
                          className="h-8 px-2 hover:bg-destructive/10 transition-colors duration-200"
                        >
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          <span className="text-xs">Discard</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleKeepFlashcard(flashcard)}
                          className="h-8 px-2 hover:bg-primary/10 transition-colors duration-200"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          <span className="text-xs">Keep</span>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
