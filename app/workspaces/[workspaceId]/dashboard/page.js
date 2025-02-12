"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { PanelLeftOpen, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InviteUserDialog } from "@/components/workspace/invite-user-dialog";
import { WorkspaceUsersList } from "@/components/workspace/workspace-users-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard({ params }) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const openSidebar = useSidebarStore((state) => state.openSidebar);
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const { activeWorkspace: workspace } = useSidebarStore((state) => state);

  console.log(workspace);

  const handleInviteSuccess = () => {
    // Actualizar la lista de usuarios
  };

  return (
    <motion.div
      initial={{ width: "100%" }}
      animate={{ width: isSidebarOpen ? "calc(100% - 256px)" : "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="flex-1 space-y-4 p-4 md:p-8 pt-6"
    >
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar Amigos
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Miembros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde el último mes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Colecciones Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  +1 desde la última semana
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Acciones en las últimas 24h
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Workspace</CardTitle>
              <CardDescription>
                Gestiona los miembros y sus permisos en el workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkspaceUsersList
                workspaceId={workspace.id}
                onUserRemoved={handleInviteSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        workspaceId={activeWorkspace?.id}
        onInviteSuccess={handleInviteSuccess}
      />
    </motion.div>
  );
}
