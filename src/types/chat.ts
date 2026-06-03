export interface ChatUser {
  id: string;
  user_id?: string;
  business_name?: string;
  display_name?: string;
  email: string;
  role?: 'shopper' | 'buyer';
}

export interface ChatRoom {
  id: string;
  created_at: string;
  shopper_id?: string;
  buyer_profile_id?: string;
  status: string;
  chat_type: 'shopper-buyer' | string;
  last_message_at: string;
  unread_count?: number;
  shopper?: ChatUser;
  buyer?: ChatUser;
}

export interface ChatMessage {
  id: string;
  created_at: string;
  room_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  read_at: string | null;
  sender?: ChatUser;
  attachment_url?: string;
  attachment_filename?: string;
  attachment_size?: number;
  metadata?: Record<string, unknown>;
}
