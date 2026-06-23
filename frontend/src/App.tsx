import { useEffect } from 'react';
import { useGraphStore } from './stores/graphStore';
import { MainLayout } from './components/Layout/MainLayout';
import { ToastContainer } from './components/Common/Toast';

export default function App() {
  const { fetchAll, error } = useGraphStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-4 py-2 text-red-300 text-sm">
          加载失败: {error}
          <button
            className="ml-3 underline hover:text-red-200"
            onClick={() => fetchAll()}
          >
            重试
          </button>
        </div>
      )}
      <MainLayout />
      <ToastContainer />
    </div>
  );
}
