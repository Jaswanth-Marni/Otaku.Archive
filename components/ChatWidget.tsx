import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const replyText = await geminiService.sendMessage(userMsg.text);
    const botMsg: ChatMessage = { role: 'model', text: replyText };
    
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <div className="relative pointer-events-auto">
      {/* Navbar Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 font-condensed font-bold tracking-widest text-sm transition-colors uppercase ${isOpen ? 'text-accent-red' : 'hover:text-accent-red'}`}
      >
        <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-accent-red' : 'bg-green-500 animate-pulse'}`}></span>
        AI CHAT
      </button>
      
      {/* Dropdown Window */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white text-black border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[100] origin-top-right animate-slide-up mix-blend-normal">
          <div className="flex justify-between items-center bg-black p-4 text-white">
            <div>
              <h3 className="font-display text-xl tracking-wide uppercase">OTAKU ARCHIVE</h3>
              <span className="text-[10px] text-accent-red font-mono tracking-widest bg-white/10 px-1">ACTIVE</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-accent-red text-xl font-bold">✕</button>
          </div>
          
          <div className="h-64 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar bg-base-gray border-b-2 border-black">
            {messages.length === 0 && (
              <p className="text-gray-500 italic text-center text-xs mt-10">
                Ask about anime, studios, or details.
              </p>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 max-w-[85%] border border-black ${
                  msg.role === 'user' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
                }`}>
                  <p className="leading-tight">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && <div className="text-xs text-black font-bold animate-pulse">THINKING...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-2 bg-white flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-gray-100 border-b-2 border-gray-300 focus:border-black px-4 py-2 text-sm focus:outline-none transition-colors font-mono"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-accent-red text-white w-10 h-10 flex items-center justify-center font-bold hover:bg-black transition-colors disabled:opacity-50 border border-transparent"
            >
              →
            </button>
          </form>
        </div>
      )}
    </div>
  );
};