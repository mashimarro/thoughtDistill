/**
 * 检测文本中是否包含模糊表述
 */
export function hasAmbiguousTerms(text: string): boolean {
  const ambiguousWords = [
    '可能', '也许', '大概', '应该', '似乎', '好像',
    '感觉', '估计', '大致', '差不多', '或许',
  ];
  
  return ambiguousWords.some((word) => text.includes(word));
}

/**
 * 检测是否添加了用户未说过的观点
 * 简单实现：检查 AI 回复中是否有明确的新结论
 */
export function containsNewClaims(aiResponse: string, userMessages: string[]): boolean {
  // 检测明确的断言句式
  const assertionPatterns = [
    /因此.*是/,
    /所以.*应该/,
    /这说明/,
    /可以看出/,
    /证明了/,
  ];
  
  // 如果 AI 回复包含断言，检查是否在用户消息中出现过类似表述
  const hasAssertion = assertionPatterns.some((pattern) => pattern.test(aiResponse));
  
  if (!hasAssertion) return false;
  
  // 简化判断：如果用户消息很短，AI 回复很长，可能添加了新内容
  const userContentLength = userMessages.join('').length;
  const aiContentLength = aiResponse.length;
  
  return aiContentLength > userContentLength * 1.5;
}

/**
 * 提取引用片段
 */
export function extractQuotes(text: string): string[] {
  const quotes: string[] = [];
  
  // 提取引号中的内容
  const quotedMatches = text.match(/"([^"]+)"|「([^」]+)」|『([^』]+)』/g);
  if (quotedMatches) {
    quotes.push(...quotedMatches.map((m) => m.replace(/["「」『』]/g, '')));
  }
  
  return quotes;
}

/**
 * 验证 JSON 格式的 AI 响应
 */
export function validateJSONResponse<T>(response: string): T | null {
  try {
    // 尝试提取 JSON（可能被包裹在 markdown 代码块中）
    const jsonMatch = response.match(/```json\n([\s\S]+?)\n```/) || response.match(/\{[\s\S]+\}/);
    if (!jsonMatch) return null;
    
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error('JSON 解析失败:', error);
    return null;
  }
}
