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
import { useApi } from "@/lib/api";

export function NavMain({ items, isCollapsed }) {
  const [collections, setCollections] = useState([]);
  const { activeWorkspace } = useSidebarStore();
  const { activeCollection, setActiveCollection } = useCollectionStore();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const api = useApi();

  useEffect(() => {
    const fetchCollections = async () => {
      if (!activeWorkspace?.id) return;

      try {
        const response = await api.collections.listByWorkspace(
          activeWorkspace.id
        );
        setCollections(response.data || []);
      } catch (error) {
        console.error("Error loading collections:", error);
      }
    };

    fetchCollections();
  }, [activeWorkspace?.id]);

  const isCollectionActive = (collectionId) => {
    return pathname.includes(`/collection/${collectionId}`);
  };

  const handleCollectionClick = useCallback(
    async (collection, e) => {
      e.preventDefault();
      setActiveCollection(collection);
      router.push(
        `/workspaces/${activeWorkspace.id}/collection/${collection.id}`
      );
    },
    [router, setActiveCollection]
  );

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
                isCollectionActive(collection.id) &&
                  "bg-purple-500/10 text-purple-500"
              )}
            >
              <a
                href={`/workspaces/${activeWorkspace.id}/collection/${collection.id}`}
                onClick={(e) => handleCollectionClick(collection, e)}
              >
                <Folder
                  className={cn(
                    "h-4 w-4",
                    isCollectionActive(collection.id) && "text-purple-500"
                  )}
                />
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
