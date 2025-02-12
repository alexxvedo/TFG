"use client";

import { useState } from "react";
import { Plus, Folder, MoreVertical, Pencil, Trash } from "lucide-react";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useCollectionStore } from "@/store/collections-store/collection-store";

export function CollectionsList({
  collections,
  onCollectionCreate,
  onCollectionUpdate,
  onCollectionDelete,
}) {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const { setActiveCollection } = useCollectionStore();
  const router = useRouter();
  const params = useParams();

  const handleCreateCollection = async () => {
    try {
      await onCollectionCreate({
        name: newCollectionName,
        description: newCollectionDescription,
      });
      setNewCollectionName("");
      setNewCollectionDescription("");
      setIsCreateDialogOpen(false);
      toast.success("Collection created successfully");
    } catch (error) {
      toast.error("Failed to create collection");
    }
  };

  const handleUpdateCollection = async () => {
    try {
      await onCollectionUpdate(editingCollection.id, {
        name: editingCollection.name,
        description: editingCollection.description,
      });
      setEditingCollection(null);
      toast.success("Collection updated successfully");
    } catch (error) {
      toast.error("Failed to update collection");
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    console.log(collectionId);
    try {
      await onCollectionDelete(params.workspaceId, collectionId);
      toast.success("Collection deleted successfully");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
          <p className="text-muted-foreground">
            Manage and organize your collections
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Create a new collection to organize your items
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <Input
                  id="description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Collection description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCollection}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Card key={collection.id} className="group">
            <CardHeader className="relative">
              <div className="flex items-center space-x-2">
                <Folder className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <CardTitle
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={() => {
                      setActiveCollection(collection);
                      router.push(
                        `/workspaces/${params.workspaceId}/collection/${collection.id}`
                      );
                    }}
                  >
                    {collection.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {collection.description}
                  </CardDescription>
                </div>
              </div>
              <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditingCollection(collection)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteCollection(collection.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {/* Aquí puedes añadir estadísticas o información adicional */}
                {collection.itemCount || 0} items
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!editingCollection}
        onOpenChange={() => setEditingCollection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>Update the collection details</DialogDescription>
          </DialogHeader>
          {editingCollection && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name">Name</label>
                <Input
                  id="edit-name"
                  value={editingCollection.name}
                  onChange={(e) =>
                    setEditingCollection({
                      ...editingCollection,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description">Description</label>
                <Input
                  id="edit-description"
                  value={editingCollection.description}
                  onChange={(e) =>
                    setEditingCollection({
                      ...editingCollection,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingCollection(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCollection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
