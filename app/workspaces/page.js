"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useApi } from "@/lib/api";
import { useUserStore } from "@/store/user-store/user-store";

export default function WorkspacesPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const setWorkspaces = useSidebarStore((state) => state.setWorkspaces);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );
  const api = useApi();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!isLoaded || !user) return;

      try {
        const { data: userBD } = await api.users.getUser(user.id);

        if (!userBD) {
          console.log("User not found, creating one...");
          console.log(user);
          const { data: createdUser } = await api.users.createUser({
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.imageUrl,
          });
          setUser(createdUser);
        } else {
          setUser(userBD);
        }

        const { data: workspaces } = await api.workspaces.listByUser(user.id);
        setWorkspaces(workspaces);

        // Siempre habrá al menos un workspace, redirigimos al dashboard del primero
        const firstWorkspace = workspaces[0];
        updateActiveWorkspace(firstWorkspace);
        router.replace(`/workspaces/${firstWorkspace.id}/dashboard`);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };

    fetchWorkspaces();
  }, [isLoaded, user, router, setWorkspaces, updateActiveWorkspace, api]);

  // Mostrar un loading mientras se cargan los workspaces
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
