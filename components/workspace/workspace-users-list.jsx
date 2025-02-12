import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useApi } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function WorkspaceUsersList({ workspaceId, onUserRemoved }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const api = useApi();
      const response = await api.workspacePermissions.list(workspaceId);
      setUsers(response.data);
    } catch (error) {
      toast.error("No se pudieron cargar los usuarios del workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (workspaceUserId) => {
    try {
      const api = useApi();
      await api.workspacePermissions.remove(workspaceId, workspaceUserId);
      toast.success("Usuario eliminado del workspace");
      onUserRemoved();
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ocurrió un error al eliminar al usuario.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [workspaceId]);

  if (isLoading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Permisos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user.profileImageUrl} />
                  <AvatarFallback>
                    {user.user.firstName?.[0]}
                    {user.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {user.user.firstName} {user.user.lastName}
                </span>
              </TableCell>
              <TableCell>{user.user.email}</TableCell>
              <TableCell>{user.permissionType}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
