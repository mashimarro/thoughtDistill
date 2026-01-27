'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NoteSynthesisResponse } from '@/types';
import { generateNoteId } from '@/lib/utils/format';

export default function CreateNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [noteData, setNoteData] = useState<NoteSynthesisResponse | null>(null);
  const [ideaId, setIdeaId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState<NoteSynthesisResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const noteDataStr = searchParams.get('noteData');
    const ideaIdParam = searchParams.get('ideaId');

    if (noteDataStr && ideaIdParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(noteDataStr));
        setNoteData(parsed);
        setEditedNote(parsed);
        setIdeaId(ideaIdParam);
      } catch (error) {
        console.error('解析笔记数据失败:', error);
        router.push('/organize');
      }
    } else {
      router.push('/organize');
    }
  }, [searchParams, router]);

  const handleSave = async () => {
    if (!editedNote) return;

    setIsSaving(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      const noteId = generateNoteId(editedNote.title);

      const response = await apiCall('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          id: noteId,
          idea_id: ideaId,
          ...editedNote,
          related_notes: [],
        }),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      alert('笔记已保存到笔记盒！');
      router.push('/notebook');
    } catch (error) {
      console.error('保存笔记失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    router.push(`/organize/${ideaId}`);
  };

  if (!noteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">笔记预览</h1>
          <p className="text-gray-600">
            确认笔记内容是否准确反映了你的想法，可以编辑后保存
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">标题</label>
                <input
                  type="text"
                  value={editedNote?.title || ''}
                  onChange={(e) =>
                    setEditedNote({ ...editedNote!, title: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">核心内容</label>
                <textarea
                  value={editedNote?.core_content || ''}
                  onChange={(e) =>
                    setEditedNote({ ...editedNote!, core_content: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">为什么重要</label>
                <textarea
                  value={editedNote?.importance || ''}
                  onChange={(e) =>
                    setEditedNote({ ...editedNote!, importance: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 btn-secondary"
                >
                  取消编辑
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 btn-primary"
                >
                  完成编辑
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">{editedNote?.title}</h2>

              <h3 className="text-lg font-semibold mt-6 mb-2">核心内容</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{editedNote?.core_content}</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">支撑理由/依据</h3>
              <ul className="list-disc pl-6 space-y-1">
                {editedNote?.supporting_reasons.map((reason, idx) => (
                  <li key={idx} className="text-gray-700">{reason}</li>
                ))}
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">为什么重要</h3>
              <p className="text-gray-700">{editedNote?.importance}</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">应用场景</h3>
              <p className="text-gray-700">{editedNote?.applications}</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">来源/触发</h3>
              <p className="text-gray-700">{editedNote?.source}</p>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {editedNote?.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleContinue}
            className="flex-1 btn-secondary"
          >
            继续补充
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 btn-secondary"
            disabled={isEditing}
          >
            编辑笔记
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-primary"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '确认保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
