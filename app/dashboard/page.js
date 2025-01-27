"use client";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store"; // Importar la store de Zustand
import { PanelLeftOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const openSidebar = useSidebarStore((state) => state.openSidebar); // Función para abrir la sidebar
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen); // Estado de la sidebar

  return (
    <motion.div
      // Animamos el ancho del Dashboard para adaptarse al sidebar
      initial={{ width: "100%" }} // Ocupa todo el ancho al inicio
      animate={{ width: isSidebarOpen ? "calc(100% - 256px)" : "100%" }} // Ajusta el ancho según el estado del sidebar
      transition={{ type: "tween", duration: 0.3 }} // Transición suave sincronizada con el sidebar
      className="p-4"
    >
      <h1>Dashboard Content</h1>
    </motion.div>
  );
}
