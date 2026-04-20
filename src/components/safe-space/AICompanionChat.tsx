'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '@/types';
import { streamCompanionResponse } from '@/lib/ai/companion';

const CRISIS_KEYWORDS = ['want to die', 'kill myself', 'end it all', 'no reason to live', 'bunuh diri'];

function detectCrisis(text: string): boolean {
  return CRISIS_KEYWORDS.some(kw => text.toLowerCase().includes(kw));
}

export function AICompanionChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hai! I\'m Rakan, your safe space companion. 💙 How are you feeling today? Remember, this space is completely private and anonymous. Jangan risau — take your time.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    if (detectCrisis(userMessage)) {
      setShowCrisisAlert(true);
    }

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    // Add placeholder for streaming response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      let fullResponse = '';
      await streamCompanionResponse(newMessages, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: fullResponse },
        ]);
      });
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Maaf, I had trouble connecting. Please try again in a moment.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {showCrisisAlert && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-red-800">You are not alone</p>
            <p className="text-xs text-red-700 mt-0.5">
              Befrienders Malaysia: <strong>03-7627 2929</strong> (free, 24/7)
            </p>
            <button
              onClick={() => setShowCrisisAlert(false)}
              className="text-xs text-red-500 underline mt-1"
            >
              Continue with Rakan
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-base shrink-0">
                💙
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-rose-500 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}
            >
              {msg.content || (
                <span className="flex gap-1 py-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Share how you're feeling..."
            disabled={loading}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Befrienders Malaysia: 03-7627 2929 (free, 24/7) • This conversation is anonymous
        </p>
      </div>
    </div>
  );
}
