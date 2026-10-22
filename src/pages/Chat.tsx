import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChatMessageComposer } from '@/components/chat/ChatMessageComposer';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ChatMessage, ChatRoom, ChatUser } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  PlusCircle,
  Search,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function buyerLabel(buyer?: ChatUser) {
  return buyer?.display_name || buyer?.business_name || buyer?.email || 'Shop';
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    rooms,
    messages,
    loading,
    buyers,
    shopperId,
    setActiveRoom,
    sendMessage,
    sendMessageWithAttachment,
    sendMessageWithImageUrl,
    createOrGetRoom,
    getTotalUnreadCount,
  } = useChatContext();

  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShopList, setShowShopList] = useState(false);
  const [extraBuyers, setExtraBuyers] = useState<ChatUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handledInquiryRef = useRef<string | null>(null);

  const allBuyers = useMemo(() => {
    const byId = new Map<string, ChatUser>();
    [...buyers, ...extraBuyers].forEach((b) => byId.set(b.id, b));
    return Array.from(byId.values());
  }, [buyers, extraBuyers]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedRoom]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomId = params.get('set_active_room');
    const buyerId = params.get('buyer_id');
    const productId = params.get('inquiry_product_id');
    const imageUrl = params.get('inquiry_image_url');

    const openBuyerChat = async () => {
      if (!buyerId || !shopperId) return;
      const key = `${buyerId}-${productId || ''}`;
      if (handledInquiryRef.current === key) return;
      handledInquiryRef.current = key;

      const room = await createOrGetRoom(buyerId);
      if (!room) return;
      setSelectedRoom(room);
      setActiveRoom(room);
      setShowShopList(false);

      if (productId && imageUrl) {
        await sendMessageWithImageUrl(
          room.id,
          'Hi, I have a question about this product.',
          imageUrl,
          productId
        );
        toast.success('Product inquiry sent');
      }
    };

    if (roomId && rooms.length > 0) {
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        setSelectedRoom(room);
        setActiveRoom(room);
        setShowShopList(false);
      }
    } else if (buyerId) {
      void openBuyerChat();
    }
  }, [
    location.search,
    rooms,
    shopperId,
    createOrGetRoom,
    setActiveRoom,
    sendMessageWithImageUrl,
  ]);

  useEffect(() => {
    const buyerId = new URLSearchParams(location.search).get('buyer_id');
    if (!buyerId) return;
    if (allBuyers.some((b) => b.id === buyerId)) return;

    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from('buyers')
        .select('id, business_name, outlet_name, user_id, email')
        .eq('id', buyerId)
        .maybeSingle();
      if (cancelled || error || !data) return;
      const display = data.outlet_name || data.business_name || data.email || 'Shop';
      setExtraBuyers([
        {
          id: data.id,
          business_name: data.business_name ?? undefined,
          display_name: display,
          user_id: data.user_id ?? undefined,
          email: data.email || 'N/A',
          role: 'buyer',
        },
      ]);
    })();
    return () => {
      cancelled = true;
    };
  }, [location.search, allBuyers]);

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setActiveRoom(room);
    setShowShopList(false);
  };

  const handleCreateChat = async (buyer: ChatUser) => {
    if (!user || !shopperId) {
      toast.error('Please sign in to chat');
      return;
    }
    const room = await createOrGetRoom(buyer.id);
    if (room) {
      handleSelectRoom(room);
      toast.success(`Chat with ${buyerLabel(buyer)} started`);
    }
  };

  const handleComposerSend = useCallback(
    async (text: string, attachment: File | null) => {
      if (!selectedRoom) return;
      if (attachment) {
        await sendMessageWithAttachment(selectedRoom.id, text, attachment);
      } else {
        await sendMessage(selectedRoom.id, text);
      }
    },
    [selectedRoom, sendMessage, sendMessageWithAttachment]
  );

  const filteredBuyers = allBuyers.filter(
    (b) =>
      buyerLabel(b).toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = rooms.filter((room) =>
    buyerLabel(room.buyer).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSenderName = (message: ChatMessage) => {
    if (!user) return 'Unknown';
    if (message.sender_id === user.id) return 'You';
    if (selectedRoom?.buyer?.user_id === message.sender_id) {
      return buyerLabel(selectedRoom.buyer);
    }
    return 'Shop';
  };

  const renderAttachment = (message: ChatMessage) => {
    if (!message.attachment_url) return null;
    const isImage = message.message_type === 'image';
    return (
      <div className="mt-2 p-2 bg-background/50 rounded-lg border">
        <div className="flex items-center gap-2 text-sm">
          {isImage ? (
            <ImageIcon className="w-4 h-4 text-primary" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span className="truncate">{message.attachment_filename || 'Attachment'}</span>
          {message.attachment_size ? (
            <span className="text-xs text-muted-foreground">({formatFileSize(message.attachment_size)})</span>
          ) : null}
          <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="ml-auto">
            <Download className="w-4 h-4" />
          </a>
        </div>
        {isImage && (
          <img
            src={message.attachment_url}
            alt={message.attachment_filename}
            className="mt-2 max-w-full rounded-lg"
            style={{ maxHeight: 200 }}
          />
        )}
      </div>
    );
  };

  const unreadTotal = getTotalUnreadCount();
  const listView = !selectedRoom;

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="max-w-md md:max-w-2xl mx-auto px-4 py-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-lg font-semibold mb-2">Messages</h1>
          <p className="text-muted-foreground text-sm mb-4">Sign in to chat with shops about your orders.</p>
          <Button asChild>
            <Link to="/profile">Sign in</Link>
          </Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      <Header />
      <main className="max-w-md md:max-w-2xl mx-auto w-full flex-1 flex flex-col min-h-0">
        {listView ? (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  Messages
                  {unreadTotal > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadTotal}
                    </Badge>
                  )}
                </h1>
                <p className="text-xs text-muted-foreground">Chat with shops you buy from</p>
              </div>
              <Button
                size="sm"
                variant={showShopList ? 'secondary' : 'default'}
                onClick={() => setShowShopList(!showShopList)}
                disabled={!shopperId}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                {showShopList ? 'Chats' : 'New'}
              </Button>
            </div>

            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search shops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-2">
              {loading && (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}

              {!loading && showShopList && (
                <div className="p-2 space-y-1">
                  {filteredBuyers.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No shops yet. Place an order or browse shops to start chatting.
                    </p>
                  ) : (
                    filteredBuyers.map((buyer) => (
                      <button
                        key={buyer.id}
                        type="button"
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-left"
                        onClick={() => void handleCreateChat(buyer)}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {getInitials(buyerLabel(buyer))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{buyerLabel(buyer)}</p>
                          <p className="text-xs text-muted-foreground truncate">{buyer.email}</p>
                        </div>
                        <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}

              {!loading && !showShopList && filteredRooms.length === 0 && (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <Button className="mt-4" size="sm" onClick={() => setShowShopList(true)} disabled={!shopperId}>
                    Start a chat
                  </Button>
                </div>
              )}

              {!loading && !showShopList &&
                filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-left"
                    onClick={() => handleSelectRoom(room)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {getInitials(buyerLabel(room.buyer))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{buyerLabel(room.buyer)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {room.last_message_at
                          ? new Date(room.last_message_at).toLocaleString()
                          : 'No messages yet'}
                      </p>
                    </div>
                    {room.unread_count && room.unread_count > 0 ? (
                      <Badge variant="destructive">{room.unread_count}</Badge>
                    ) : null}
                  </button>
                ))}
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-2 py-2 border-b border-border flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedRoom(null);
                  setActiveRoom(null);
                  navigate('/chat', { replace: true });
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{buyerLabel(selectedRoom.buyer)}</p>
                <p className="text-xs text-muted-foreground">Shop conversation</p>
              </div>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hello!</p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          message.sender_id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-xs opacity-80 mb-1">{getSenderName(message)}</p>
                        <p className="whitespace-pre-wrap">{message.message}</p>
                        {renderAttachment(message)}
                        <p className="text-[10px] opacity-70 mt-1 text-right">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <ChatMessageComposer
              roomId={selectedRoom.id}
              disabled={!selectedRoom}
              onSend={handleComposerSend}
            />
          </div>
        )}
      </main>
      {listView && <BottomNav />}
    </div>
  );
}
