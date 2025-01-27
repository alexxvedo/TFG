"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import Link from "next/link";

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

  useEffect(() => {
    const fetchCollections = async () => {
      if (!workspaceId) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:3001/workspaces/${workspaceId}/collections`
        );
        if (!response.ok) throw new Error("Failed to fetch collections");

        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-lg text-gray-500">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {activeWorkspace?.name}&apos;s Collections
        </h1>
        <p className="mt-2 text-gray-400">
          {collections.length} collection{collections.length !== 1 ? "s" : ""}
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-lg text-gray-500">No collections found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => {
                const url = `/workspaces/${workspaceId}/collection/${collection.id}`;
                console.log("Navigating to:", url);

                try {
                  // Primero establecemos la colección activa
                  setActiveCollection(collection);

                  // Luego navegamos
                  router.push(url);
                } catch (error) {
                  console.error("Error navigating:", error);
                }
              }}
              className="group relative overflow-hidden rounded-lg border border-[#2a2b35] bg-[#1a1b23] p-6 transition-all hover:border-[#3a3b45] hover:bg-[#2a2b35] cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-white">
                {collection.name}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                {collection.description || "No description"}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs text-gray-500">
                  {collection.items?.length || 0} items
                </span>
                <span className="text-xs text-gray-500">
                  Created {new Date(collection.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
