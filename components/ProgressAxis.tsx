'use client';

interface Dimension {
  name: string;
  name_incomplete: string;
  status: 'complete' | 'incomplete';
  icon: string;
}

interface ProgressAxisProps {
  dimensions: Dimension[];
  variant?: 'sidebar' | 'top'; // sidebar: 左侧竖排, top: 顶部横排
}

export default function ProgressAxis({ dimensions, variant = 'top' }: ProgressAxisProps) {
  if (!dimensions || dimensions.length === 0) {
    return null;
  }

  // 左侧竖排样式（网页版）
  if (variant === 'sidebar') {
    return (
      <div className="flex flex-col gap-3">
        {dimensions.map((dim, index) => (
          <div key={index} className="flex items-center gap-2 relative">
            {/* 连接线（竖直） */}
            {index < dimensions.length - 1 && (
              <div className="absolute left-[9px] top-[24px] w-[2px] h-[calc(100%+12px)] bg-gray-300 z-0" />
            )}
            {/* 图标 */}
            <div className={`text-lg z-10 flex-shrink-0 ${dim.status === 'complete' ? '' : ''}`}>
              {dim.icon}
            </div>
            {/* 文字（右侧） */}
            <div className={`text-base font-medium leading-tight flex-1 ${dim.status === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              {dim.status === 'complete' ? dim.name : dim.name_incomplete}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 顶部横排样式（手机版）
  return (
    <div className="grid grid-cols-6 gap-2">
      {dimensions.map((dim, index) => (
        <div key={index} className="flex flex-col items-center gap-1 relative">
          {/* 连接线（水平） */}
          {index < dimensions.length - 1 && (
            <div className="absolute left-[55%] top-[10px] w-full h-[1px] bg-gray-300" />
          )}
          {/* 图标 */}
          <div className={`text-base z-10 ${dim.status === 'complete' ? '' : ''}`}>
            {dim.icon}
          </div>
          {/* 文字 */}
          <div className={`text-xs text-center font-medium leading-tight ${dim.status === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            {dim.status === 'complete' ? dim.name : dim.name_incomplete}
          </div>
        </div>
      ))}
    </div>
  );
}
