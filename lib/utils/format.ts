import { format as dateFnsFormat } from 'date-fns';

/**
 * 生成笔记 ID
 * 格式: YYYYMMDD-HHMM-关键词
 */
export function generateNoteId(keyword: string): string {
  const now = new Date();
  const dateStr = dateFnsFormat(now, 'yyyyMMdd-HHmm');
  const cleanKeyword = keyword.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').slice(0, 20);
  return `${dateStr}-${cleanKeyword}`;
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(d, 'yyyy-MM-dd HH:mm');
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(d, 'yyyy-MM-dd');
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 生成想法标题（提取前20字作为临时标题）
 */
export function generateTempTitle(content: string): string {
  return truncateText(content.replace(/\s+/g, ' ').trim(), 20);
}
