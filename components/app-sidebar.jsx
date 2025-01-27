"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  BookA,
  MessageCircleIcon,
  ChartPie,
  ListTodo,
  Settings,
  ChevronLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useUserStore } from "@/store/user-store/user-store";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const setUser = useUserStore((state) => state.setUser);
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const setWorkspaces = useSidebarStore((state) => state.setWorkspaces);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setUser(user);
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user, setUser]);

  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `http://localhost:3001/users/${user.id}/workspaces`
        );
        const workspaces = await response.json();
        setWorkspaces(workspaces);
      } catch (error) {
        console.error("Error loading workspaces:", error);
      }
    };

    if (isSignedIn && user) {
      loadWorkspaces();
    }
  }, [isSignedIn, user, setWorkspaces]);

  const navItems = useMemo(
    () => [
      {
        title: "Collections",
        url: `/workspaces/${activeWorkspace?.id}/collections`,
        icon: BookA,
        isActive: true,
      },
      {
        title: "Chat",
        url: `/workspaces/${activeWorkspace?.id}/chat`,
        icon: MessageCircleIcon,
      },
      {
        title: "Calendar",
        url: `/workspaces/${activeWorkspace?.id}/calendar`,
        icon: ListTodo,
      },
    ],
    [activeWorkspace]
  );

  if (!isLoaded || !isSignedIn) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <motion.div
          initial={hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2"
        >
          {isLoading ? (
            <Skeleton className="w-full h-10 p-4 rounded-md" />
          ) : (
            <WorkspaceSwitcher />
          )}
        </motion.div>
      </SidebarHeader>
      <SidebarContent>
        <motion.div
          initial={hasAnimated ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2"
        >
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-full h-8 p-4 rounded-md" />
              ))}
            </div>
          ) : (
            <NavMain items={navItems} isCollapsed={isCollapsed} />
          )}
        </motion.div>
      </SidebarContent>

      <SidebarFooter>
        <div className="mt-auto border-t border-[#1a1b23] pt-4">
          {isLoading ? (
            <Skeleton className="w-full h-12 p-4 rounded-md" />
          ) : (
            <NavUser user={user} isCollapsed={isCollapsed} />
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
