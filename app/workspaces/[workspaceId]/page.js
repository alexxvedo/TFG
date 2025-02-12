"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import CollectionCover from "@/components/flashcards/CollectionCover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { isToday } from "date-fns";
import InvitationManager from "@/components/workspace/InvitationManager";
import PendingInvitations from "@/components/workspace/PendingInvitations";
import { InviteUserDialog } from "@/components/workspace/invite-user-dialog";
import { WorkspaceUsersList } from "@/components/workspace/workspace-users-list";
import { UserPlus } from "lucide-react";

export default function WorkspacePage({ params }) {
  const { workspaceId } = params;
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const router = useRouter();
  const api = useApi();

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await api.collections.listByWorkspace(workspaceId);
        setCollections(response.data || []);
      } catch (error) {
        console.error("Error loading collections:", error);
        toast.error("Error loading collections");
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadCollections();
    }
  }, [workspaceId]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const response = await api.collections.create({
        name: newCollectionName,
        workspaceId: workspaceId,
      });

      setCollections([...collections, response.data]);
      setNewCollectionName("");
      toast.success("Collection created successfully");
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Error creating collection");
    }
  };

  const handleInviteSuccess = () => {
    // Actualizar la lista de usuarios
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
          <p className="text-muted-foreground">
            {collections?.length || 0} collections in total
          </p>
        </div>
        <div className="flex items-center gap-4">
          <InvitationManager workspace={activeWorkspace} />
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Collection</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <Button onClick={handleCreateCollection} className="w-full">
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar Usuario
          </Button>
        </div>
      </div>

      <PendingInvitations />

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Usuarios del Workspace</h2>
          <WorkspaceUsersList 
            workspaceId={workspaceId} 
            onUserRemoved={handleInviteSuccess} 
          />
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {collections.map((collection) => (
              <CollectionCover key={collection.id} collection={collection} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Name
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Cards
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Due Today
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((collection) => (
                      <tr
                        key={collection.id}
                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/workspaces/${workspaceId}/collection/${collection.id}`
                          )
                        }
                      >
                        <td className="p-4 align-middle">{collection.name}</td>
                        <td className="p-4 align-middle">
                          {collection.flashcards?.length || 0}
                        </td>
                        <td className="p-4 align-middle">
                          {collection.flashcards?.filter(
                            (card) =>
                              card.nextReviewDate &&
                              isToday(new Date(card.nextReviewDate))
                          ).length || 0}
                        </td>
                        <td className="p-4 align-middle">
                          {new Date(collection.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        workspaceId={workspaceId}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
}
