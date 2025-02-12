"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useUserStore } from "@/store/user-store/user-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Mail, Clock, Check, X } from "lucide-react";

export default function InvitationManager({ workspace }) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const api = useApi();

  useEffect(() => {
    loadPendingInvitations();
  }, [workspace.id]);

  const loadPendingInvitations = async () => {
    try {
      const response = await api.workspaces.invitations.getPendingByWorkspace(workspace.id);
      setPendingInvitations(response.data);
    } catch (error) {
      console.error("Error loading invitations:", error);
      toast.error("Error al cargar las invitaciones pendientes");
    }
  };

  const handleInvite = async () => {
    if (!inviteeEmail) {
      toast.error("Por favor, introduce un email");
      return;
    }

    setIsLoading(true);
    try {
      await api.workspaces.invitations.create(
        workspace.id,
        user.id,
        inviteeEmail
      );
      toast.success("Invitación enviada correctamente");
      setInviteeEmail("");
      setIsInviteDialogOpen(false);
      loadPendingInvitations();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Error al enviar la invitación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await api.workspaces.invitations.process(invitationId, 'cancel');
      toast.success("Invitación cancelada");
      loadPendingInvitations();
    } catch (error) {
      console.error("Error canceling invitation:", error);
      toast.error("Error al cancelar la invitación");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invitar Usuario
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invitar a {workspace.name}</DialogTitle>
            <DialogDescription>
              Envía una invitación por email para que otros usuarios puedan unirse a este workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={inviteeEmail}
                onChange={(e) => setInviteeEmail(e.target.value)}
                className="col-span-3"
                placeholder="usuario@ejemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleInvite}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Enviando..." : "Enviar Invitación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pendingInvitations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Invitaciones Pendientes</h3>
          <div className="space-y-4">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{invitation.inviteeEmail}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Expira: {formatDate(invitation.expiresAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleCancelInvitation(invitation.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
