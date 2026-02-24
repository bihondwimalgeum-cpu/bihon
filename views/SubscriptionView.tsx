
import React, { useState } from 'react';

interface SubscriptionViewProps {
  onComplete: () => Promise<void>;
  onBack: () => void;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onComplete, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'INFO' | 'SUCCESS'>('INFO');

  const handlePayment = () => {
    setIsProcessing(true);
    // 실제 결제 시뮬레이션 (2초 후 완료)
    setTimeout(() => {
      setIsProcessing(false);
      setStep('SUCCESS');
      setTimeout(onComplete, 1500);
    }, 2000);
  };

  if (step === 'SUCCESS') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-8 page-enter min-h-[60vh]">
        <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-teal-500/20 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">구독이 완료되었습니다!</h2>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            이제 '비혼뒤맑음'의 모든 모임을 <br/> 무제한으로 즐기실 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-6 pt-10 pb-40 page-enter">
      <header className="text-center flex flex-col gap-3">
        <span className="text-[11px] font-black text-teal-500 uppercase tracking-[0.2em]">Unlimited Pass</span>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
          건강한 연결을 위한 <br/> <span className="text-teal-500">맑은 삶 패스</span>
        </h2>
        <p className="text-xs text-slate-400 font-light leading-relaxed px-4">
          매너 있는 멤버들과의 즐거운 일상, <br/> 월 9,900원으로 무제한 참여하세요.
        </p>
      </header>

      {/* Benefits Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 card-shadow p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-700">무제한 모임 참여</span>
            <p className="text-[11px] text-slate-400">횟수 제한 없이 마음에 드는 모임에 신청</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.052 3.823 9.21 8.684 9.815a.485.485 0 00.632-.423m0-15.62c4.02.582 7.59 3.085 9.155 6.521a12.01 12.01 0 01-3.155 11.205m-4.987-16.1L12 3m0 0l-.013.01c-.137.017-.273.036-.408.057" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-700">검증된 매너 멤버십</span>
            <p className="text-[11px] text-slate-400">유료 멤버십 운영으로 필터링된 깨끗한 환경</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 0v1.5m0-1.5h1.5m-1.5 0l-1.5-1.5m1.5 1.5l1.5 1.5m-.75-3.75h7.5m0 0h1.5m-1.5 0l1.5-1.5m-1.5 1.5l1.5 1.5m-.75-3.75h7.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-700">광고 없는 클린 라운지</span>
            <p className="text-[11px] text-slate-400">방해 없이 대화에만 몰입할 수 있는 채팅 서비스</p>
          </div>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Price</span>
          <span className="text-xl font-bold text-slate-800">₩9,900 / <small className="text-slate-400 font-medium">월</small></span>
        </div>
        <div className="px-3 py-1 bg-teal-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-teal-500/10">
          Best Value
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-5 rounded-full font-bold text-[14px] shadow-xl transition-all flex items-center justify-center gap-2 ${
            isProcessing ? 'bg-slate-100 text-slate-300' : 'bg-teal-500 text-white hover:bg-teal-600 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              결제 진행 중...
            </>
          ) : '구독 시작하기'}
        </button>
        <button
          onClick={onBack}
          className="text-center text-slate-400 text-[12px] font-bold py-2"
        >
          나중에 할게요
        </button>
      </div>

      <p className="text-[10px] text-slate-300 text-center leading-relaxed font-light">
        구독은 언제든 해지 가능하며, 결제 즉시 혜택이 시작됩니다.<br/>
        문의사항은 고객센터(help@bihon.com)를 이용해 주세요.
      </p>
    </div>
  );
};

export default SubscriptionView;
