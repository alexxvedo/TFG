"use client";

import { Button } from "@/components/ui/button";

import { Switch } from "@/components/ui/switch";

import { motion, AnimatePresence } from "framer-motion";

import Link from "next/link";

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

import { Label } from "../ui/label";
import { TwitterPicker } from "react-color";

import { UserButton, useUser } from "@clerk/nextjs";

import {
  ChevronDown,
  ChevronRight,
  Settings,
  Sun,
  Moon,
  Plus,
  PanelLeftClose,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useThemeStore } from "@/store/theme-store/theme-store";

import { useTheme } from "next-themes";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );
  const workspaces = useSidebarStore((state) => state.workspaces);
  const setWorkspaces = useSidebarStore((state) => state.setWorkspaces);
  const addWorkspace = useSidebarStore((state) => state.addWorkspace);
  const [workspaceName, setWorkspaceName] = useState("");

  const { theme, setTheme } = useTheme();

  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const setIsDarkMode = useThemeStore((state) => state.setIsDarkMode);

  const [localWorkspacesOpen, setLocalWorkspacesOpen] = useState(true);
  const [teamWorspacesOpen, setTeamWorkspacesOpen] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false); // Controla si el usuario ya interactuó
  const [hasInteractedWithSidebar, setHasInteractedWithSidebar] =
    useState(false);

  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const openSidebar = useSidebarStore((state) => state.openSidebar);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);

  const [isMobile, setIsMobile] = useState(false);

  const { isLoaded, isSignedIn, user } = useUser();

  console.log("User", user);

  useEffect(() => {
    // Función para obtener los workspaces del usuario
    const fetchWorkspaces = async () => {
      if (!user) return;

      console.log("UserID: ", user.id);

      try {
        const response = await fetch(
          `http://localhost:3001/users/${user.id}/workspaces`
        );
        console.log("Fetching workspaces...");
        const data = await response.json();
        console.log(data);
        setWorkspaces(data); // Guardar los workspaces en el estado
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchWorkspaces(); // Llamamos a la función para obtener los workspaces
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleMediaChange = (e) => {
      if (e.matches) {
        if (!isMobile) {
          setIsMobile(true);
          closeSidebar();
        }
      } else {
        if (isMobile) {
          setIsMobile(false);
          openSidebar();
        }
      }
    };

    // Añadir listener de media query
    mediaQuery.addEventListener("change", handleMediaChange);

    // Ejecutar el handler al cargar el componente para verificar el estado inicial
    handleMediaChange(mediaQuery);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [isMobile, closeSidebar, openSidebar]);

  const handleSidebarClose = () => {
    setHasInteractedWithSidebar(true);
    closeSidebar();
  };

  const handleThemeChange = () => {
    setTheme(isDarkMode ? "light" : "dark");
    setIsDarkMode(!isDarkMode);
  };

  const handleSubmit = async () => {
    if (workspaceName.trim()) {
      const newWorkspace = {
        name: workspaceName.trim(),
        userId: user.id, // Asegúrate de pasar el ID del usuario
      };
      console.log("user id:", user.id, "workspace name:", workspaceName);

      try {
        // Hacemos una solicitud POST a la API para crear el workspace
        const response = await fetch("http://localhost:3001/workspaces", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newWorkspace), // Convertimos el objeto a JSON
        });

        if (!response.ok) {
          throw new Error("Error creando el workspace");
        }

        const createdWorkspace = await response.json();

        console.log("Created workspace:", createdWorkspace);

        // Opcional: Notificación de éxito
        new Notification("New Workspace", {
          body: "Workspace creado exitosamente.",
          renotify: true,
          tag: "workspace-creation",
        }).onclick = () => console.log("Notification Clicked");

        // Limpia el campo de texto
        setWorkspaceName("");

        // Actualiza la lista de workspaces llamando a tu función de actualización local
        addWorkspace(createdWorkspace);
      } catch (error) {
        console.error("Error creando el workspace:", error);
      }
    }
  };

  const toggleWorkspaces = () => {
    setLocalWorkspacesOpen(!localWorkspacesOpen);
    setHasInteracted(true); // Solo se marca la primera vez que el usuario interactúa
  };

  // In case the user signs out while on the page.
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const variants = {
    collapsed: { height: 0, opacity: 0 },
    open: { height: "auto", opacity: 1 },
  };

  const variantsSidebar = {
    collapsed: { width: 0 },
    open: { width: 256 },
  };
  console.log(user.firstName);
  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.aside
              initial={hasInteractedWithSidebar ? "collapsed" : false}
              animate="open"
              exit="collapsed"
              variants={variantsSidebar}
              transition={{ duration: 0.3 }}
              className={`overflow-hidden ${
                isMobile ? "fixed z-40" : " flex h-screen z-0"
              } bg-card text-card-foreground px-4 flex flex-col justify-between border-r-2 shadow-lg w-64 h-full top-0 left-0`}
            >
              <motion.div
                initial={hasInteractedWithSidebar ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}
                className="flex flex-col h-full"
              >
                <div className="flex flex-col ">
                  <div className="py-2 flex flex-col border-b">
                    <div className="flex items-center p-2 justify-between rounded-md hover:bg-primary/10">
                      <div className="flex items-center space-x-4  justify-center ">
                        <UserButton />
                        <div>
                          <p className="font-medium">
                            {user.firstName ? user.firstName : user.username}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleSidebarClose}
                      >
                        <PanelLeftClose className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {activeWorkspace && (
                    <div className="py-4 border-b">
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                        {activeWorkspace.name}
                      </h3>
                      <nav className="space-y-1">
                        <Link href={`/workspaces/${activeWorkspace.id}`}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href={`/workspaces/${activeWorkspace.id}/collections`}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Colecciones
                          </Button>
                        </Link>
                        <Link href={`/workspaces/${activeWorkspace.id}/agenda`}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Agenda
                          </Button>
                        </Link>
                        <Link href={`/workspaces/${activeWorkspace.id}/chat`}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </Link>
                      </nav>
                    </div>
                  )}

                  <div className="flex w-full justify-between items-center my-4">
                    <h2 className="text-lg font-semibold">My Workspaces</h2>
                    <div className="flex self-end items-center gap-2">
                      <Dialog>
                        <DialogTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Plus className="h-5 w-5 opacity-50" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[400px] items-center justify-center flex flex-col gap-4">
                          <DialogHeader>
                            <DialogTitle className="text-lg">
                              Create a new workspace
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col w-full items-start justify-start gap-4">
                            <Label
                              htmlFor="workspace-name"
                              className="px-3 font-semibold"
                            >
                              Workspace name
                            </Label>
                            <Input
                              value={workspaceName}
                              onChange={(e) => setWorkspaceName(e.target.value)}
                              id="workspace-name"
                              placeholder="workspace name"
                              className="w-full"
                            />
                          </div>

                          <DialogFooter className="flex flex-row w-[40%] justify-center items-center">
                            <DialogClose asChild>
                              <Button onClick={handleSubmit}>Submit</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleWorkspaces}
                        aria-label="Toggle Workspaces"
                      >
                        {localWorkspacesOpen ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {localWorkspacesOpen && (
                      <motion.div
                        className="overflow-hidden"
                        initial={hasInteracted ? "collapsed" : false}
                        animate="open"
                        exit="collapsed"
                        variants={variants}
                        transition={{ duration: 0.3 }}
                      >
                        <ul className="space-y-2 mb-6">
                          {Array.isArray(workspaces) &&
                          workspaces.length > 0 ? (
                            workspaces.map((workspace) => (
                              <li key={workspace.id}>
                                <Link href={`/workspaces/${workspace.id}`}>
                                  <Button
                                    variant="ghost"
                                    className={`relative w-full justify-start overflow-hidden ${
                                      activeWorkspace?.id === workspace.id
                                        ? "bg-primary/10"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      updateActiveWorkspace(workspace)
                                    }
                                  >
                                    <span className="relative z-10">
                                      {workspace.name}
                                    </span>
                                  </Button>
                                </Link>
                              </li>
                            ))
                          ) : (
                            <p>No workspaces available</p>
                          )}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-auto py-4 border-t">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={handleThemeChange}
                        aria-label="Toggle theme"
                      />
                      <Moon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.aside>

            {/* Overlay que cierra la sidebar al hacer clic fuera de ella */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black z-30"
                onClick={closeSidebar}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
