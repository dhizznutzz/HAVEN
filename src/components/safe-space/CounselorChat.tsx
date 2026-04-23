'use client';

import { useEffect, useRef, useState } from 'react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageComposer,
  MessageList,
  Window,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import { Loader2 } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export function CounselorChat() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  useEffect(() => {
    const anonId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    let cancelled = false;

    async function init() {
      try {
        // Always use a fresh instance to avoid the singleton carrying stale state
        const chatClient = new StreamChat(API_KEY);
        clientRef.current = chatClient;

        const res = await fetch('/api/stream/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: anonId }),
        });

        if (!res.ok) throw new Error('Failed to get Stream token');
        const { token, userId, userName } = await res.json();

        // Disconnect any existing connection on the client before connecting
        if (chatClient.userID) {
          await chatClient.disconnectUser();
        }

        if (cancelled) return;

        await chatClient.connectUser({ id: userId, name: userName }, token);

        if (cancelled) {
          chatClient.disconnectUser();
          return;
        }

        const ch = chatClient.channel('messaging', `counselor_${userId}`, {
          members: [userId],
        } as Record<string, unknown>);
        await ch.watch();

        if (cancelled) {
          chatClient.disconnectUser();
          return;
        }

        setClient(chatClient);
        setChannel(ch);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to connect');
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      clientRef.current?.disconnectUser();
      clientRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <p className="text-xs text-gray-400">Check your Stream API keys in .env.local</p>
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
        <p className="text-xs text-gray-400">Connecting to counselor...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <Chat client={client} theme="str-chat__theme-light">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageComposer />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
}
