"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, SquareTerminal } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const [workspaceName, setWorkspaceName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useUser();
  const api = useApi();

  const workspaces = useSidebarStore((state) => state.workspaces || []);
  const setWorkspaces = useSidebarStore((state) => state.setWorkspaces);
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );

  // Cargar workspaces al inicio
  useEffect(() => {
    let mounted = true;

    const loadWorkspaces = async () => {
      if (!user?.id) return;

      try {
        console.log("Loading workspaces for user:", user.id);
        const response = await api.workspaces.listByUser(user.id);

        // Solo actualizar si el componente sigue montado
        if (!mounted) return;

        console.log("Workspaces loaded:", response.data);

        // Asegurarnos de que workspacesList es un array
        const safeWorkspacesList = Array.isArray(response.data)
          ? response.data
          : [];

        // Solo actualizar workspaces si han cambiado
        if (mounted && JSON.stringify(safeWorkspacesList) !== JSON.stringify(workspaces)) {
          setWorkspaces(safeWorkspacesList);
          
          // Si no hay workspace activo o el workspace activo ya no existe en la lista
          if (safeWorkspacesList.length > 0 && 
              (!activeWorkspace || !safeWorkspacesList.some(w => w.id === activeWorkspace.id))) {
            updateActiveWorkspace(safeWorkspacesList[0]);
          }
        }
      } catch (error) {
        if (!mounted) return;
        console.error("Error loading workspaces:", error);
        toast.error("Error loading workspaces");
      }
    };

    loadWorkspaces();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [user?.id]); // Solo depender del ID del usuario

  const handleWorkspaceChange = useCallback(
    async (workspace) => {
      try {
        console.log("Changing workspace to:", workspace);
        // Primero actualizamos el estado para evitar que el router revierta el cambio
        updateActiveWorkspace(workspace);
        
        // Usamos push en lugar de replace para forzar una nueva entrada en el historial
        await router.push(`/workspaces/${workspace.id}/collections`);
      } catch (error) {
        console.error("Error changing workspace:", error);
        toast.error("Error changing workspace");
      }
    },
    [updateActiveWorkspace, router]
  );

  const handleCreateWorkspace = useCallback(
    async (e) => {
      e.preventDefault();
      if (!workspaceName.trim() || !user?.id) return;

      try {
        const newWorkspace = await api.workspaces.create(user.id, {
          name: workspaceName,
        });

        // Asegurarnos de que workspaces es un array antes de actualizarlo
        const currentWorkspaces = Array.isArray(workspaces) ? workspaces : [];
        const updatedWorkspaces = [...currentWorkspaces, newWorkspace];

        setWorkspaces(updatedWorkspaces);
        updateActiveWorkspace(newWorkspace);
        setWorkspaceName("");
        setIsDialogOpen(false);

        // Redirigir a la página de colecciones del nuevo workspace
        router.push(`/workspaces/${newWorkspace.id}/collections`);
        toast.success("Workspace created successfully");
      } catch (error) {
        console.error("Error creating workspace:", error);
        toast.error("Error creating workspace");
      }
    },
    [
      workspaceName,
      user?.id,
      router,
      updateActiveWorkspace,
      setWorkspaces,
      workspaces,
    ]
  );

  // Si no hay usuario autenticado, mostrar un estado de carga
  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <SquareTerminal className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isMobile}
            aria-label="Select a workspace"
            className="w-full justify-between"
          >
            <SquareTerminal className="mr-2 h-4 w-4" />
            {activeWorkspace?.name || "Select a workspace"}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Array.isArray(workspaces) ? workspaces : []).map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceChange(workspace)}
            >
              {workspace.name}
              {workspace.id === activeWorkspace?.id && (
                <DropdownMenuShortcut>✓</DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" /> Create Workspace
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Add a new workspace to organize your collections.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateWorkspace}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Input
                placeholder="Workspace name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
