"use client";

import Chat from "@/components/chat/chat";
import { useState, useEffect, useRef } from "react";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useUserStore } from "@/store/user-store/user-store";

export default function ChatPage() {
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const user = useUserStore((state) => state.user);

  // Crear una referencia para el último mensaje
  const lastMessageRef = useRef(null);

  /**
   * Llama al endpoint para obtener los mensajes del chat cuando se monta el componente,
   * y los formatea para que encajen con el formato del chat.
   * @param {number} activeWorkspace.id - El ID del workspace actual
   * @param {User} user - El usuario actual
   */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/workspaces/${activeWorkspace.id}/chat/messages`
        );
        if (!response.ok) {
          throw new Error("Error al obtener los mensajes");
        }
        const data = await response.json();
        console.log("Mensajes recibidos:", data, "userid:", user.id);
        // Mapea los mensajes recibidos para que encajen con el formato del chat
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          sender: msg.user ? msg.user.name : "Usuario desconocido",
          avatar: msg.user ? "/avatar.jpg" : "/placeholder-user.jpg",
          message: msg.content,
          isSelf: msg.userId === user.id, // Cambia esto con la lógica de autenticación
        }));
        console.log(fetchMessages);
        setChatMessages(formattedMessages);
      } catch (error) {
        console.error("Error obteniendo mensajes del chat:", error);
      }
    };
    fetchMessages();
  }, [activeWorkspace]);

  /**
   * Desplázate al último mensaje cuando se actualicen los mensajes
   */
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  /**
   * Maneja el envío de mensajes nuevos
   * @param {string} newMessage - El texto del mensaje a enviar
   */
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const newChatMessage = {
        id: chatMessages.length + 1,
        sender: "Tú",
        avatar: "/placeholder-user.jpg",
        message: newMessage.trim(),
        isSelf: true,
      };
      setChatMessages([...chatMessages, newChatMessage]);
      setNewMessage("");

      console.log("Metiendo mensaje en la base de datos:", newChatMessage);

      // También llamar al endpoint para almacenar el nuevo mensaje
      try {
        await fetch(
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
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
      }
    }
  };

  return (
    <Chat
      msg={chatMessages}
      setMsg={setChatMessages}
      handleSendMessage={handleSendMessage}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      lastMessageRef={lastMessageRef}
      chatMessages={chatMessages}
    />
  );
}
