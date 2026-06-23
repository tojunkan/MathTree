import { useGraphStore } from '../../stores/graphStore';

export function ToastContainer() {
  const { toasts, removeToast } = useGraphStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg text-sm max-w-sm ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-700'
              : toast.type === 'error'
              ? 'bg-red-900/90 text-red-200 border border-red-700'
              : 'bg-blue-900/90 text-blue-200 border border-blue-700'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
