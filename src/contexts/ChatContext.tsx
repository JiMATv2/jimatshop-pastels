import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { resolveShopperId } from '@/lib/api/shopper';
import { ChatMessage, ChatRoom, ChatUser } from '@/types/chat';
import { supabase } from '@/lib/supabase/client';
import { subscribeChatChannel } from '@/lib/supabase/chatPhoenix';
import { toast } from 'sonner';

interface ChatContextType {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: ChatMessage[];
  loading: boolean;
  buyers: ChatUser[];
  shopperId: string | null;
  setActiveRoom: (room: ChatRoom | null) => void;
  sendMessage: (roomId: string, message: string) => Promise<void>;
  sendMessageWithAttachment: (roomId: string, message: string, file: File) => Promise<void>;
  sendMessageWithImageUrl: (roomId: string, message: string, imageUrl: string, productId?: string) => Promise<void>;
  createOrGetRoom: (buyerId: string) => Promise<ChatRoom | null>;
  markAsRead: (roomId: string) => Promise<void>;
  getTotalUnreadCount: () => number;
  fetchBuyers: () => Promise<void>;
  fetchMessages: (options?: { silent?: boolean }) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

function formatBuyer(user: {
  id: string;
  business_name?: string | null;
  outlet_name?: string | null;
  user_id?: string | null;
  email?: string | null;
}): ChatUser {
  const display = user.outlet_name || user.business_name || user.email || 'Shop';
  return {
    id: user.id,
    business_name: user.business_name ?? undefined,
    display_name: display,
    user_id: user.user_id ?? undefined,
    email: user.email || 'N/A',
    role: 'buyer',
  };
}

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [shopperId, setShopperId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState<ChatUser[]>([]);
  const roomsChatSub = useRef<{ disconnect: () => void } | null>(null);
  const messagesChatSub = useRef<{ disconnect: () => void } | null>(null);
  const roomsRef = useRef<ChatRoom[]>([]);
  const fetchRoomsRealtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchRoomsInFlightRef = useRef(false);
  const fetchRoomsQueuedRef = useRef(false);
  const fetchRoomsQueuedOptionsRef = useRef<{ silent?: boolean } | null>(null);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  useEffect(() => {
    if (!user?.id) {
      setShopperId(null);
      return;
    }
    let cancelled = false;
    resolveShopperId({ authUserId: user.id, email: user.email })
      .then((id) => {
        if (!cancelled) setShopperId(id);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email]);

  const getRoomUnreadCount = async (room: ChatRoom): Promise<number> => {
    if (!user) return 0;
    try {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('count', { count: 'exact' })
        .eq('room_id', room.id)
        .neq('sender_id', user.id)
        .is('read_at', null);
      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  };

  const fetchRooms = async (options?: { silent?: boolean }) => {
    if (!shopperId) {
      setRooms([]);
      return;
    }
    if (fetchRoomsInFlightRef.current) {
      fetchRoomsQueuedRef.current = true;
      const prev = fetchRoomsQueuedOptionsRef.current;
      fetchRoomsQueuedOptionsRef.current = { silent: !!(prev?.silent || options?.silent) };
      return;
    }
    fetchRoomsInFlightRef.current = true;
    const silent = options?.silent === true;
    if (!silent) setLoading(true);
    try {
      const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select(
          `*,
          buyer_profiles!chat_rooms_buyer_profile_id_fkey(id, business_name, user_id, email, outlet_name)`
        )
        .eq('shopper_id', shopperId)
        .eq('chat_type', 'shopper-buyer')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const formatted: ChatRoom[] = await Promise.all(
        (chatRooms || []).map(async (room: Record<string, unknown>) => {
          const bp = room.buyer_profiles as Record<string, unknown> | null;
          return {
            ...(room as ChatRoom),
            unread_count: await getRoomUnreadCount(room as ChatRoom),
            buyer: bp ? formatBuyer(bp as Parameters<typeof formatBuyer>[0]) : undefined,
            chat_type: (room.chat_type as string) || 'shopper-buyer',
          };
        })
      );
      setRooms(formatted);
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      toast.error('Failed to load conversations');
    } finally {
      if (!silent) setLoading(false);
      fetchRoomsInFlightRef.current = false;
      if (fetchRoomsQueuedRef.current) {
        fetchRoomsQueuedRef.current = false;
        const queued = fetchRoomsQueuedOptionsRef.current;
        fetchRoomsQueuedOptionsRef.current = null;
        void fetchRooms(queued ?? undefined);
      }
    }
  };

  const fetchBuyers = async () => {
    if (!shopperId) {
      setBuyers([]);
      return;
    }
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('jimatshop_orders')
        .select('buyer_id')
        .eq('shopper_id', shopperId);
      if (ordersError) throw ordersError;

      const buyerIds = Array.from(
        new Set((orders || []).map((o: { buyer_id: string }) => o.buyer_id).filter(Boolean))
      );
      if (buyerIds.length === 0) {
        setBuyers([]);
        return;
      }

      const { data: buyerRows, error: buyerError } = await supabase
        .from('buyers')
        .select('id, business_name, outlet_name, user_id, email')
        .in('id', buyerIds);
      if (buyerError) throw buyerError;

      setBuyers((buyerRows || []).map((b) => formatBuyer(b)));
    } catch (err) {
      console.error('Error fetching buyers:', err);
      toast.error('Failed to load shops');
    }
  };

  const fetchMessages = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!activeRoom) {
        setMessages([]);
        return;
      }
      try {
        const { data: chatMessages, error } = await supabase
          .from('chat_messages')
          .select('*, attachment_url, attachment_filename, attachment_size, metadata')
          .eq('room_id', activeRoom.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        setMessages(
          (chatMessages || []).map((m: Record<string, unknown>) => ({
            ...(m as ChatMessage),
            sender: { id: m.sender_id as string, email: 'N/A' },
          }))
        );
      } catch (err) {
        console.error('Error fetching messages:', err);
        if (!options?.silent) toast.error('Failed to load messages');
      }
    },
    [activeRoom]
  );

  const markAsRead = useCallback(
    async (roomId: string) => {
      if (!user) return;
      try {
        await supabase
          .from('chat_messages')
          .update({ read_at: new Date().toISOString() })
          .eq('room_id', roomId)
          .neq('sender_id', user.id)
          .is('read_at', null);
        void fetchRooms({ silent: true });
      } catch (err) {
        console.error('Error marking messages read:', err);
      }
    },
    [user, shopperId]
  );

  useEffect(() => {
    if (!shopperId) {
      setRooms([]);
      return;
    }
    void fetchRooms();
    void fetchBuyers();

    roomsChatSub.current?.disconnect();
    const scheduleRefresh = () => {
      if (fetchRoomsRealtimeTimerRef.current) clearTimeout(fetchRoomsRealtimeTimerRef.current);
      fetchRoomsRealtimeTimerRef.current = setTimeout(() => {
        fetchRoomsRealtimeTimerRef.current = null;
        void fetchRooms({ silent: true });
      }, 320);
    };
    roomsChatSub.current = subscribeChatChannel('chat:rooms', scheduleRefresh);

    return () => {
      if (fetchRoomsRealtimeTimerRef.current) {
        clearTimeout(fetchRoomsRealtimeTimerRef.current);
        fetchRoomsRealtimeTimerRef.current = null;
      }
      roomsChatSub.current?.disconnect();
      roomsChatSub.current = null;
    };
  }, [shopperId, user?.id]);

  useEffect(() => {
    if (!activeRoom || !user) {
      messagesChatSub.current?.disconnect();
      messagesChatSub.current = null;
      setMessages([]);
      return;
    }

    void fetchMessages();
    void markAsRead(activeRoom.id);

    messagesChatSub.current?.disconnect();
    messagesChatSub.current = subscribeChatChannel(`chat:room:${activeRoom.id}`, (payload) => {
      if (payload.eventType === 'INSERT') {
        const raw = payload.new as Partial<ChatMessage> | null;
        if (!raw?.id) return;
        const newMessage: ChatMessage = {
          ...(raw as ChatMessage),
          sender: { id: raw.sender_id as string, email: 'N/A' },
        };
        setMessages((prev) => (prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]));
      } else if (payload.eventType === 'UPDATE') {
        const raw = payload.new as Partial<ChatMessage> | null;
        if (!raw?.id) return;
        setMessages((prev) => prev.map((m) => (m.id === raw.id ? { ...m, ...(raw as ChatMessage) } : m)));
      } else if (payload.eventType === 'DELETE') {
        setMessages((prev) => prev.filter((msg) => msg.id !== payload.old?.id));
      }
    });

    return () => {
      messagesChatSub.current?.disconnect();
      messagesChatSub.current = null;
    };
  }, [activeRoom, user, fetchMessages, markAsRead]);

