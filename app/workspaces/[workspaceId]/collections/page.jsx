"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { CollectionsList } from "@/components/collections/collections-list";

export default function CollectionsPage() {
  const params = useParams();
  const router = useRouter();
  const { workspaceId } = params;
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const setActiveCollection = useCollectionStore(
    (state) => state.setActiveCollection
  );
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  // Redirigir si el workspace de la URL no coincide con el activo
  useEffect(() => {
    if (activeWorkspace && workspaceId !== activeWorkspace.id) {
      router.push(`/workspaces/${activeWorkspace.id}/collections`);
    }
  }, [activeWorkspace, workspaceId, router]);

  const fetchCollections = useCallback(async () => {
    if (!workspaceId) return;

    try {
      setIsLoading(true);
      const response = await api.collections.listByWorkspace(workspaceId);
      setCollections(response.data);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Error loading collections");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreateCollection = async (collectionData) => {
    if (!workspaceId) {
      console.error("No workspace ID available");
      toast.error("Error: No workspace selected");
      return;
    }

    try {
      await api.collections.create(workspaceId, collectionData);
      await fetchCollections();
      toast.success("Collection created successfully");
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection");
      throw error;
    }
  };

  const handleUpdateCollection = async (collectionId, collectionData) => {
    if (!workspaceId) {
      console.error("No workspace ID available");
      toast.error("Error: No workspace selected");
      return;
    }

    try {
      await api.collections.update(workspaceId, collectionId, collectionData);
      await fetchCollections();
      toast.success("Collection updated successfully");
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Failed to update collection");
      throw error;
    }
  };

  const handleDeleteCollection = async (workspaceId, collectionId) => {
    if (!workspaceId || !collectionId) {
      console.error("No workspace ID available");
      toast.error("Error: No workspace selected");
      return;
    }

    try {
      await api.collections.delete(workspaceId, collectionId);
      await fetchCollections();
      toast.success("Collection deleted successfully");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
      throw error;
    }
  };

  if (!workspaceId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-lg text-gray-500">No workspace selected</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-lg text-gray-500">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CollectionsList
        collections={collections}
        onCollectionCreate={handleCreateCollection}
        onCollectionUpdate={handleUpdateCollection}
        onCollectionDelete={handleDeleteCollection}
      />
    </div>
  );
}
