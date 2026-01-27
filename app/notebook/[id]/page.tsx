'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Note } from '@/types';
import { formatTimestamp } from '@/lib/utils/format';
import { formatNoteAsMarkdown } from '@/lib/utils/markdown';
import { copyToClipboard, downloadMarkdown } from '@/lib/utils/download';
import { Download, Copy, Edit, Archive } from 'lucide-react';

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    loadNote();
  }, [noteId]);

  const loadNote = async () => {
    try {
      const { apiCall } = await import('@/lib/api-client');
      const response = await apiCall(`/api/notes/${noteId}`);
      if (response.ok) {
        const { note } = await response.json();
        setNote(note);
        setEditedContent(note.core_content);
      } else {
        router.push('/notebook');
      }
    } catch (error) {
      console.error('加载笔记失败:', error);
      router.push('/notebook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!note) return;
    const markdown = formatNoteAsMarkdown(note);
    const success = await copyToClipboard(markdown);
    if (success) {
      alert('已复制到剪贴板');
    } else {
      alert('复制失败');
    }
  };

  const handleDownload = () => {
    if (!note) return;
    const markdown = formatNoteAsMarkdown(note);
    downloadMarkdown(markdown, note.id);
  };

  const handleSaveEdit = async () => {
    if (!note) return;

    try {
      const { apiCall } = await import('@/lib/api-client');
      const response = await apiCall(`/api/notes/${noteId}`, {
        method: 'PATCH',
        body: JSON.stringify({ core_content: editedContent }),
      });

      if (response.ok) {
        const { note: updatedNote } = await response.json();
        setNote(updatedNote);
        setIsEditing(false);
        alert('保存成功');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleArchive = async () => {
    if (!note || !confirm('确定要归档这个笔记吗？')) return;

    try {
      const { apiCall } = await import('@/lib/api-client');
      
      // 将关联的想法归档
      if (note.idea_id) {
        await apiCall(`/api/ideas/${note.idea_id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'archived' }),
        });
      }

      // 触发 Sidebar 刷新
      window.dispatchEvent(new Event('sidebar-refresh'));

      alert('已归档');
      router.push('/notebook');
    } catch (error) {
      console.error('归档失败:', error);
      alert('归档失败，请重试');
    }
  };

  const handleContinueOrganize = () => {
    if (note && note.idea_id) {
      router.push(`/organize/${note.idea_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/notebook')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 返回笔记盒
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="复制"
            >
              <Copy size={20} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="下载"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="编辑"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={handleArchive}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="归档"
            >
              <Archive size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold mb-4">{note.title}</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-3">核心内容</h2>
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                rows={8}
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{note.core_content}</p>
            )}

            <h2 className="text-xl font-semibold mt-6 mb-3">支撑理由/依据</h2>
            <ul className="list-disc pl-6 space-y-2">
              {note.supporting_reasons.map((reason, idx) => (
                <li key={idx} className="text-gray-700">{reason}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">为什么重要</h2>
            <p className="text-gray-700">{note.importance}</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">应用场景</h2>
            <p className="text-gray-700">{note.applications}</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">来源/触发</h2>
            <p className="text-gray-700">{note.source}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>创建时间：{formatTimestamp(note.created_at)}</p>
            <p>最后更新：{formatTimestamp(note.updated_at)}</p>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedContent(note.core_content);
              }}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSaveEdit} className="flex-1 btn-primary">
              保存修改
            </button>
          </div>
        )}

        {note.idea_id && !isEditing && (
          <div className="mt-6">
            <button
              onClick={handleContinueOrganize}
              className="w-full btn-secondary"
            >
              继续整理这个想法
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
