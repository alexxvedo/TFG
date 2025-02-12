"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  Send,
  ThumbsUp,
  ThumbsDown,
  X,
  Sparkles,
  Bot,
  User,
  BookOpen,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/api";

export default function FlashcardChatbot() {
  const api = useApi();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const chatEndRef = useRef(null);
  const [contextPrompt, setContextPrompt] = useState("");
  const [generatedFlashcardsHistory, setGeneratedFlashcardsHistory] = useState(
    []
  );
  const [activeCollection, setActiveCollection] = useState(null);

  // Electron window maximization
  const handleToggleMaximize = () => {
    if (window.electronAPI && window.electronAPI.toggleMaximize) {
      window.electronAPI.toggleMaximize();
      setIsMaximized(!isMaximized);
    }
  };

  useEffect(() => {
    if (window.electronAPI) {
      console.log("Configurando listener de sync-state en FlashcardChatbot");
      window.electronAPI.onSyncState((collection) => {
        console.log(
          "Recibiendo activeCollection en FlashcardChatbot:",
          collection
        );
        setActiveCollection(collection);
      });
    }
  }, []);

  useEffect(() => {
    if (!activeCollection) {
      return;
    }
    // Aquí va cualquier lógica que dependa de activeCollection
  }, [activeCollection]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!activeCollection?.id) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          text: "Por favor, espera a que se cargue la colección antes de generar flashcards.",
          sender: "bot",
        },
      ]);
      return;
    }

    const currentPrompt = input.trim();

    if (currentPrompt) {
      if (!contextPrompt) {
        setContextPrompt(currentPrompt); // Guardar el contexto inicial
      }

      const newMessage = {
        id: Date.now(),
        text: currentPrompt,
        sender: "user",
      };
      setMessages([...messages, newMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const { data: result } = await api.collections.generateAIFlashcards(
          activeCollection.id,
          {
            userPrompt: currentPrompt,
            contextPrompt,
            generatedFlashcardsHistory,
          }
        );

        console.log("Respuesta del servidor:", result);

        const generatedFlashcards = result.flashcards.map((flashcard) => ({
          id: Date.now() + Math.random(), // Mejor generación de ID único
          question: flashcard.question,
          answer: flashcard.answer,
          difficulty: flashcard.difficulty || "MEDIUM",
          topic: flashcard.topic || activeCollection.name,
        }));

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: `He generado ${generatedFlashcards.length} flashcards. ${
              result.metadata?.validCount || 0
            } son válidas.`,
            sender: "bot",
          },
        ]);

        // Actualiza el historial y las flashcards en pantalla
        setGeneratedFlashcardsHistory((prevHistory) => [
          ...prevHistory,
          ...generatedFlashcards,
        ]);
        setFlashcards((prevFlashcards) => [
          ...prevFlashcards,
          ...generatedFlashcards,
        ]);
        setShowFlashcards(true);
      } catch (error) {
        console.error("Error al obtener flashcards:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: "Hubo un error generando las flashcards. Inténtalo de nuevo.",
            sender: "bot",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeepFlashcard = async (flashcard) => {
    if (!activeCollection?.id) {
      console.warn("No hay una colección activa");
      return;
    }

    try {
      const { data: newFlashcard } = await api.flashcards.create(
        activeCollection.id,
        {
          question: flashcard.question,
          answer: flashcard.answer,
          difficulty: flashcard.difficulty,
          topic: flashcard.topic,
        }
      );

      // Elimina la flashcard de la lista de sugerencias flashcards
      setFlashcards((prevFlashcards) =>
        prevFlashcards.filter((card) => card.id !== flashcard.id)
      );

      // Solo notificamos al proceso principal y dejamos que el store maneje la actualización
      if (window.electronAPI) {
        window.electronAPI.notifyFlashcardAdded(newFlashcard);
      }
    } catch (error) {
      console.error("Error guardando flashcard:", error.message);
    }
  };

  const handleDiscardFlashcard = (id) => {
    setFlashcards((prevFlashcards) =>
      prevFlashcards.filter((card) => card.id !== id)
    );
  };

  const renderMessage = (message) => {
    const isUser = message.sender === "user";
    return (
      <motion.div
        initial={{ opacity: 0, x: isUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        key={message.id}
        className={`flex items-start mb-4 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        <div className="flex items-start space-x-2">
          {!isUser && (
            <div className="bg-muted p-2 rounded-full">
              <Bot className="h-5 w-5 text-blue-400" />
            </div>
          )}
          <div
            className={`
              max-w-md p-3 rounded-xl 
              ${isUser ? "bg-blue-600 text-white" : "bg-card text-foreground"}
            `}
          >
            {message.text}
          </div>
          {isUser && (
            <div className="bg-muted p-2 rounded-full">
              <User className="h-5 w-5 text-green-400" />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderFlashcardActions = (flashcard) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex justify-end mt-3 space-x-2"
    >
      <Button
        variant="outline"
        size="sm"
        className="border-green-500 text-green-500 hover:bg-green-500/10"
        onClick={() => handleKeepFlashcard(flashcard)}
      >
        <ThumbsUp className="h-4 w-4 mr-2" /> Keep
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-red-500 text-red-500 hover:bg-red-500/10"
        onClick={() => handleDiscardFlashcard(flashcard.id)}
      >
        <ThumbsDown className="h-4 w-4 mr-2" /> Discard
      </Button>
    </motion.div>
  );

  return (
    <div className="flex h-screen min-w-full bg-background text-foreground overflow-hidden">
      <div className="flex-1 flex flex-col p-4 pr-0 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-bold">AI Flashcard Generator</h1>
          </div>
          {window.electronAPI && window.electronAPI.toggleMaximize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMaximize}
              className="text-zinc-400 hover:text-white"
            >
              {isMaximized ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 pr-2">
            <AnimatePresence>
              {messages.map(renderMessage)}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center"
                >
                  <div className="animate-pulse rounded-full h-12 w-12 bg-blue-500/50"></div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </AnimatePresence>
          </div>
        </ScrollArea>
        <div className="flex space-x-2 mt-4 pr-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="What topic would you like to create flashcards about?"
            className="flex-1 bg-card border-border text-foreground"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showFlashcards && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween" }}
            className="w-full md:w-1/3 bg-card p-4 border-l border-border overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-bold">Generated Flashcards</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFlashcards(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-120px)]">
              <AnimatePresence>
                {flashcards.map((flashcard) => (
                  <motion.div
                    key={flashcard.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="mb-4 bg-card border-border">
                      <CardContent className="p-4">
                        <p className="font-semibold mb-2 text-foreground">
                          {flashcard.question}
                        </p>
                        <p className="text-muted mb-3">{flashcard.answer}</p>
                        {renderFlashcardActions(flashcard)}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {!showFlashcards && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          className="absolute right-0 top-1/2 transform -rotate-90 translate-x-1/2"
        >
          <Button
            variant="outline"
            onClick={() => setShowFlashcards(true)}
            className="bg-card border-border text-foreground hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4 mr-2" /> Flashcards
          </Button>
        </motion.div>
      )}
    </div>
  );
}
