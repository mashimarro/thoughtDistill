'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Idea } from '@/types';
import { formatTimestamp, truncateText } from '@/lib/utils/format';

export default function OrganizePage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const { apiCall } = await import('@/lib/api-client');
      const response = await apiCall('/api/ideas?status=inbox');
      if (response.ok) {
        const { ideas } = await response.json();
        setIdeas(ideas);
      }
    } catch (error) {
      console.error('加载想法列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('确定要归档这个想法吗？')) return;

    try {
      const { apiCall } = await import('@/lib/api-client');
      const response = await apiCall(`/api/ideas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'archived' }),
      });

      if (response.ok) {
        setIdeas(ideas.filter((idea) => idea.id !== id));
      }
    } catch (error) {
      console.error('归档失败:', error);
      alert('归档失败，请重试');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← 返回首页
          </button>
          <h1 className="text-2xl font-bold">收集箱</h1>
          <div className="w-24"></div>
        </div>

        {ideas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">收集箱是空的</p>
            <button
              onClick={() => router.push('/record')}
              className="btn-primary"
            >
              记录新想法
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {idea.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(idea.created_at)}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {truncateText(idea.content, 150)}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/organize/${idea.id}`)}
                    className="btn-primary"
                  >
                    开始整理
                  </button>
                  <button
                    onClick={() => handleArchive(idea.id)}
                    className="btn-secondary"
                  >
                    归档
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
