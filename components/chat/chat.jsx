"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, Image as ImageIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat({
  handleSendMessage,
  newMessage,
  setNewMessage,
  lastMessageRef,
  chatMessages,
}) {
  const textareaRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      if (textareaRef.current.scrollHeight > 24) {
        const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
        textareaRef.current.style.height = `${newHeight}px`;
      }
      setIsOverflowing(textareaRef.current.scrollHeight > 120);
    }
  }, [newMessage]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <AnimatePresence initial={false} mode="sync">
            {chatMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: msg.isSelf ? 100 : -100 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start space-x-2.5 ${
                  msg.isSelf ? "flex-row-reverse space-x-reverse" : ""
                }`}
                ref={index === chatMessages.length - 1 ? lastMessageRef : null}
              >
                <Avatar
                  className={`w-8 h-8 ${msg.isSelf ? "ml-2.5" : "mr-2.5"}`}
                >
                  <AvatarImage src={msg.avatar} />
                  <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col space-y-1 max-w-[70%]">
                  <span
                    className={`text-xs text-muted-foreground ${
                      msg.isSelf ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.sender}
                  </span>
                  <motion.div
                    layout
                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                      msg.isSelf
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted/50 backdrop-blur-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  </motion.div>
                  <span
                    className={`text-[10px] text-muted-foreground/60 ${
                      msg.isSelf ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="flex-none border-t bg-background/80 backdrop-blur-sm p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage()
              }
              className={`w-full p-3 text-sm rounded-xl border border-primary/10 bg-muted/50 placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                isOverflowing ? "overflow-y-auto" : "overflow-y-hidden"
              }`}
              style={{ maxHeight: "120px" }}
            />
            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