  const createOrGetRoom = async (buyerId: string): Promise<ChatRoom | null> => {
    if (!shopperId) {
      toast.error('Please sign in to start a chat');
      return null;
    }
    try {
      setLoading(true);
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select(
          `*,
          buyer_profiles!chat_rooms_buyer_profile_id_fkey(id, business_name, user_id, email, outlet_name)`
        )
        .eq('shopper_id', shopperId)
        .eq('buyer_profile_id', buyerId)
        .eq('chat_type', 'shopper-buyer')
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const mapRoom = (room: Record<string, unknown>): ChatRoom => {
        const bp = room.buyer_profiles as Record<string, unknown> | null;
        return {
          ...(room as ChatRoom),
          buyer: bp ? formatBuyer(bp as Parameters<typeof formatBuyer>[0]) : undefined,
          chat_type: 'shopper-buyer',
        };
      };

      if (existingRoom) {
        const formatted = mapRoom(existingRoom as Record<string, unknown>);
        await fetchRooms({ silent: true });
        return formatted;
      }

      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          shopper_id: shopperId,
          buyer_profile_id: buyerId,
          status: 'active',
          chat_type: 'shopper-buyer',
          last_message_at: new Date().toISOString(),
        })
        .select(
          `*,
          buyer_profiles!chat_rooms_buyer_profile_id_fkey(id, business_name, user_id, email, outlet_name)`
        )
        .single();

