'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
}

interface CircleChatProps {
  circleId: string;
  circleName: string;
}

// Placeholder chat — replace with Stream when API keys are configured
export function CircleChat({ circleId, circleName }: CircleChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: 'Amirah', text: 'Hey everyone! Ready for the study session? 📚', time: '2:30 PM' },
    { id: '2', user: 'Fariz', text: 'Yes! I have questions on calculus derivatives', time: '2:31 PM' },
    { id: '3', user: 'Priya', text: 'Same here, let\'s do this!', time: '2:32 PM' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: 'You',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">{circleName}</h3>
        <p className="text-xs text-gray-400">Real-time chat — configure Stream API keys for production</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.user === 'You' ? 'flex-row-reverse' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700 shrink-0">
              {msg.user[0]}
            </div>
            <div className={`max-w-[70%] ${msg.user === 'You' ? 'items-end' : 'items-start'} flex flex-col`}>
              {msg.user !== 'You' && (
                <span className="text-xs text-gray-400 mb-1">{msg.user}</span>
              )}
              <div className={`px-3 py-2 rounded-xl text-sm ${
                msg.user === 'You'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-300 mt-1">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Send a message..."
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
