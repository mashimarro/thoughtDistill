'use client';

interface Dimension {
  name: string;
  name_incomplete: string;
  status: 'complete' | 'incomplete';
  icon: string;
}

interface ProgressAxisProps {
  dimensions: Dimension[];
}

export default function ProgressAxis({ dimensions }: ProgressAxisProps) {
  if (!dimensions || dimensions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 p-6 mb-4 shadow-sm">
      <div className="text-sm font-medium text-gray-600 mb-3">想法梳理进度</div>
      <div className="grid grid-cols-6 gap-2">
        {dimensions.map((dim, index) => (
          <div key={index} className="flex flex-col items-center gap-2 relative">
            {/* 连接线（在图标后面） */}
            {index < dimensions.length - 1 && (
              <div className="absolute left-[55%] top-[14px] w-full h-[2px] bg-gray-300" />
            )}
            {/* 图标 */}
            <div className={`text-2xl z-10 ${dim.status === 'complete' ? '' : ''}`}>
              {dim.icon}
            </div>
            {/* 文字 */}
            <div className={`text-xs text-center font-medium leading-tight ${dim.status === 'complete' ? 'text-green-600' : 'text-orange-600'}`}>
              {dim.status === 'complete' ? dim.name : dim.name_incomplete}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