      if (createError) {
        if (createError.code === '23505') {
          const { data: concurrent } = await supabase
            .from('chat_rooms')
            .select(
              `*,
              buyer_profiles!chat_rooms_buyer_profile_id_fkey(id, business_name, user_id, email, outlet_name)`
            )
            .eq('shopper_id', shopperId)
            .eq('buyer_profile_id', buyerId)
            .eq('chat_type', 'shopper-buyer')
            .maybeSingle();
          if (concurrent) return mapRoom(concurrent as Record<string, unknown>);
        }
        throw createError;
      }

      await fetchRooms({ silent: true });
      return mapRoom(newRoom as Record<string, unknown>);
    } catch (err) {
      console.error('Error creating chat room:', err);
      toast.error('Failed to start chat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (roomId: string, message: string) => {
    if (!user || !message.trim()) return;
    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_id: user.id,
        message: message.trim(),
        message_type: 'text',
      });
      if (error) throw error;
      await supabase
        .from('chat_rooms')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', roomId);
      await fetchMessages({ silent: true });
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  const uploadFileToStorage = async (file: File, roomId: string) => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${roomId}/${fileName}`;
    const { error } = await supabase.storage.from('chat-attachments').upload(filePath, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
    return { url: urlData.publicUrl, filename: file.name, size: file.size };
  };

  const sendMessageWithAttachment = async (roomId: string, message: string, file: File) => {
    if (!user) return;
    try {
      const { url, filename, size } = await uploadFileToStorage(file, roomId);
      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      const { error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_id: user.id,
        message: message.trim() || filename,
        message_type: messageType,
        attachment_url: url,
        attachment_filename: filename,
        attachment_size: size,
      });
      if (error) throw error;
      await supabase
        .from('chat_rooms')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', roomId);
      await fetchMessages({ silent: true });
    } catch (err) {
      console.error('Error sending attachment:', err);
      toast.error('Failed to send attachment');
    }
  };

  const sendMessageWithImageUrl = async (
    roomId: string,
    message: string,
    imageUrl: string,
    productId?: string
  ) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_id: user.id,
        message: message.trim() || 'Product inquiry',
        message_type: 'image',
        attachment_url: imageUrl,
        attachment_filename: 'product_image.jpg',
        attachment_size: 0,
        metadata: productId ? { product_id: productId } : {},
      });
      if (error) throw error;
      await supabase
        .from('chat_rooms')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', roomId);
      await fetchMessages({ silent: true });
    } catch (err) {
      console.error('Error sending product inquiry:', err);
      toast.error('Failed to send inquiry');
    }
  };

  const getTotalUnreadCount = () => rooms.reduce((acc, room) => acc + (room.unread_count || 0), 0);

  const value: ChatContextType = {
    rooms,
    activeRoom,
    messages,
    loading,
    buyers,
    shopperId,
    setActiveRoom,
    sendMessage,
    sendMessageWithAttachment,
    sendMessageWithImageUrl,
    createOrGetRoom,
    markAsRead,
    getTotalUnreadCount,
    fetchBuyers,
    fetchMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
