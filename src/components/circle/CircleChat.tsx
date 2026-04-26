'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Users, ExternalLink, ChevronRight } from 'lucide-react';
import { EnrichedCircle, MockMessage } from '@/data/circles-data';

interface CircleChatProps {
  circle: EnrichedCircle;
}

export function CircleChat({ circle }: CircleChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MockMessage[]>(circle.mock_messages);
  const [input, setInput] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const onlineCount = circle.mock_members.filter(m => m.online).length;

  return (
    <div className="flex h-full bg-white overflow-hidden rounded-none md:rounded-xl md:border md:border-gray-100">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-xl leading-none">{circle.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{circle.name}</h3>
              {circle.is_real && (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium shrink-0">Real org</span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              <span className="text-green-500">●</span> {onlineCount} online · {circle.member_count} members
            </p>
          </div>
          {circle.website && (
            <a
              href={`https://${circle.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-amber-600 hidden sm:block"
              title={circle.website}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => setShowMembers(v => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-amber-600"
            title="Members"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>

        {/* Circle info banner */}
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-800 leading-relaxed line-clamp-2">{circle.description}</p>
            {circle.location && (
              <p className="text-xs text-amber-600 mt-0.5">📍 {circle.location}</p>
            )}
          </div>
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded-full font-medium shrink-0 mt-0.5">
            {circle.category}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Date divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] text-gray-400 font-medium">Today</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {messages.map(msg => {
            const isMe = msg.user === 'You';
            const member = circle.mock_members.find(m => m.name === msg.user);
            const avatarColor = member?.color ?? 'bg-gray-200';

            return (
              <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && (
                  <div className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center text-xs font-semibold text-gray-700 shrink-0 mt-0.5`}>
                    {msg.user[0]}
                  </div>
                )}
                <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-xs text-gray-400 mb-1 font-medium">{msg.user}</span>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-amber-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-300 mt-1">{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`Message ${circle.name}…`}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 bg-gray-50 placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">Mock chat — messages are not stored or sent</p>
        </div>
      </div>

      {/* Members sidebar */}
      <div className={`flex-col border-l border-gray-100 bg-gray-50 transition-all duration-200 overflow-hidden ${
        showMembers ? 'flex w-52' : 'hidden'
      }`}>
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-700">Members ({circle.mock_members.length})</span>
          <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {/* Online */}
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide px-2 pt-1 pb-1">
            Online — {onlineCount}
          </p>
          {circle.mock_members.filter(m => m.online).map(member => (
            <div key={member.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white transition-colors">
              <div className={`w-6 h-6 rounded-full ${member.color} flex items-center justify-center text-[10px] font-semibold text-gray-700 shrink-0`}>
                {member.name[0]}
              </div>
              <span className="text-xs text-gray-700 truncate">{member.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-auto shrink-0" />
            </div>
          ))}

          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide px-2 pt-3 pb-1">
            Offline — {circle.mock_members.filter(m => !m.online).length}
          </p>
          {circle.mock_members.filter(m => !m.online).map(member => (
            <div key={member.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white transition-colors opacity-60">
              <div className={`w-6 h-6 rounded-full ${member.color} flex items-center justify-center text-[10px] font-semibold text-gray-700 shrink-0`}>
                {member.name[0]}
              </div>
              <span className="text-xs text-gray-500 truncate">{member.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
