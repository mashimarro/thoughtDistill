'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Inbox, BookOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { Idea, Note } from '@/types';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [inboxOpen, setInboxOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [inboxIdeas, setInboxIdeas] = useState<Idea[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [archivedIdeas, setArchivedIdeas] = useState<Idea[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (inboxOpen && inboxIdeas.length === 0) {
      loadInboxIdeas();
    }
  }, [inboxOpen]);

  useEffect(() => {
    if (notebookOpen && notes.length === 0) {
      loadNotes();
    }
  }, [notebookOpen]);

  useEffect(() => {
    if (archivedOpen && archivedIdeas.length === 0 && archivedNotes.length === 0) {
      loadArchived();
    }
  }, [archivedOpen]);

  // 监听数据刷新事件
  useEffect(() => {
    const handleRefresh = () => {
      // 强制重新加载所有数据
      setInboxIdeas([]);
      setNotes([]);
      setArchivedIdeas([]);
      setArchivedNotes([]);
      if (inboxOpen) loadInboxIdeas();
      if (notebookOpen) loadNotes();
      if (archivedOpen) loadArchived();
    };

    window.addEventListener('sidebar-refresh', handleRefresh);
    return () => window.removeEventListener('sidebar-refresh', handleRefresh);
  }, [inboxOpen, notebookOpen, archivedOpen]);

  const loadInboxIdeas = async () => {
    setIsLoading(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      const response = await apiCall('/api/ideas?status=inbox');
      if (response.ok) {
        const { ideas } = await response.json();
        setInboxIdeas(ideas);
      }
    } catch (error) {
      console.error('加载收集箱失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      const response = await apiCall('/api/notes?status=active');
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

  const loadArchived = async () => {
    setIsLoading(true);
    try {
      const { apiCall } = await import('@/lib/api-client');
      
      // 加载归档的想法
      const ideasResponse = await apiCall('/api/ideas?status=archived');
      if (ideasResponse.ok) {
        const { ideas } = await ideasResponse.json();
        setArchivedIdeas(ideas);
      }

      // 加载归档的笔记（通过关联的 idea_id 查询）
      const notesResponse = await apiCall('/api/notes?status=archived');
      if (notesResponse.ok) {
        const { notes } = await notesResponse.json();
        setArchivedNotes(notes);
      }
    } catch (error) {
      console.error('加载归档失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: 'idea' | 'note', id: string) => {
    if (!confirm('确定要删除吗？此操作不可恢复。')) return;

    try {
      const { apiCall } = await import('@/lib/api-client');
      const endpoint = type === 'idea' ? `/api/ideas/${id}` : `/api/notes/${id}`;
      const response = await apiCall(endpoint, { method: 'DELETE' });

      if (response.ok) {
        // 从列表中移除
        if (type === 'idea') {
          setInboxIdeas(inboxIdeas.filter(idea => idea.id !== id));
          setArchivedIdeas(archivedIdeas.filter(idea => idea.id !== id));
        } else {
          setNotes(notes.filter(note => note.id !== id));
          setArchivedNotes(archivedNotes.filter(note => note.id !== id));
        }
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleInboxClick = () => {
    setInboxOpen(!inboxOpen);
    if (!inboxOpen && inboxIdeas.length === 0) {
      loadInboxIdeas();
    }
  };

  const handleNotebookClick = () => {
    setNotebookOpen(!notebookOpen);
    if (!notebookOpen && notes.length === 0) {
      loadNotes();
    }
  };

  const handleArchivedClick = () => {
    setArchivedOpen(!archivedOpen);
    if (!archivedOpen && archivedIdeas.length === 0 && archivedNotes.length === 0) {
      loadArchived();
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo/首页 */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => router.push('/')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === '/' ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
        >
          <Home size={20} />
          <span className="font-semibold">思路梳理</span>
        </button>
      </div>

      {/* 主导航区域 */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* 收集箱 */}
        <div>
          <button
            onClick={handleInboxClick}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Inbox size={18} />
              <span className="font-medium">收集箱</span>
            </div>
            <div className="flex items-center gap-1">
              {inboxIdeas.length > 0 && (
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {inboxIdeas.length}
                </span>
              )}
              {inboxOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          </button>

          {/* 收集箱列表 */}
          {inboxOpen && (
            <div className="ml-4 mt-1 space-y-0.5">
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-gray-500">加载中...</div>
              ) : inboxIdeas.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">暂无想法</div>
              ) : (
                inboxIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="group flex items-center gap-2 hover:bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => router.push(`/organize/${idea.id}`)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                        pathname === `/organize/${idea.id}` ? 'bg-gray-100' : ''
                      }`}
                      title={idea.title}
                    >
                      {idea.title}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete('idea', idea.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 text-red-500 hover:bg-red-50 rounded transition-opacity"
                      title="删除"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 笔记盒 */}
        <div>
          <button
            onClick={handleNotebookClick}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={18} />
              <span className="font-medium">笔记盒</span>
            </div>
            <div className="flex items-center gap-1">
              {notes.length > 0 && (
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {notes.length}
                </span>
              )}
              {notebookOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          </button>

          {/* 笔记盒列表 */}
          {notebookOpen && (
            <div className="ml-4 mt-1 space-y-0.5">
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-gray-500">加载中...</div>
              ) : notes.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">暂无笔记</div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="group flex items-center gap-2 hover:bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => router.push(`/notebook/${note.id}`)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                        pathname === `/notebook/${note.id}` ? 'bg-gray-100' : ''
                      }`}
                      title={note.title}
                    >
                      {note.title}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete('note', note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 text-red-500 hover:bg-red-50 rounded transition-opacity"
                      title="删除"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 归档 */}
        <div>
          <button
            onClick={handleArchivedClick}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📦</span>
              <span className="font-medium">归档</span>
            </div>
            <div className="flex items-center gap-1">
              {(archivedIdeas.length + archivedNotes.length) > 0 && (
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {archivedIdeas.length + archivedNotes.length}
                </span>
              )}
              {archivedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          </button>

          {/* 归档列表 */}
          {archivedOpen && (
            <div className="ml-4 mt-1 space-y-0.5">
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-gray-500">加载中...</div>
              ) : (archivedIdeas.length === 0 && archivedNotes.length === 0) ? (
                <div className="px-3 py-2 text-sm text-gray-400">暂无归档</div>
              ) : (
                <>
                  {archivedIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="group flex items-center gap-2 hover:bg-gray-50 rounded-lg"
                    >
                      <button
                        onClick={() => router.push(`/organize/${idea.id}`)}
                        className="flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors truncate text-gray-500"
                        title={idea.title}
                      >
                        {idea.title}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('idea', idea.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 text-red-500 hover:bg-red-50 rounded transition-opacity"
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {archivedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="group flex items-center gap-2 hover:bg-gray-50 rounded-lg"
                    >
                      <button
                        onClick={() => router.push(`/notebook/${note.id}`)}
                        className="flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors truncate text-gray-500"
                        title={note.title}
                      >
                        {note.title}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('note', note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 text-red-500 hover:bg-red-50 rounded transition-opacity"
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => router.push('/record')}
          className="w-full btn-primary text-center"
        >
          + 记录新想法
        </button>
      </div>
    </aside>
  );
}
