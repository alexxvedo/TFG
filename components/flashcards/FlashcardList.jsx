import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

const FlashcardList = memo(({ flashcards }) => {
  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <AnimatePresence>
          {flashcards.map((flashcard) => (
            <motion.div
              key={flashcard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              layout
            >
              <Card className="mt-auto">
                <CardContent className="p-4">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Pregunta:</h3>
                    <p className="text-sm text-muted-foreground">
                      {flashcard.question}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Respuesta:</h3>
                    <p className="text-sm text-muted-foreground">
                      {flashcard.answer}
                    </p>
                  </div>
                  {flashcard.status && (
                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          flashcard.status === "done"
                            ? "bg-green-100 text-green-800"
                            : flashcard.status === "review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {flashcard.status === "done"
                          ? "Completada"
                          : flashcard.status === "review"
                          ? "Para repasar"
                          : "Sin hacer"}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
});

FlashcardList.displayName = "FlashcardList";

export default FlashcardList;
