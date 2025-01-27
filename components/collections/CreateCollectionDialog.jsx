// CrearCollectionDialog.js
"use client";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CrearCollectionDialog({ onCreateCollection }) {
  const [collectionName, setCollectionName] = useState("");

  const handleCreate = () => {
    if (collectionName.trim()) {
      onCreateCollection(collectionName.trim());
      setCollectionName(""); // Reinicia el campo de entrada después de crear la colección
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Crear Nueva Colección</DialogTitle>
        <DialogDescription>Introduce el nombre de la nueva colección.</DialogDescription>
        <Input
          placeholder="Nombre de la colección"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
        />
        <div className="flex justify-end gap-4 mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleCreate}>Crear</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
