'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import { generateNoteId } from '@/lib/utils/format';

type Conversation = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export default function Home() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 对话状态
  const [currentIdeaId, setCurrentIdeaId] = useState<string | null>(null);
  const [currentIdeaContent, setCurrentIdeaContent] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = async () => {
    if (!idea.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setIsWaitingForAI(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      // 1. 创建想法
      const response = await apiCall('/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content: idea }),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      const { idea: newIdea } = await response.json();
      setCurrentIdeaId(newIdea.id);
      setCurrentIdeaContent(idea);
      setShowChat(true);
      
      // 2. 调用 AI 镜像反射
      const reflectResponse = await apiCall('/api/ai/reflect', {
        method: 'POST',
        body: JSON.stringify({ content: idea }),
      });

      if (!reflectResponse.ok) {
        throw new Error('AI 反射失败');
      }

      const { reflection } = await reflectResponse.json();

      // 3. 保存 AI 响应
      const saveResponse = await apiCall('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          idea_id: newIdea.id,
          role: 'assistant',
          content: reflection,
        }),
      });

      if (saveResponse.ok) {
        const { conversation } = await saveResponse.json();
        setConversations([conversation]);
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
      setShowChat(false);
    } finally {
      setIsSubmitting(false);
      setIsWaitingForAI(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleUserMessage = async (message: string) => {
    if (!currentIdeaId) return;
    
    // 检测保存意图
    const messageLower = message.toLowerCase();
    const confirmKeywords = ['确认', '好的', '可以', '行', '对', '是的', '没问题'];
    const saveKeywords = ['保存', '沉淀', '生成'];
    const noteKeywords = ['笔记', '卡片'];
    
    const hasConfirm = confirmKeywords.some(keyword => messageLower.includes(keyword));
    const hasSaveKeyword = saveKeywords.some(keyword => messageLower.includes(keyword));
    const hasNoteKeyword = noteKeywords.some(keyword => messageLower.includes(keyword));
    
    // 如果用户明确要保存笔记
    if ((hasSaveKeyword && hasNoteKeyword) || (hasConfirm && conversations.some(c => c.content.includes('可以生成笔记')))) {
      await saveNote(message);
      return;
    }
    
    // 正常对话流程
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      // 保存用户消息
      const userResponse = await apiCall('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          idea_id: currentIdeaId,
          role: 'user',
          content: message,
        }),
      });

      if (userResponse.ok) {
        const { conversation: userConv } = await userResponse.json();
        setConversations(prev => [...prev, userConv]);
        
        setIsWaitingForAI(true);
        
        // 调用 AI 继续对话
        const aiResponse = await apiCall('/api/ai/clarify', {
          method: 'POST',
          body: JSON.stringify({
            conversations: [...conversations, userConv],
            ideaContent: currentIdeaContent,
          }),
        });

        if (aiResponse.ok) {
          const { question, readiness } = await aiResponse.json();
          
          // 保存 AI 响应
          const aiSaveResponse = await apiCall('/api/conversations', {
            method: 'POST',
            body: JSON.stringify({
              idea_id: currentIdeaId,
              role: 'assistant',
              content: question,
            }),
          });

          if (aiSaveResponse.ok) {
            const { conversation: aiConv } = await aiSaveResponse.json();
            setConversations(prev => [...prev, aiConv]);
            
            // 如果 AI 判断可以生成笔记了，提示用户
            if (readiness && readiness.ready === true) {
              // AI 已经在 question 中提示用户了
            }
          }
        }
      }
    } catch (error) {
      console.error('对话失败:', error);
      alert('AI 服务出错，请稍后重试');
    } finally {
      setIsWaitingForAI(false);
    }
  };

  const saveNote = async (finalMessage?: string) => {
    if (!currentIdeaId) return;
    
    setIsWaitingForAI(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      // 如果有最后一条消息，先保存
      let allConversations = [...conversations];
      if (finalMessage) {
        const userResponse = await apiCall('/api/conversations', {
          method: 'POST',
          body: JSON.stringify({
            idea_id: currentIdeaId,
            role: 'user',
            content: finalMessage,
          }),
        });
        
        if (userResponse.ok) {
          const { conversation: userConv } = await userResponse.json();
          allConversations = [...allConversations, userConv];
          setConversations(allConversations);
        }
      }
      
      // 生成笔记
      const synthesizeResponse = await apiCall('/api/ai/synthesize', {
        method: 'POST',
        body: JSON.stringify({
          idea_id: currentIdeaId,
          conversations: allConversations,
        }),
      });

      if (!synthesizeResponse.ok) {
        throw new Error('生成笔记失败');
      }

      const { note } = await synthesizeResponse.json();
      const noteId = generateNoteId(note.title);
      
      // 保存笔记
      const saveResponse = await apiCall('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          id: noteId,
          idea_id: currentIdeaId,
          ...note,
          related_notes: [],
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('保存笔记失败');
      }

      const { note: savedNote } = await saveResponse.json();
      
      // 更新想法状态
      await apiCall(`/api/ideas/${currentIdeaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      
      alert('✅ 笔记已保存！');
      router.push(`/notebook/${savedNote.id}`);
    } catch (error) {
      console.error('保存笔记失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsWaitingForAI(false);
    }
  };

  if (showChat) {
    // 对话模式
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-4">
          {/* 顶部信息栏 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="font-semibold mb-2">原始想法</h3>
            <p className="text-sm text-gray-600">{currentIdeaContent}</p>
          </div>

          {/* 对话区域 */}
          <ChatInterface
            conversations={conversations}
            onSendMessage={handleUserMessage}
            isLoading={isWaitingForAI}
          />
        </div>
      </div>
    );
  }

  // 初始输入模式
  return (
    <main className="h-full flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Slogan */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            每个灵光一闪，都值得认真记录
          </h1>
        </div>

        {/* 输入框 */}
        <div className="relative">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的想法，可以是模糊的、未经整理的思绪，AI会通过提问帮你梳理清楚"
            className="w-full min-h-[200px] px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {idea.length > 0 && `${idea.length} 字`}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!idea.trim() || isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                idea.trim() && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '提交中...' : '开始整理'}
            </button>
          </div>
        </div>

        {/* 提示文字 */}
        <p className="text-center text-sm text-gray-500">
          按 Enter 提交，Shift + Enter 换行
        </p>
      </div>
    </main>
  );
}
