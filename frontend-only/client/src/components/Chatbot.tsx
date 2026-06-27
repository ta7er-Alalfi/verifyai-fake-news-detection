import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp?: string;
}

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    try {
      const res = await api.get("/chat/history");
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetchChatHistory();
    }
  }, [user, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    if (!user) {
      toast.error("Please login to chat with our AI assistant.");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: inputMsg };
    setMessages((prev) => [...prev, userMessage]);
    setInputMsg("");
    setIsSending(true);

    try {
      const res = await api.post("/chat", { message: userMessage.content });
      const botMessage: ChatMessage = { role: "model", content: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Chat error occurred");
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return null; // Only show chatbot to logged-in users

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Window */}
      {isOpen && (
        <Card className="w-80 md:w-96 h-[500px] border-gray-200 shadow-2xl flex flex-col mb-4 bg-white overflow-hidden animate-in slide-in-from-bottom-5">
          <CardHeader className="bg-gradient-to-br from-blue-900 to-blue-700 text-white flex flex-row items-center justify-between p-4 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>FakeNews AI Assistant</span>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-6 space-y-3">
                <Sparkles className="w-10 h-10 text-blue-900" />
                <p className="text-sm font-semibold">How can I help you today?</p>
                <p className="text-xs">Ask me about specific news articles, sources, or how fake news is structured!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user" 
                        ? "bg-blue-900 text-white rounded-br-none" 
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-2xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-2xs">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-900" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-3 border-t border-gray-200 bg-white">
            <form onSubmit={handleSend} className="flex w-full items-center gap-2">
              <Input
                type="text"
                placeholder="Ask your query..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={isSending}
                className="flex-1 border-gray-300 focus:ring-blue-900 focus:border-blue-900"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isSending || !inputMsg.trim()}
                className="bg-blue-900 hover:bg-blue-800 text-white shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Floating Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)} 
        size="icon" 
        className="w-14 h-14 rounded-full bg-blue-900 hover:bg-blue-850 text-white shadow-lg flex items-center justify-center pulse-glow"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    </div>
  );
}
