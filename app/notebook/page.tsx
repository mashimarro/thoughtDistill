'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Note } from '@/types';
import { formatTimestamp, truncateText } from '@/lib/utils/format';
import { Grid, List } from 'lucide-react';

export default function NotebookPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'masonry' | 'list'>('masonry');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { apiCall } = await import('@/lib/api-client');
      const response = await apiCall('/api/notes');
      if (response.ok) {
        const { notes } = await response.json();
        setNotes(notes);
      }
    } catch (error) {
      console.error('加载笔记失败:', error);
    } finally {
      setIsLoading(false);
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← 返回首页
          </button>
          <h1 className="text-2xl font-bold">笔记盒</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded ${viewMode === 'masonry' ? 'bg-primary text-white' : 'bg-gray-200'}`}
              title="瀑布流布局"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200'}`}
              title="列表布局"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">还没有笔记</p>
            <button
              onClick={() => router.push('/record')}
              className="btn-primary"
            >
              记录第一个想法
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notebook/${note.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {note.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(note.updated_at)}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">
                  {truncateText(note.core_content, 200)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notebook/${note.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 break-inside-avoid hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {note.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {truncateText(note.core_content, 150)}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-400">
                  {formatTimestamp(note.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
