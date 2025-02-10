"use client";

import Chat from "@/components/chat/chat";
import { useState, useEffect, useRef } from "react";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useUserStore } from "@/store/user-store/user-store";
import { MessageCircle, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlineUsers] = useState(3); // TODO: Implement real online users count
  const user = useUserStore((state) => state.user);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeWorkspace?.id) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `http://localhost:3001/workspaces/${activeWorkspace.id}/chat/messages`
        );
        if (!response.ok) {
          throw new Error("Error al obtener los mensajes");
        }
        const data = await response.json();
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          sender: msg.user ? msg.user.name : "Usuario desconocido",
          avatar: msg.user ? "/avatar.jpg" : "/placeholder-user.jpg",
          message: msg.content,
          isSelf: msg.userId === user.id,
        }));
        setChatMessages(formattedMessages);
      } catch (error) {
        console.error("Error obteniendo mensajes del chat:", error);
        setError(
          "No se pudieron cargar los mensajes. Por favor, intenta de nuevo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [activeWorkspace?.id, user.id]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempId = Date.now();
    const newChatMessage = {
      id: tempId,
      sender: user.name || "Tú",
      avatar: user.avatar || "/placeholder-user.jpg",
      message: newMessage.trim(),
      isSelf: true,
    };

    // Add message to chat immediately
    setChatMessages((prev) => [...prev, newChatMessage]);
    setNewMessage("");

    try {
      const response = await fetch(
        `http://localhost:3001/workspaces/${activeWorkspace.id}/chat/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newMessage.trim(),
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar el mensaje");
      }

      const savedMessage = await response.json();
      // Update the temporary message with the saved one
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: savedMessage.id,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      // Add error message after the failed message
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "Sistema",
          avatar: "/system-avatar.jpg",
          message:
            "No se pudo enviar el mensaje anterior. Por favor, intenta de nuevo.",
          isSystem: true,
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-none px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MessageCircle className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Chat del Workspace</h1>
              <p className="text-sm text-muted-foreground">
                {activeWorkspace?.name || "Cargando..."}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{onlineUsers} usuarios en línea</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <div className="flex items-start space-x-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </div>
            <div className="flex items-start space-x-4 justify-end">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          </div>
        ) : (
          <Chat
            msg={chatMessages}
            setMsg={setChatMessages}
            handleSendMessage={handleSendMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            lastMessageRef={lastMessageRef}
            chatMessages={chatMessages}
          />
        )}
      </div>
    </div>
  );
}
