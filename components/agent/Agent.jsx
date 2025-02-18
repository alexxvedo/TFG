import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  X,
  Maximize2,
  MessageSquare,
  ArrowLeft,
  Send,
  ChevronUp,
  ChevronDown,
  Search,
  Eye,
  BookOpen,
  FileText,
  HelpCircle,
  Minimize2,
  Save,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUser } from "@clerk/nextjs";
import { useCollectionStore } from "@/store/collections-store/collection-store";

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && value.data) return value.data;
  return value ? [value] : [];
};

const Agent = ({ 
  resources = [], 
  collectionId, 
  onNoteCreated,
  onFlashcardCreated  // New prop for updating flashcards
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [numFlashcards, setNumFlashcards] = useState(5);
  const [loading, setLoading] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [expandedPage, setExpandedPage] = useState(null);
  const [response, setResponse] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteToSave, setNoteToSave] = useState(null);
  const [customNoteTitle, setCustomNoteTitle] = useState("");
  const { activeCollection, addFlashcard } = useCollectionStore();

  const { user } = useUser();

  const api = useApi();

  useEffect(() => {
    if (selectedDocument && selectedAction === "flashcards") {
      setLoading(true);
      api.agent
        .getPdfPages(collectionId, selectedDocument)
        .then((response) => {
          setPdfPages(response.pages);
          setSelectedPages([]); // Resetear páginas seleccionadas
          setExpandedPage(null); // Resetear página expandida
        })
        .catch((error) => {
          toast.error("Error al cargar las páginas del PDF");
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedDocument, selectedAction]);

  const handlePageSelect = (pageNumber) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNumber)) {
        return prev.filter((p) => p !== pageNumber);
      }
      if (prev.length >= 10) {
        toast.error("Máximo 10 páginas permitidas");
        return prev;
      }
      return [...prev, pageNumber].sort((a, b) => a - b);
    });
  };

  const actions = [
    {
      name: "Crear Flashcards",
      icon: <BookOpen className="w-4 h-4" />,
      description: "Genera flashcards automáticamente a partir del contenido",
    },
    {
      name: "Resumen Breve",
      icon: <FileText className="w-4 h-4" />,
      description: "Obtén un resumen conciso del contenido",
    },
    {
      name: "Resumen Detallado",
      icon: <MessageSquare className="w-4 h-4" />,
      description: "Genera un resumen detallado del contenido",
    },
    {
      name: "Preguntar Dudas",
      icon: <HelpCircle className="w-4 h-4" />,
      description: "Resuelve tus dudas sobre el contenido",
    },
  ];

  const handleGenerateFlashcards = async () => {
    console.log("Selected Document:", selectedDocument);
    console.log("Available Resources:", resources);

    if (!selectedDocument) {
      toast.error("Por favor, selecciona un documento");
      return;
    }

    try {
      setIsLoading(true);
      const flashcards = await api.agent.generateFlashcards(
        collectionId,
        selectedDocument,
        numFlashcards
      );

      // Aquí puedes manejar las flashcards generadas como necesites
      toast.success(`${numFlashcards} flashcards generadas correctamente`);
      setSelectedAction(null); // Volver al menú principal
    } catch (error) {
      console.error("Error generando flashcards:", error);
      toast.error("Error al generar las flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    setChatMessages([
      ...chatMessages,
      { text: currentMessage, sender: "user" },
    ]);
    setCurrentMessage("");

    // Simular respuesta del bot (aquí irá la integración con la API)
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          text: "Esta es una respuesta de prueba del asistente.",
          sender: "bot",
        },
      ]);
    }, 1000);
  };

  const openNoteTitleDialog = (content, defaultTitle) => {
    setNoteToSave(content);
    setCustomNoteTitle(defaultTitle);
    setIsSavingNote(true);
  };

  const handleConfirmNoteTitle = async () => {
    if (!customNoteTitle.trim()) {
      toast.error("Por favor, introduce un título para la nota");
      return;
    }

    try {
      const newNote = await api.notes.createNote(
        collectionId,
        user.id,
        customNoteTitle,
        noteToSave
      );

      toast.success("Nota guardada correctamente");

      if (onNoteCreated) {
        onNoteCreated((prevNotes) => [...prevNotes, newNote]);
      }
    } catch (error) {
      console.error("Error al guardar la nota:", error);
      toast.error("No se pudo guardar la nota. Por favor, inténtalo de nuevo");
    } finally {
      setIsSavingNote(false);
      setNoteToSave(null);
      setCustomNoteTitle("");
    }
  };

  const handleSaveAsNote = async (title, content) => {
    openNoteTitleDialog(content, title);
  };

  const handleKeepFlashcard = useCallback(
    async (flashcard) => {
      try {
        if (!activeCollection?.id) {
          toast.error("No hay una colección activa");
          return;
        }

        const newFlashcard = {
          question: flashcard.question,
          answer: flashcard.answer,
          status: "SIN_HACER",
          difficulty: flashcard.difficulty || 2,
          topic: flashcard.topic || "General",
          collectionId: activeCollection.id,
        };

        const { data: createdFlashcard } = await api.flashcards.create(
          activeCollection.id,
          newFlashcard,
          user.id
        );

        // Use onFlashcardCreated if provided, similar to onNoteCreated
        if (onFlashcardCreated) {
          onFlashcardCreated((prevFlashcards) => [...prevFlashcards, createdFlashcard]);
        }

        // Update the collection store as a fallback
        addFlashcard(createdFlashcard);

        // Filter out the saved flashcard from the current response
        setResponse((prev) => 
          ensureArray(prev).filter((card) => card.question !== flashcard.question)
        );

        toast.success("Flashcard guardada exitosamente");
      } catch (error) {
        console.error("Error guardando flashcard:", error);
        toast.error("No se pudo guardar la flashcard");
      }
    },
    [activeCollection, user, api, addFlashcard, onFlashcardCreated]
  );

  const handleDiscardFlashcard = (question) => {
    // Remove the discarded flashcard from the response
    setResponse((prevResponse) =>
      prevResponse.filter((card) => card.question !== question)
    );
  };

  const handleSaveAllFlashcards = useCallback(async () => {
    try {
      if (!activeCollection?.id) {
        toast.error("No hay una colección activa");
        return;
      }

      const flashcardsToSave = ensureArray(response);

      const savedFlashcards = await Promise.all(
        flashcardsToSave.map(async (flashcard) => {
          const newFlashcard = {
            question: flashcard.question,
            answer: flashcard.answer,
            status: "SIN_HACER",
            difficulty: flashcard.difficulty || 2,
            topic: flashcard.topic || "General",
            collectionId: activeCollection.id,
          };

          const { data: createdFlashcard } = await api.flashcards.create(
            activeCollection.id,
            newFlashcard,
            user.id
          );

          // Use onFlashcardCreated if provided
          if (onFlashcardCreated) {
            onFlashcardCreated((prevFlashcards) => [...prevFlashcards, createdFlashcard]);
          }

          // Update the collection store as a fallback
          addFlashcard(createdFlashcard);

          return createdFlashcard;
        })
      );

      // Clear the response after saving all flashcards
      setResponse([]);

      toast.success(`${savedFlashcards.length} flashcards guardadas`);
    } catch (error) {
      console.error("Error guardando flashcards:", error);
      toast.error("No se pudieron guardar todas las flashcards");
    }
  }, [activeCollection, user, api, response, addFlashcard, onFlashcardCreated]);

  const renderActionContent = () => {
    switch (selectedAction?.name) {
      case "Crear Flashcards":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Documento</Label>
              <Select
                value={selectedDocument}
                onValueChange={(value) => {
                  setSelectedDocument(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un documento" />
                </SelectTrigger>
                <SelectContent>
                  {resources
                    .filter((resource) => resource && resource.id)
                    .map((resource) => (
                      <SelectItem
                        key={resource.id}
                        value={resource.id.toString()}
                      >
                        {resource.fileName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDocument &&
              selectedAction === "flashcards" &&
              pdfPages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Páginas del documento (selecciona hasta 10)</Label>
                    <span className="text-sm text-muted-foreground">
                      {selectedPages.length} de 10 páginas seleccionadas
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto p-4">
                    {pdfPages.map((page) => (
                      <Card
                        key={page.number}
                        className={`group relative transition-all ${
                          selectedPages.includes(page.number)
                            ? "ring-2 ring-primary ring-offset-2"
                            : "hover:ring-1 hover:ring-primary/50"
                        }`}
                      >
                        <CardContent className="p-0">
                          {/* Contenedor de la imagen con proporción fija */}
                          <div className="relative aspect-[1/1.4] bg-secondary/20">
                            <img
                              src={`data:image/png;base64,${page.image}`}
                              alt={`Página ${page.number}`}
                              className="absolute inset-0 w-full h-full object-contain"
                            />

                            {/* Overlay con controles */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                <Checkbox
                                  checked={selectedPages.includes(page.number)}
                                  onCheckedChange={() =>
                                    handlePageSelect(page.number)
                                  }
                                  className="bg-white/90 data-[state=checked]:bg-primary"
                                />
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 bg-white/90 hover:bg-white"
                                  onClick={() => setExpandedPage(page.number)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Número de página */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <div className="text-white text-center font-medium">
                                Página {page.number}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            {/* Modal para ver página expandida */}
            {expandedPage && (
              <Dialog
                open={expandedPage !== null}
                onOpenChange={() => setExpandedPage(null)}
              >
                <DialogContent className="max-w-5xl h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      <span>Página {expandedPage}</span>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedPages.includes(expandedPage)}
                          onCheckedChange={() => handlePageSelect(expandedPage)}
                          id="select-page"
                        />
                        <Label
                          htmlFor="select-page"
                          className="text-sm font-normal"
                        >
                          Seleccionar página
                        </Label>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden pt-4">
                    {/* Imagen de la página */}
                    <div className="flex-1 min-h-0 bg-secondary/20 rounded-lg overflow-hidden">
                      <img
                        src={`data:image/png;base64,${
                          pdfPages[expandedPage - 1]?.image
                        }`}
                        alt={`Página ${expandedPage}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Texto de la página */}
                    <div className="flex-1 min-h-0 lg:max-w-sm">
                      <div className="text-sm text-muted-foreground mb-2">
                        Contenido extraído:
                      </div>
                      <ScrollArea className="h-full w-full rounded-lg border bg-muted/50 p-4">
                        <div className="whitespace-pre-wrap font-mono text-sm">
                          {pdfPages[expandedPage - 1]?.content}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <div className="space-y-2">
              <Label>Número de flashcards</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={numFlashcards}
                onChange={(e) => {
                  const value = Math.min(
                    20,
                    Math.max(1, Number(e.target.value))
                  );
                  setNumFlashcards(value);
                }}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                Genera entre 1 y 20 flashcards
              </div>
            </div>
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  const axiosResponse =
                    await api.agent.generateFlashcardsFromDocument(
                      collectionId,
                      selectedDocument,
                      numFlashcards
                    );

                  console.log("Full Axios response:", axiosResponse);

                  // Extract flashcards from the data property
                  const flashcards = axiosResponse.data;

                  console.log("Extracted flashcards:", flashcards);

                  // Check if response contains an error
                  if (flashcards[0] && flashcards[0].error) {
                    toast.error(flashcards[0].error);
                  } else {
                    setResponse(flashcards);
                  }
                } catch (error) {
                  console.error(error);
                  toast.error(
                    "Error al procesar la solicitud. Por favor, inténtalo de nuevo."
                  );
                }
                setLoading(false);
              }}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando...
                </div>
              ) : (
                "Generar Flashcards"
              )}
            </Button>
            {response && response.length > 0 && (
              <ScrollArea className="h-[calc(100%-2rem)] mt-4">
                <div className="flex flex-col gap-3 pb-4">
                  <AnimatePresence>
                    {ensureArray(response).map((flashcard, index) => (
                      <motion.div
                        key={`generated-${index}`}
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
                          <div className="text-xs text-muted-foreground">
                            Dificultad: {flashcard.difficulty || 'N/A'}/5 | Tema:{" "}
                            {flashcard.topic || 'General'}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-primary/10">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDiscardFlashcard(flashcard.question)
                            }
                            className="h-8 px-2 hover:bg-destructive/10 transition-colors duration-200"
                          >
                            <ThumbsDown className="w-3 h-3 mr-1" />
                            <span className="text-xs">Descartar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleKeepFlashcard(flashcard)}
                            className="h-8 px-2 hover:bg-primary/10 transition-colors duration-200"
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            <span className="text-xs">Guardar</span>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </div>
        );

      case "Resumen Breve":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Documento</Label>
              <Select
                value={selectedDocument}
                onValueChange={(value) => {
                  setSelectedDocument(value);
                  setResponse(""); // Clear previous response
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un documento" />
                </SelectTrigger>
                <SelectContent>
                  {resources
                    .filter((resource) => resource && resource.id)
                    .map((resource) => (
                      <SelectItem
                        key={resource.id}
                        value={resource.id.toString()}
                      >
                        {resource.fileName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  const response =
                    await api.agent.generateBriefSummaryFromDocument(
                      collectionId,
                      selectedDocument
                    );
                  console.log("Resumen generado:", response);
                  if (response && response.summary) {
                    setResponse(response.summary);
                  } else {
                    toast.error("No se pudo generar el resumen");
                  }
                } catch (error) {
                  console.error(error);
                  toast.error(
                    "Error al procesar la solicitud. Por favor, inténtalo de nuevo."
                  );
                }
                setLoading(false);
              }}
              disabled={loading || !selectedDocument}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando...
                </div>
              ) : (
                "Generar Resumen"
              )}
            </Button>
            {response && (
              <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    Resumen Breve
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleSaveAsNote(
                        `Resumen Breve - ${selectedDocument}`,
                        response
                      )
                    }
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Guardar como nota
                  </Button>
                </div>
                <div className="p-4 prose prose-sm dark:prose-invert prose-zinc max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {response}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );

      case "Resumen Detallado":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Documento</Label>
              <Select
                value={selectedDocument}
                onValueChange={(value) => {
                  setSelectedDocument(value);
                  setResponse(""); // Clear previous response
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un documento" />
                </SelectTrigger>
                <SelectContent>
                  {resources
                    .filter((resource) => resource && resource.id)
                    .map((resource) => (
                      <SelectItem
                        key={resource.id}
                        value={resource.id.toString()}
                      >
                        {resource.fileName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  const response =
                    await api.agent.generateLongSummaryFromDocument(
                      collectionId,
                      selectedDocument
                    );
                  console.log("Resumen detallado generado:", response);
                  if (response && response.summary) {
                    setResponse(response.summary);
                  } else {
                    toast.error("No se pudo generar el resumen detallado");
                  }
                } catch (error) {
                  console.error(error);
                  toast.error(
                    "Error al procesar la solicitud. Por favor, inténtalo de nuevo."
                  );
                }
                setLoading(false);
              }}
              disabled={loading || !selectedDocument}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando...
                </div>
              ) : (
                "Generar Resumen Detallado"
              )}
            </Button>
            {response && (
              <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    Resumen Detallado
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleSaveAsNote(
                        `Resumen Detallado - ${selectedDocument}`,
                        response
                      )
                    }
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Guardar como nota
                  </Button>
                </div>
                <div className="p-4 prose prose-sm dark:prose-invert prose-zinc max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {response}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );

      case "Preguntar Dudas":
        return (
          <div className="space-y-4">
            <div className="h-[300px] overflow-y-auto p-4 space-y-4 border rounded-lg">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-indigo-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Escribe tu pregunta..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed inset-y-0 right-0 w-[420px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Asistente IA
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-6">
                {!selectedAction ? (
                  <div className="py-6 space-y-2">
                    {actions.map((action) => (
                      <motion.button
                        key={action.name}
                        onClick={() => setSelectedAction(action)}
                        className="w-full p-4 flex items-center gap-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                          {action.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {action.name}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            {action.description}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="py-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAction(null);
                          setResponse("");
                        }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {selectedAction.name}
                      </span>
                    </div>
                    {renderActionContent()}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </motion.button>

      {/* Diálogo para título de nota */}
      <Dialog
        open={isSavingNote}
        onOpenChange={(open) => {
          if (!open) {
            setIsSavingNote(false);
            setNoteToSave(null);
            setCustomNoteTitle("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar Nota</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Título de la Nota</Label>
            <Input
              value={customNoteTitle}
              onChange={(e) => setCustomNoteTitle(e.target.value)}
              placeholder="Introduce un título para la nota"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSavingNote(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmNoteTitle}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Agent;
