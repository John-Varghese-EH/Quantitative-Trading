/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, BrainCircuit, Activity, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "strategy" | "council_verdict";
  metadata?: any;
};

// Double Bezel container pattern
function DoubleBezel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 ${className}`}>{children}</div>;
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: "Hello! I am your AI Trading Copilot. I can consult the AI Council for stock analysis, generate trading strategies, or backtest ideas. What would you like to explore today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      });
      
      if (!response.ok) throw new Error("Failed to communicate with Copilot");
      const data = await response.json();
      
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: data.role,
          type: data.type,
          content: data.content,
          metadata: data.metadata
        }
      ]);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting to the AI Council right now. Please try again later.",
        }
      ]);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-primary" />
          AI Trading Copilot
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ask the AI Council for insights, generate strategies, or analyze market sentiment.
        </p>
      </motion.div>

      {/* Chat Area */}
      <DoubleBezel className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-0 border-0 shadow-none bg-background rounded-xl">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-muted/50 rounded-tl-sm border border-border/50"
                    }`}>
                      {msg.type === "council_verdict" ? (
                        <div className="space-y-4">
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                            {['Value', 'Momentum', 'Macro', 'Sentiment'].map((agent, idx) => (
                              <div key={agent} className="bg-background rounded-lg p-2 border border-border flex flex-col items-center justify-center text-center gap-1 shadow-sm">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <BrainCircuit className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{agent}</span>
                                <Badge variant={idx % 2 === 0 ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                                  {idx % 2 === 0 ? 'BULLISH' : 'NEUTRAL'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <div className="pt-3 border-t border-border/50 flex gap-2">
                            <Button size="sm" variant="outline" className="text-xs h-8">
                              <BarChart3 className="w-3 h-3 mr-1" /> View SHAP Analysis
                            </Button>
                            <Button size="sm" className="text-xs h-8">
                              <Activity className="w-3 h-3 mr-1" /> Run Backtest
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-4 border border-border/50 flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-4 border-t bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 rounded-b-xl">
              <form onSubmit={handleSend} className="relative flex items-center">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a ticker, or say 'Build a momentum strategy for TSLA'..."
                  className="pr-12 py-6 rounded-xl border-border/50 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/50 text-base"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 h-8 w-8 rounded-lg"
                >
                  <Send className="w-4 h-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted font-normal text-xs py-1" onClick={() => setInput("What's the AI Council's verdict on AAPL?")}>
                  <BrainCircuit className="w-3 h-3 mr-1" /> AAPL Analysis
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted font-normal text-xs py-1" onClick={() => setInput("Build a mean-reversion strategy for crypto.")}>
                  <Activity className="w-3 h-3 mr-1" /> Mean Reversion
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted font-normal text-xs py-1" onClick={() => setInput("Backtest TSLA using RSI and MACD over the last year.")}>
                  <BarChart3 className="w-3 h-3 mr-1" /> TSLA Backtest
                </Badge>
              </div>
            </div>

          </CardContent>
        </Card>
      </DoubleBezel>
    </div>
  );
}
