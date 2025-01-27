"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  LayoutGrid,
  MessageSquare,
  BarChart,
  Calendar,
  Settings,
  Sun,
  Moon,
  Send,
  PanelLeftOpen,
} from "lucide-react";

import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { motion, AnimatePresence } from "framer-motion";

// Components
import CollectionCover from "@/components/flashcards/CollectionCover";
import Chat from "@/components/chat/chat";

export default function CollectionsPage() {
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );
  console.log("Active workspace", activeWorkspace);
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const openSidebar = useSidebarStore((state) => state.openSidebar);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Alice",
      avatar: "/avatar-1.jpg",
      message: "Hola, ¿cómo va el estudio?",
      isSelf: false,
    },
    {
      id: 2,
      sender: "Tú",
      avatar: "/placeholder-user.jpg",
      message: "Bien, estoy repasando las flashcards de historia",
      isSelf: true,
    },
    {
      id: 3,
      sender: "Bob",
      avatar: "/avatar-2.jpg",
      message: "¿Alguien necesita ayuda con matemáticas?",
      isSelf: false,
    },
    {
      id: 4,
      sender: "Alice",
      avatar: "/avatar-1.jpg",
      message: "Yo podría usar algo de ayuda con álgebra",
      isSelf: false,
    },
    {
      id: 5,
      sender: "Tú",
      avatar: "/placeholder-user.jpg",
      message: "Puedo ayudarte con eso, Alice",
      isSelf: true,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Crear una referencia para el último mensaje
  const lastMessageRef = useRef(null);

  // Desplázate al último mensaje cuando se actualicen los mensajes
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = fetch(
          `http://localhost:3001/workspaces/${activeWorkspace.id}/collections`
        );

        if (!response.ok) {
          throw new Error("Error obteniendo collections");
        }

        const collections = await response.json();

        const activeWorkspaceWithCollections = {
          ...activeWorkspace,
          collections: collections,
        };

        updateActiveWorkspace(activeWorkspaceWithCollections);
      } catch (error) {
        console.error("Error obteniendo collections:", error);
      }
    };
    fetchCollections();
  }, [activeWorkspace]);

  const handleSendMessage = () => {
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
    }
  };

  return (
    <motion.div
      // Animamos el ancho del Dashboard para adaptarse al sidebar
      initial={{ width: "100%" }} // Ocupa todo el ancho al inicio
      animate={{ width: isSidebarOpen ? "calc(100% - 256px)" : "100%" }} // Ajusta el ancho según el estado del sidebar
      transition={{ type: "tween", duration: 0.3 }} // Transición suave sincronizada con el sidebar
      className="flex-1 max-h-screen min-h-screen overflow-hidden flex flex-col bg-background items-center"
    >
      <div className="flex items-center border-b-2 px-8 py-3.5 w-full">
        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.div
              key="openButton"
              initial={{ opacity: 0, x: -20 }} // Botón comienza fuera de la pantalla
              animate={{ opacity: 1, x: 0 }} // Aparece deslizándose
              exit={{ opacity: 0, x: -20 }} // Desaparece deslizándose
              transition={{ duration: 0.3 }} // Duración de la animación
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={openSidebar}
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <h1 className="text-3xl font-bold">{activeWorkspace.name}</h1>
      </div>
      <Tabs
        defaultValue="cards"
        className=" flex flex-col items-center min-w-full"
      >
        <TabsList className="flex flex-row ">
          <TabsTrigger value="cards">
            <LayoutGrid className="h-5 w-5 mr-2" />
            <span className="text-lg">Cards</span>
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="h-5 w-5 mr-2" />
            <span className="text-lg">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart className="h-5 w-5 mr-2" />
            <span className="text-lg">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="agenda">
            <Calendar className="h-5 w-5 mr-2" />
            <span className="text-lg">Agenda</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cards" className="flex-1 p-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWorkspace?.collections?.length > 0 ? (
              activeWorkspace.collections.map((card) => (
                <CollectionCover card={card} key={card.id} />
              ))
            ) : (
              <p>No collections found</p>
            )}
          </div>
        </TabsContent>
        <TabsContent
          value="chat"
          className=" flex flex-col p-4 w-full min-h-[90vh] max-h-[85vh]"
        ></TabsContent>
        <TabsContent value="stats">
          <Card>
            <CardContent className="p-4"></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="agenda">
          <Card>
            <CardContent className="p-4"></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
