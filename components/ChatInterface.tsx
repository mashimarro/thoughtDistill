'use client';

import { useState, useRef, useEffect } from 'react';
import { Conversation } from '@/types';
import { formatTimestamp } from '@/lib/utils/format';
import ProgressAxis from './ProgressAxis';
// import VoiceInput from './VoiceInput'; // MVP 暂时取消语音功能
import { Send } from 'lucide-react';

interface ChatInterfaceProps {
  conversations: Conversation[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  progress?: {
    dimensions: Array<{
      name: string;
      name_incomplete: string;
      status: 'complete' | 'incomplete';
      icon: string;
    }>;
  } | null;
}

export default function ChatInterface({
  conversations,
  onSendMessage,
  isLoading = false,
  progress,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row h-[calc(100vh-200px)]">
      {/* 进度轴 - 网页版左侧竖排，手机版顶部横排 */}
      {progress && progress.dimensions && progress.dimensions.length > 0 && (
        <>
          {/* 手机版：顶部横排 */}
          <div className="md:hidden p-3 border-b border-gray-200">
            <ProgressAxis dimensions={progress.dimensions} variant="top" />
          </div>
          {/* 网页版：左侧竖排 */}
          <div className="hidden md:block p-3 border-r border-gray-200 w-32">
            <ProgressAxis dimensions={progress.dimensions} variant="sidebar" />
          </div>
        </>
      )}
      
      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversations.map((conv, index) => (
          <div
            key={conv.id || index}
            className={`flex ${conv.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                conv.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{conv.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的回答... (Enter 发送，Shift+Enter 换行)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            发送
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          提示：按 Enter 发送，Shift+Enter 换行
        </p>
      </div>
      </div>
    </div>
  );
}
