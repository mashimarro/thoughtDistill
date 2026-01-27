import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/admin
 * 获取管理后台数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'overview';

    if (tab === 'overview') {
      // 获取统计数据
      const [usersResult, ideasResult, notesResult, usageResult] = await Promise.all([
        supabaseAdmin.from('ideas').select('user_id', { count: 'exact', head: true }),
        supabaseAdmin.from('ideas').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('notes').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('user_usage').select('count').eq('date', new Date().toISOString().split('T')[0]),
      ]);

      // 获取唯一用户数
      const { data: uniqueUsers } = await supabaseAdmin
        .from('ideas')
        .select('user_id')
        .limit(1000);
      
      const uniqueUserIds = new Set(uniqueUsers?.map(u => u.user_id) || []);
      
      // 计算今日使用量
      const todayUsage = usageResult.data?.reduce((sum, u) => sum + (u.count || 0), 0) || 0;

      return NextResponse.json({
        stats: {
          total_users: uniqueUserIds.size,
          total_ideas: ideasResult.count || 0,
          total_notes: notesResult.count || 0,
          today_usage: todayUsage,
        },
      });
    }

    if (tab === 'users') {
      // 获取所有用户及其统计
      const { data: ideas } = await supabaseAdmin
        .from('ideas')
        .select('user_id, created_at')
        .order('created_at', { ascending: false });

      const { data: notes } = await supabaseAdmin
        .from('notes')
        .select('user_id');

      // 按用户分组统计
      const userMap = new Map<string, { 
        id: string; 
        created_at: string; 
        ideas_count: number; 
        notes_count: number;
        is_anonymous: boolean;
        email: string | null;
      }>();

      ideas?.forEach(idea => {
        if (!userMap.has(idea.user_id)) {
          userMap.set(idea.user_id, {
            id: idea.user_id,
            created_at: idea.created_at,
            ideas_count: 0,
            notes_count: 0,
            is_anonymous: true,
            email: null,
          });
        }
        userMap.get(idea.user_id)!.ideas_count++;
      });

      notes?.forEach(note => {
        if (userMap.has(note.user_id)) {
          userMap.get(note.user_id)!.notes_count++;
        }
      });

      const users = Array.from(userMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return NextResponse.json({ users });
    }

    if (tab === 'ideas') {
      const { data: ideas, error } = await supabaseAdmin
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('获取想法失败:', error);
        return NextResponse.json({ error: '获取失败' }, { status: 500 });
      }

      return NextResponse.json({ ideas });
    }

    if (tab === 'notes') {
      const { data: notes, error } = await supabaseAdmin
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('获取笔记失败:', error);
        return NextResponse.json({ error: '获取失败' }, { status: 500 });
      }

      return NextResponse.json({ notes });
    }

    return NextResponse.json({ error: '无效的 tab 参数' }, { status: 400 });
  } catch (error) {
    console.error('管理后台异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
