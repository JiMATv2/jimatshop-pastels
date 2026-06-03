import { Socket, Channel } from 'phoenix';
import { EX_SUPABASE_ENDPOINT } from './client';

function httpBaseToWsSocketUrl(httpBase: string): string {
  const trimmed = httpBase.replace(/\/$/, '');
  if (trimmed.startsWith('https://')) return 'wss://' + trimmed.slice(8) + '/socket';
  if (trimmed.startsWith('http://')) return 'ws://' + trimmed.slice(7) + '/socket';
  return 'ws://' + trimmed + '/socket';
}

export type ChatPostgresChangePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema?: string;
  new?: Record<string, unknown> | null;
  old?: Record<string, unknown> | null;
};

/**
 * Phoenix replacement for Supabase Realtime on chat tables.
 * Topics: `chat:rooms`, `chat:room:<uuid>` (must match ExSupabase.ChatChannel).
 */
export function subscribeChatChannel(
  topic: string,
  onPostgresChanges: (payload: ChatPostgresChangePayload) => void
): { disconnect: () => void } {
  const base = import.meta.env.VITE_EX_SUPABASE_ENDPOINT || EX_SUPABASE_ENDPOINT;
  const url = httpBaseToWsSocketUrl(base);
  const socket = new Socket(url, { params: {} });
  socket.connect();

  const channel: Channel = socket.channel(topic, {});
  channel.on('postgres_changes', (payload: ChatPostgresChangePayload) => {
    onPostgresChanges(payload);
  });

  channel
    .join()
    .receive('ok', () => {})
    .receive('error', (resp: unknown) => {
      console.error('[chatPhoenix] join failed', topic, resp);
    });

  return {
    disconnect: () => {
      try {
        channel.leave();
      } catch {
        /* ignore */
      }
      socket.disconnect();
    },
  };
}
