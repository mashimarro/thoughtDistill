'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Idea, Conversation } from '@/types';
import ChatInterface from '@/components/ChatInterface';
import { generateNoteId } from '@/lib/utils/format';

export default function OrganizeIdeaPage() {
  const router = useRouter();
  const params = useParams();
  const ideaId = params.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stage, setStage] = useState<'loading' | 'reflect' | 'clarify' | 'ready'>('loading');
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [pendingNote, setPendingNote] = useState<any>(null);

  useEffect(() => {
    loadIdea();
  }, [ideaId]);

  const loadIdea = async () => {
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      // 加载想法
      const ideaResponse = await apiCall(`/api/ideas/${ideaId}`);
      if (!ideaResponse.ok) {
        throw new Error('想法不存在');
      }
      const { idea } = await ideaResponse.json();
      setIdea(idea);

      // 加载对话历史
      const convResponse = await apiCall(`/api/conversations?idea_id=${ideaId}`);
      if (convResponse.ok) {
        const { conversations } = await convResponse.json();
        setConversations(conversations);

        if (conversations.length === 0) {
          // 第一次整理，启动镜像反射
          setStage('reflect');
          await startReflection(idea);
        } else {
          // 继续整理
          setStage('clarify');
        }
      }
    } catch (error) {
      console.error('加载失败:', error);
      alert('加载失败，请返回重试');
      router.push('/organize');
    } finally {
      setIsLoading(false);
    }
  };

  const startReflection = async (idea: Idea) => {
    setIsWaitingForAI(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      const response = await apiCall('/api/ai/reflect', {
        method: 'POST',
        body: JSON.stringify({ content: idea.content }),
      });

      if (!response.ok) {
        throw new Error('AI 反射失败');
      }

      const { reflection } = await response.json();

      // 保存 AI 响应
      const saveResponse = await apiCall('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          idea_id: ideaId,
          role: 'assistant',
          content: reflection,
        }),
      });

      if (saveResponse.ok) {
        const { conversation } = await saveResponse.json();
        setConversations([conversation]);
        setStage('clarify');
      }
    } catch (error) {
      console.error('镜像反射失败:', error);
      alert('AI 服务出错，请稍后重试');
    } finally {
      setIsWaitingForAI(false);
    }
  };

  const handleUserMessage = async (message: string) => {
    if (!idea) return;
    
    // 保存用户消息
    const userConv = await saveConversation('user', message);
    if (!userConv) return;

    setConversations((prev) => [...prev, userConv]);
    setIsWaitingForAI(true);

    // 调用 AI 进行苏格拉底提问，让 AI 通过语义判断用户意图
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      const response = await apiCall('/api/ai/clarify', {
        method: 'POST',
        body: JSON.stringify({ 
          conversations: [...conversations, userConv],
          ideaContent: idea.content,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 提问失败');
      }

      const { question, readiness } = await response.json();

      // 保存 AI 响应
      const aiConv = await saveConversation('assistant', question);
      if (aiConv) {
        setConversations((prev) => [...prev, aiConv]);
      }

      // 当 AI 判断用户想要保存笔记时（ready_for_note: true），直接生成并保存
      if (readiness && readiness.ready === true) {
        setStage('ready');
        // 直接生成并保存笔记，不需要用户再次确认
        await generateAndSaveNote([...conversations, userConv, aiConv]);
      }
    } catch (error) {
      console.error('AI 提问失败:', error);
      alert('AI 服务出错，请稍后重试');
    } finally {
      setIsWaitingForAI(false);
    }
  };

  // 自动生成笔记并显示在对话中
  const generateAndSaveNote = async (allConversations: Conversation[]) => {
    setIsWaitingForAI(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      // 调用 AI 生成笔记
      const response = await apiCall('/api/ai/synthesize', {
        method: 'POST',
        body: JSON.stringify({
          idea_id: ideaId,
          conversations: allConversations,
        }),
      });

      if (!response.ok) {
        throw new Error('生成笔记失败');
      }

      const { note } = await response.json();
      
      // 生成笔记 ID
      const noteId = generateNoteId(note.title);
      
      // 直接保存笔记
      const saveResponse = await apiCall('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          id: noteId,
          idea_id: ideaId,
          ...note,
          related_notes: [],
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('保存笔记失败');
      }

      const { note: savedNote } = await saveResponse.json();
      
      // 更新想法状态为已完成
      await apiCall(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      
      // 显示成功提示
      alert('✅ 笔记已保存！');
      
      // 跳转到笔记详情页
      router.push(`/notebook/${savedNote.id}`);
    } catch (error) {
      console.error('生成并保存笔记失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsWaitingForAI(false);
    }
  };

  const autoSynthesizeNote = async (allConversations: Conversation[]) => {
    try {
      setIsWaitingForAI(true);
      const { apiCall } = await import('@/lib/api-client');
      
      const response = await apiCall('/api/ai/synthesize', {
        method: 'POST',
        body: JSON.stringify({ conversations: allConversations }),
      });

      if (!response.ok) {
        throw new Error('生成笔记失败');
      }

      const { note } = await response.json();
      
      // 将笔记内容格式化并显示在对话中
      const notePreview = `📝 **笔记草稿已生成**\n\n**标题**: ${note.title}\n\n**核心内容**: ${note.core_content}\n\n**支撑理由**:\n${note.supporting_reasons?.map((r: string) => `• ${r}`).join('\n') || '无'}\n\n**为什么重要**: ${note.importance}\n\n**应用场景**: ${note.applications}\n\n---\n如果满意，请确认保存；如需修改，请告诉我。`;
      
      const noteConv = await saveConversation('assistant', notePreview);
      if (noteConv) {
        setConversations((prev) => [...prev, noteConv]);
      }
      
      // 保存笔记数据到 state，供后续保存使用
      setPendingNote(note);
    } catch (error) {
      console.error('生成笔记失败:', error);
      const errorConv = await saveConversation('assistant', '抱歉，生成笔记失败，请重试。');
      if (errorConv) {
        setConversations((prev) => [...prev, errorConv]);
      }
    } finally {
      setIsWaitingForAI(false);
    }
  };

  const saveConversation = async (role: string, content: string) => {
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      const response = await apiCall('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          idea_id: ideaId,
          role,
          content,
        }),
      });

      if (response.ok) {
        const { conversation } = await response.json();
        return conversation;
      }
    } catch (error) {
      console.error('保存对话失败:', error);
    }
    return null;
  };

  const handleSaveProgress = () => {
    alert('对话已自动保存，可以随时回来继续整理');
    router.push('/organize');
  };

  const handleSaveNote = async () => {
    if (!pendingNote) return;
    
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      // 生成笔记 ID
      const noteId = generateNoteId(pendingNote.title);
      
      // 直接保存笔记
      const response = await apiCall('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          id: noteId,
          idea_id: ideaId,
          ...pendingNote,
          related_notes: [],
        }),
      });

      if (!response.ok) {
        throw new Error('保存笔记失败');
      }

      const { note } = await response.json();
      
      // 更新想法状态为已完成
      await apiCall(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      
      alert('笔记已保存！');
      router.push(`/notebook/${note.id}`);
    } catch (error) {
      console.error('保存笔记失败:', error);
      alert('保存笔记失败，请重试');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/organize')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 返回列表
          </button>
          <button
            onClick={handleSaveProgress}
            className="btn-secondary"
          >
            暂时保存
          </button>
        </div>

        {/* 对话区域 */}
        <div className="max-w-4xl mx-auto">
          <ChatInterface
            conversations={conversations}
            onSendMessage={handleUserMessage}
            isLoading={isWaitingForAI}
          />
        </div>
      </div>
    </div>
  );
}
