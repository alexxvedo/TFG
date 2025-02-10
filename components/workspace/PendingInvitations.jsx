"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useUserStore } from "@/store/user-store/user-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Check, X, Clock } from "lucide-react";

export default function PendingInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUserStore((state) => state.user);
  const api = useApi();

  useEffect(() => {
    if (user?.email) {
      loadInvitations();
    }
  }, [user?.email]);

  const loadInvitations = async () => {
    try {
      const response = await api.workspaces.invitations.getPendingByEmail(user.email);
      setInvitations(response.data);
    } catch (error) {
      console.error("Error loading invitations:", error);
      toast.error("Error al cargar las invitaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitation = async (token, action) => {
    try {
      await api.workspaces.invitations.process(token, action);
      toast.success(
        action === "accept"
          ? "Invitación aceptada correctamente"
          : "Invitación rechazada"
      );
      loadInvitations();
    } catch (error) {
      console.error("Error processing invitation:", error);
      toast.error("Error al procesar la invitación");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Cargando invitaciones...</div>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold mb-4">Invitaciones Pendientes</h2>
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                Invitación para unirte a {invitation.workspace.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Invitado por: {invitation.inviter.name}
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Expira: {new Date(invitation.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleInvitation(invitation.token, "accept")}
              >
                <Check className="h-4 w-4 mr-1" />
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive/90"
                onClick={() => handleInvitation(invitation.token, "reject")}
              >
                <X className="h-4 w-4 mr-1" />
                Rechazar
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
