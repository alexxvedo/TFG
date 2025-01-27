"use client";

import { useEffect, useState, useCallback } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { Folder } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NavMain({ items, isCollapsed }) {
  const [collections, setCollections] = useState([]);
  const { activeWorkspace } = useSidebarStore();
  const { activeCollection, setActiveCollection } = useCollectionStore();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchCollections = async () => {
      if (!activeWorkspace?.id) return;
      
      try {
        const response = await fetch(
          `http://localhost:3001/workspaces/${activeWorkspace.id}/collections`
        );
        if (!response.ok) throw new Error("Error fetching collections");
        
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error("Error loading collections:", error);
      }
    };

    fetchCollections();
  }, [activeWorkspace?.id]);

  const isCollectionActive = (collectionId) => {
    return pathname.includes(`/collection/${collectionId}`);
  };

  const handleCollectionClick = useCallback(async (collection, e) => {
    e.preventDefault();
    // Establecer la colección activa antes de navegar
    setActiveCollection(collection);
    router.push(`/workspaces/${activeWorkspace?.id}/collection/${collection.id}`);
  }, [setActiveCollection, router, activeWorkspace?.id]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className={
                item.isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : ""
              }
            >
              <Link href={item.url}>
                {item.icon && <item.icon className="h-4 w-4" />}
                {!isCollapsed && <span className="ml-2">{item.title}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarGroupLabel>Collections</SidebarGroupLabel>
      <SidebarMenu>
        {collections.map((collection) => (
          <SidebarMenuItem key={collection.id}>
            <SidebarMenuButton
              asChild
              className={cn(
                isCollectionActive(collection.id) && "bg-purple-500/10 text-purple-500"
              )}
            >
              <a 
                href={`/workspaces/${activeWorkspace?.id}/collection/${collection.id}`}
                onClick={(e) => handleCollectionClick(collection, e)}
              >
                <Folder className={cn(
                  "h-4 w-4",
                  isCollectionActive(collection.id) && "text-purple-500"
                )} />
                {!isCollapsed && (
                  <span className="ml-2">{collection.name}</span>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
