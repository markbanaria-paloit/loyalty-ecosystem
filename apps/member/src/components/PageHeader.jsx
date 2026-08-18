import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, back = true, right = null }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-30 border-b border-black/5 bg-white/90 px-4 pb-3 pt-4 backdrop-blur-lg">
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 -ml-1.5 shrink-0 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="truncate text-xs text-gray-400">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}
