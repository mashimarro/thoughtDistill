'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleRecordClick = () => {
    console.log('记录新想法按钮被点击');
    router.push('/record');
  };

  const handleOrganizeClick = () => {
    console.log('整理已有想法按钮被点击');
    router.push('/organize');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">思路梳理</h1>
          <p className="text-lg text-gray-600">
            AI 辅助你梳理模糊的想法，沉淀为清晰的卡片笔记
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={handleRecordClick}
            className="p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
          >
            <div className="text-4xl mb-4">🆕</div>
            <h2 className="text-xl font-semibold mb-2">记录新想法</h2>
            <p className="text-gray-600">快速记录你的灵感和想法</p>
          </button>

          <button
            onClick={handleOrganizeClick}
            className="p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
          >
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">整理已有想法</h2>
            <p className="text-gray-600">通过 AI 对话深化你的思考</p>
          </button>
        </div>

      </div>
    </main>
  );
}
