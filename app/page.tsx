'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 调试：监控 idea 状态
  console.log('idea:', idea, 'trimmed:', idea.trim(), 'length:', idea.length);

  const handleSubmit = async () => {
    if (!idea.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      const response = await apiCall('/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content: idea }),
      });

      if (response.ok) {
        const { idea: newIdea } = await response.json();
        router.push(`/organize/${newIdea.id}`);
      } else {
        alert('保存失败，请重试');
      }
    } catch (error) {
      console.error('提交想法失败:', error);
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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
