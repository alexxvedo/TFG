import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useApi } from "@/lib/api";

export function InviteUserDialog({
  isOpen,
  onClose,
  workspaceId,
  onInviteSuccess,
}) {
  const [email, setEmail] = useState("");
  const [permissionType, setPermissionType] = useState("VIEWER");
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();

  const handleInvite = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      
      const api = useApi();
      const response = await api.workspaces.invitations.create(
        workspaceId,
        null, // inviterUserId will be extracted from token in backend
        email
      );

      if (response.data) {
        toast.success("Usuario invitado", {
          description: "Se ha enviado una invitación al usuario.",
        });
        onInviteSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Ocurrió un error al invitar al usuario.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invitar Usuario</DialogTitle>
          <DialogDescription>
            Invita a un usuario a colaborar en este workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right">
              Email
            </label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="usuario@ejemplo.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="permission" className="text-right">
              Permisos
            </label>
            <Select value={permissionType} onValueChange={setPermissionType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un nivel de permiso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Visualizador</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="OWNER">Propietario</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleInvite} disabled={isLoading}>
            {isLoading ? "Invitando..." : "Invitar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
