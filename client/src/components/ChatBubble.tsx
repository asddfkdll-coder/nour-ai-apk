import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface ChatBubbleProps {
  content: string;
  sender: 'user' | 'character';
  timestamp?: string;
  avatar?: string;
}

export const ChatBubble = ({ content, sender, timestamp, avatar }: ChatBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = sender === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {avatar && (
          <img 
            src={avatar} 
            alt={sender} 
            className="w-8 h-8 rounded-full mx-2"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className={`relative group p-3 rounded-2xl ${
          isUser 
            ? 'bg-purple-600 text-white rounded-br-none' 
            : 'bg-slate-700 text-gray-100 rounded-bl-none'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          {timestamp && (
            <span className="text-xs opacity-70 mt-1 block">
              {new Date(timestamp).toLocaleTimeString('ar-SA')}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
