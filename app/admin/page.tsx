'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string | null;
  created_at: string;
  is_anonymous: boolean;
  ideas_count: number;
  notes_count: number;
}

interface Idea {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

interface Note {
  id: string;
  user_id: string;
  title: string;
  core_content: string;
  created_at: string;
}

interface Stats {
  total_users: number;
  total_ideas: number;
  total_notes: number;
  today_usage: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'ideas' | 'notes'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 简单的密码验证（生产环境应使用更安全的方式）
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 密码在环境变量中配置，默认为 admin123
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123')) {
      setIsAuthenticated(true);
      setError('');
      loadData('overview');
    } else {
      setError('密码错误');
    }
  };

  const loadData = async (tab: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin?tab=${tab}`);
      if (!response.ok) {
        throw new Error('加载失败');
      }
      const data = await response.json();
      
      if (tab === 'overview') {
        setStats(data.stats);
      } else if (tab === 'users') {
        setUsers(data.users);
      } else if (tab === 'ideas') {
        setIdeas(data.ideas);
      } else if (tab === 'notes') {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'overview' | 'users' | 'ideas' | 'notes') => {
    setActiveTab(tab);
    loadData(tab);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">管理后台</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入管理密码"
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">管理后台</h1>
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            返回首页
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: 'overview', label: '总览' },
            { key: 'users', label: '用户' },
            { key: 'ideas', label: '想法' },
            { key: 'notes', label: '笔记' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="总用户数" value={stats.total_users} />
                <StatCard title="总想法数" value={stats.total_ideas} />
                <StatCard title="总笔记数" value={stats.total_notes} />
                <StatCard title="今日调用次数" value={stats.today_usage} />
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户 ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">邮箱</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">想法数</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">笔记数</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          {user.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.is_anonymous 
                              ? 'bg-gray-100 text-gray-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {user.is_anonymous ? '匿名' : '注册'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.ideas_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.notes_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-500">暂无用户</div>
                )}
              </div>
            )}

            {/* Ideas Tab */}
            {activeTab === 'ideas' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">内容</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ideas.map((idea) => (
                      <tr key={idea.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                          {idea.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                          {idea.content}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={idea.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          {idea.user_id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(idea.created_at).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ideas.length === 0 && (
                  <div className="text-center py-12 text-gray-500">暂无想法</div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">核心内容</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notes.map((note) => (
                      <tr key={note.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                          {note.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                          {note.core_content}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          {note.user_id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(note.created_at).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {notes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">暂无笔记</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    inbox: 'bg-yellow-100 text-yellow-800',
    notebook: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  
  const labels: Record<string, string> = {
    inbox: '收集箱',
    notebook: '笔记盒',
    archived: '已归档',
    completed: '已完成',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}
