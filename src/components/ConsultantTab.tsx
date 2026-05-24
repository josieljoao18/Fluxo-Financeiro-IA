/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../FinanceContext';
import { 
  Send, 
  Sparkles, 
  BrainCircuit, 
  HelpCircle, 
  Cpu, 
  Coins, 
  Gauge, 
  ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const ConsultantTab: React.FC = () => {
  const { askAIAdvisor } = useFinance();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Olá! Sou o Flowy, seu assistente de inteligência artificial embutido no Finance Flow. Posso responder sobre despesas, analisar seu saldo ou dar conselhos de lucro líquido para corridas Uber/99. Como posso te apoiar hoje?' 
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts cards
  const promptSuggestions = [
    { text: "Como economizar combustível na Uber/99?", icon: Gauge },
    { text: "Explique a regra do orçamento 50/30/20", icon: Coins },
    { text: "Dicas para diminuir gastos com comida", icon: HelpCircle }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const responseText = await askAIAdvisor([...messages, userMsg]);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, tive um probleminha temporário de rede. Pode tentar de novo?' }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 flex flex-col h-[520px] overflow-hidden" id="ai-advisor-chat">
      {/* Visual Header bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 border-b border-slate-800 flex justify-between items-center px-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-display font-medium text-white flex items-center gap-1.5">
              Flowy AI Consultant
              <span className="text-[10px] font-mono font-black text-violet-400 bg-violet-500/10 px-1.5 rounded uppercase leading-none">V2.6</span>
            </h3>
            <p className="text-[10px] text-gray-400">Consultor financeiro virtual equipado com Gemini 3.5</p>
          </div>
        </div>
        <span className="text-[10px] font-mono flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
          Conectado
        </span>
      </div>

      {/* Messages Scroll Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide flex flex-col">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex flex-col max-w-[85%] text-xs leading-relaxed transition ${msg.role === 'user' ? 'self-end bg-indigo-500/10 border border-indigo-500/25 text-indigo-100 p-3.5 rounded-2xl rounded-tr-none' : 'self-start bg-slate-900 border border-slate-800 text-slate-200 p-3.5 rounded-2xl rounded-tl-none'}`}
          >
            {/* Metadata role badge only */}
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              {msg.role === 'user' ? 'Você' : 'Flowy IA'}
            </span>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        
        {/* Blinking typing dots */}
        {isTyping && (
          <div className="self-start bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1 animate-pulse max-w-[100px]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block w-full">Flowy pensa</span>
            <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce"></span>
            <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce delay-100"></span>
            <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce delay-200"></span>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Question suggestions picker panel */}
      {messages.length === 1 && (
        <div className="px-4 py-1.5 border-t border-slate-900">
          <p className="text-[10px] text-slate-550 mb-2 uppercase tracking-wide font-bold">Respostas Rápidas Recomendadas:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {promptSuggestions.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(item.text)}
                  className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-left text-2xs text-slate-350 transition flex items-center gap-2 group cursor-pointer"
                >
                  <div className="p-1 rounded bg-slate-800 text-slate-400 group-hover:text-emerald-400">
                    <IconComp size={10} />
                  </div>
                  <span className="flex-1 font-sans leading-normal truncate">{item.text}</span>
                  <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition text-slate-450" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom text form controller inputs */}
      <div className="p-3 border-t border-slate-900/80 bg-slate-950/70 flex gap-2">
        <input 
          type="text"
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-200 placeholder-slate-500 transition outline-none font-sans"
          placeholder="Peça auxílio à Inteligência Artificial..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(inputValue);
          }}
          disabled={isTyping}
        />
        <button 
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim() || isTyping}
          className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
