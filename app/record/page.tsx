'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import VoiceInput from '@/components/VoiceInput'; // MVP 暂时取消语音功能

export default function RecordPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [savedIdeaId, setSavedIdeaId] = useState('');

  const handleSave = async () => {
    if (!content.trim()) {
      alert('请输入想法内容');
      return;
    }

    setIsLoading(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      const response = await apiCall('/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '保存失败');
      }

      const { idea } = await response.json();
      setSavedIdeaId(idea.id);
      setShowDialog(true);
    } catch (error: any) {
      console.error('保存想法失败:', error);
      alert(error.message || '保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizeNow = () => {
    router.push(`/organize/${savedIdeaId}`);
  };

  const handleOrganizeLater = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← 返回首页
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold mb-4">记录新想法</h1>
          <p className="text-gray-600 mb-6">
            输入你的想法，可以是模糊的、未经整理的思绪
          </p>

          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在这里输入你的想法..."
                className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="text-sm text-gray-500 text-right">
              {content.length} / 5000 字
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading || !content.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : '保存想法'}
            </button>
          </div>
        </div>
      </div>

      {/* 保存成功对话框 */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">想法已保存</h2>
            <p className="text-gray-600 mb-6">
              想法已保存到收集箱。是否立即整理这个想法？
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleOrganizeLater}
                className="flex-1 btn-secondary"
              >
                稍后整理
              </button>
              <button
                onClick={handleOrganizeNow}
                className="flex-1 btn-primary"
              >
                立即整理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
