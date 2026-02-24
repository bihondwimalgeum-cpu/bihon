
import React from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, onBack }) => {
  const isMainTitle = title === '비혼뒤맑음';

  return (
    <header className={`${isMainTitle ? 'h-24' : 'h-20'} flex items-center justify-between px-6 bg-white sticky top-0 z-20 border-b border-slate-100 transition-all`}>
      <div className="flex items-center gap-4">
        {showBack && (
          <button onClick={onBack} className="text-slate-700 p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        <div className="flex flex-col">
          {isMainTitle && (
            <p className="text-[10px] text-slate-400 font-medium mb-1 tracking-tight">
              비혼 뒤, 맑은 삶을 꿈꾸다.
            </p>
          )}
          <h1 className={`${isMainTitle ? 'text-xl' : 'text-lg'} font-bold text-slate-800 tracking-tight leading-none`}>
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
