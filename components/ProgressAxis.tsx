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
      <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg border border-gray-200 p-3 shadow-sm">
        <div className="text-xs font-medium text-gray-600 mb-2 text-center">梳理进度</div>
        <div className="flex flex-col gap-3">
          {dimensions.map((dim, index) => (
            <div key={index} className="flex flex-col items-center gap-1 relative">
              {/* 连接线（竖直） */}
              {index < dimensions.length - 1 && (
                <div className="absolute left-1/2 top-[20px] w-[2px] h-[calc(100%+12px)] bg-gray-300 -translate-x-1/2 z-0" />
              )}
              {/* 图标 */}
              <div className={`text-lg z-10 ${dim.status === 'complete' ? '' : ''}`}>
                {dim.icon}
              </div>
              {/* 文字 */}
              <div className={`text-[10px] text-center font-medium leading-tight ${dim.status === 'complete' ? 'text-green-600' : 'text-orange-600'}`}>
                {dim.status === 'complete' ? dim.name : dim.name_incomplete}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 顶部横排样式（手机版）
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="text-xs font-medium text-gray-600 mb-2">梳理进度</div>
      <div className="grid grid-cols-6 gap-1">
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
            <div className={`text-[9px] text-center font-medium leading-tight ${dim.status === 'complete' ? 'text-green-600' : 'text-orange-600'}`}>
              {dim.status === 'complete' ? dim.name : dim.name_incomplete}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
