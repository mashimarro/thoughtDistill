import { Note } from '@/types';
import { formatTimestamp } from './format';

/**
 * 将笔记对象转换为 Markdown 格式
 */
export function formatNoteAsMarkdown(note: Note): string {
  const relatedNotes = note.related_notes
    .map((rn) => `- [[${rn.id}]] - ${rn.relationship}`)
    .join('\n');

  return `---
id: ${note.id}
created: ${formatTimestamp(note.created_at)}
tags: [${note.tags.join(', ')}]
---

# ${note.title}

## 核心内容

${note.core_content}

## 支撑理由/依据

${note.supporting_reasons.map((r) => `- ${r}`).join('\n')}

## 为什么重要

${note.importance}

## 应用场景

${note.applications}

${relatedNotes ? `## 关联卡片\n\n${relatedNotes}\n` : ''}
## 来源/触发

${note.source}

---

*最后更新：${formatTimestamp(note.updated_at)}*
`;
}

/**
 * 高亮文本中的引用部分
 */
export function highlightQuotes(text: string, quotes: string[]): string {
  let result = text;
  quotes.forEach((quote) => {
    const regex = new RegExp(quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, `**${quote}**`);
  });
  return result;
}
