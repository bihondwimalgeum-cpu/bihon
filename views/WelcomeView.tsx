
import React from 'react';
import AppLogo from '../components/AppLogo';

interface WelcomeViewProps {
  onFinish: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onFinish }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-12 min-h-[60vh]">
      <div className="relative">
         <div className="absolute inset-0 bg-teal-400 rounded-full blur-[60px] opacity-20 animate-pulse"></div>
         <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border border-teal-50 p-6">
            <AppLogo size={80} animate />
         </div>
         <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-3 rounded-full shadow-lg animate-bounce">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
           </svg>
         </div>
      </div>

      <div className="flex flex-col gap-4 px-4">
        <h2 className="serif-font text-3xl font-bold text-slate-800">환영합니다!</h2>
        <p className="text-slate-500 text-sm font-light leading-relaxed">
          인증이 성공적으로 완료되었습니다.<br/>
          <span className="font-bold text-teal-600">성숙하고 깨끗한 비혼 커뮤니티</span>에서<br/>
          당신과 닮은 삶의 태도를 가진 친구들을 만나보세요.
        </p>
      </div>

      <button
        onClick={onFinish}
        className="w-full max-w-[240px] bg-teal-500 hover:bg-teal-600 text-white font-bold py-5 rounded-[28px] transition-all shadow-xl shadow-teal-500/20 active:scale-95 text-sm tracking-widest"
      >
        커뮤니티 입장하기
      </button>
      
      <p className="text-[10px] text-slate-300 font-medium uppercase tracking-[0.2em]">Safety & Maturity First</p>
    </div>
  );
};

export default WelcomeView;
