
import React from 'react';
import { ViewState } from '../types';

interface NavProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  hasChatBadge?: boolean;
}

const NavigationBar: React.FC<NavProps> = ({ currentView, onViewChange, hasChatBadge }) => {
  const tabs = [
    { id: 'HOME', label: '일상 모임', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
    { id: 'CHATTING', label: '채팅 라운지', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /> },
    { id: 'MY_PAGE', label: '내 프로필', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-nav h-24 flex justify-around items-center px-6 pb-6 z-30">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id as ViewState)}
          className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${
            currentView === tab.id ? 'text-[#2DD4BF] scale-110' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {tab.icon}
            </svg>
            {tab.id === 'CHATTING' && hasChatBadge && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#2DD4BF] rounded-full border border-white shadow-sm animate-pulse"></span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default NavigationBar;
