"use client";

import { useState, useRef, useEffect } from "react";
import { Station } from "@/types";
import { sendCopilotQuery } from "@/hooks/use-api";
import { Bot, Send, Lightbulb, AlertTriangle, Info, Zap } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendations?: { action: string; priority: string; impact: string }[];
  category?: string;
  confidence?: number;
  sources?: string[];
  timestamp: Date;
}

interface CopilotChatProps {
  station: Station;
}

const SUGGESTED_QUERIES = [
  "What's our fuel status?",
  "Why is the generator load so high?",
  "Water treatment status?",
  "When is the next resupply?",
  "Current weather conditions?",
  "Give me a full station status report",
];

export default function CopilotChat({ station }: CopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `Hello, I'm the AI Operations Copilot for ${station.name}. I can help you analyze fuel status, generator load, water treatment, resupply logistics, and weather conditions. What would you like to know?`,
        category: "general",
        timestamp: new Date(),
      }]);
    }
  }, [station.name, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    const response = await sendCopilotQuery(text, station.id);

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response.answer,
      recommendations: response.recommendations,
      category: response.category,
      confidence: response.confidence,
      sources: response.sources,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsProcessing(false);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "alert": return <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
      case "diagnostic": return <Info className="w-3.5 h-3.5 text-blue-400" />;
      case "prediction": return <Zap className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Bot className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "HIGH": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MEDIUM": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "LOW": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] border border-[#1e293b] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0d1117]">
        <Bot className="w-5 h-5 text-[var(--accent)]" />
        <span className="font-mono text-sm text-slate-300">AI OPS COPILOT</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-500 font-mono">ONLINE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user"
              ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg rounded-br-sm"
              : "bg-[#1e293b] border border-[#334155] rounded-lg rounded-bl-sm"
            } px-3.5 py-2.5`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-2">
                  {getCategoryIcon(msg.category)}
                  <span className="text-[10px] font-mono uppercase text-slate-500">{msg.category}</span>
                  {msg.confidence !== undefined && (
                    <span className="text-[10px] font-mono text-slate-600 ml-auto">
                      {Math.round(msg.confidence * 100)}% conf
                    </span>
                  )}
                </div>
              )}
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>

              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {msg.recommendations.map((rec, i) => (
                    <div key={i} className={`flex items-start gap-2 px-2.5 py-1.5 rounded border text-xs ${getPriorityColor(rec.priority)}`}>
                      <span className="font-mono font-bold shrink-0">{rec.priority}</span>
                      <div>
                        <div className="text-slate-200">{rec.action}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">Impact: {rec.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {msg.sources.map((src, i) => (
                    <span key={i} className="text-[10px] font-mono bg-[#0d1117] text-slate-500 px-1.5 py-0.5 rounded">
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg rounded-bl-sm px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-slate-500 font-mono">Analyzing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-[#1e293b]/50">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3 h-3 text-yellow-500" />
            <span className="text-[10px] font-mono text-slate-500">SUGGESTED</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUERIES.slice(0, 4).map((q: string, i: number) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs px-2.5 py-1 rounded-full border border-[#334155] bg-[#0d1117] text-slate-400 hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-[#1e293b] bg-[#0d1117]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend(input)}
            placeholder="Ask about fuel, generators, water, weather..."
            className="flex-1 bg-[#1e293b] border border-[#334155] rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[var(--accent)]/50 font-mono"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isProcessing}
            className="px-3 py-2 bg-[var(--accent)]/20 border border-[var(--accent)]/30 rounded-md text-[var(--accent)] hover:bg-[var(--accent)]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
