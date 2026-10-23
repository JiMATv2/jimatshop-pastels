import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Reply, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export interface ChatMessageComposerProps {
  disabled: boolean;
  roomId: string | null;
  onSend: (text: string, file: File | null) => Promise<void>;
}

function ChatMessageComposerInner({ disabled, roomId, onSend }: ChatMessageComposerProps) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [roomId]);

  useEffect(() => {
    if (!disabled && roomId && inputRef.current) inputRef.current.focus({ preventScroll: true });
  }, [disabled, roomId]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (!next) return;
    if (next.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setFile(next);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const submit = useCallback(async () => {
    if (!roomId || disabled || sending) return;
    if (file) {
      setSending(true);
      try {
        await onSend(draft, file);
        setDraft('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } finally {
        setSending(false);
      }
      return;
    }
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      await onSend(text, null);
      setDraft('');
    } finally {
      setSending(false);
    }
  }, [roomId, disabled, sending, draft, file, onSend]);

  const busy = disabled || !roomId || sending;

  return (
    <div className="p-3 border-t border-border bg-background">
      {file && (
        <div className="mb-2 p-2 bg-muted rounded-lg flex items-center gap-2 text-sm">
          {file.type.startsWith('image/') ? (
            <ImageIcon className="w-4 h-4 text-primary" />
          ) : (
            <FileText className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-medium truncate flex-1">{file.name}</span>
          <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
          <Button type="button" onClick={handleRemoveFile} variant="ghost" size="sm" className="h-6 w-6 p-0">
            ×
          </Button>
        </div>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
          className="hidden"
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="icon"
          disabled={busy}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={busy}
        />
        <Button type="submit" size="icon" disabled={(!draft.trim() && !file) || busy}>
          <Reply className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

export const ChatMessageComposer = memo(ChatMessageComposerInner);
