import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
              className="h-[300px]"
            >
              <Card className="h-full">
                <CardContent className="p-4 h-full flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Pregunta:</h3>
                    <p className="text-sm text-muted-foreground">
                      {flashcard.question}
                    </p>
                  </div>
                  <div className="flex-1 min-h-0">
                    <h3 className="font-medium mb-2">Respuesta:</h3>
                    <p className="text-sm text-muted-foreground line-clamp-4 overflow-hidden">
                      {flashcard.answer}
                    </p>
                  </div>
                  <div className="flex  justify-between">
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
                    <div className="mt-4 flex items-center gap-2">
                      <Image
                        src={flashcard.createdBy?.profileImageUrl || ""}
                        alt={flashcard.createdBy?.firstName || ""}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">
                        {flashcard.createdBy?.firstName || ""}
                      </span>
                    </div>
                  </div>
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
