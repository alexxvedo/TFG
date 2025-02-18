import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

export default function NotesList({ notes, onNoteDeleted }) {
  const api = useApi();
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const handleDeleteNote = async (noteId, collectionId) => {
    try {
      setDeletingNoteId(noteId);
      await api.notes.deleteNote(collectionId, noteId);
      onNoteDeleted(noteId);
      toast.success("Nota eliminada", {
        description: "La nota ha sido eliminada correctamente.",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar la nota. Inténtalo de nuevo.",
      });
    } finally {
      setDeletingNoteId(null);
    }
  };

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        <p>No hay notas en esta colección.</p>
        <p className="mt-2">
          Usa el Asistente IA para crear notas a partir de los resúmenes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-[400px]"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
              {note.noteName}
            </h3>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDeleteNote(note.id, note.collectionId)}
                disabled={deletingNoteId === note.id}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          <div className="prose prose-sm dark:prose-invert prose-zinc max-w-none flex-grow overflow-hidden">
            <div className="line-clamp-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content}
              </ReactMarkdown>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Creada el {new Date(note.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2">
              {note.createdBy?.profileImageUrl && (
                <Image
                  src={note.createdBy.profileImageUrl}
                  alt={note.createdBy.firstName || "Usuario"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{note.createdBy?.firstName || "Usuario"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
