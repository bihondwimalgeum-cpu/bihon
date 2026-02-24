
import React, { useState } from 'react';

interface DocumentUploadViewProps {
  onComplete: (isCertified: boolean) => void;
  onSkip: () => void;
}

const DocumentUploadView: React.FC<DocumentUploadViewProps> = ({ onComplete, onSkip }) => {
  const [checks, setChecks] = useState({
    isSingle: false,
    respectValue: false,
    agreeFutureAuth: false,
  });

  const allChecked = checks.isSingle && checks.respectValue && checks.agreeFutureAuth;

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleComplete = () => {
    if (allChecked) {
      onComplete(true);
    }
  };

  return (
    <div className="flex flex-col gap-8 mt-4 page-enter">
      <div className="text-center px-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">신뢰를 위한 자율 선언</h2>
        <p className="text-slate-400 mt-2 text-xs font-light leading-relaxed">
          '비혼뒤맑음'은 서로의 삶을 존중하는<br/>
          성숙한 비혼 커뮤니티를 지향합니다.
        </p>
      </div>

      <div className="bg-white p-6 rounded-[40px] border border-slate-100 card-shadow flex flex-col gap-6 mx-2">
        {/* Beta Notice Box */}
        <div className="bg-[#F0F7FF] p-5 rounded-3xl border border-[#E0F2FE] flex flex-col gap-3 text-left">
          <div className="flex items-start gap-2">
             <div className="mt-0.5 text-[#3B82F6]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
             </div>
             <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-bold text-slate-800">베타 서비스 기간 안내</span>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  현재는 <span className="text-[#2DD4BF] font-bold">베타 테스트 기간</span>으로 별도의 서류 인증 없이 자율 선언만으로 이용이 가능합니다. 정식 서비스 시에는 보다 안전한 신뢰 형성을 위해 <span className="font-bold underline underline-offset-2 text-[#2DD4BF]">혼인관계증명서(상세)</span>를 통한 인증 절차가 도입될 예정입니다.
                </p>
             </div>
          </div>
        </div>

        {/* Declaration Checks */}
        <div className="flex flex-col gap-3">
          <label className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${checks.isSingle ? 'bg-teal-50 border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
            <input type="checkbox" checked={checks.isSingle} onChange={() => toggleCheck('isSingle')} className="hidden" />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${checks.isSingle ? 'bg-[#2DD4BF]' : 'bg-slate-200'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={`text-[13px] font-bold ${checks.isSingle ? 'text-slate-800' : 'text-slate-400'}`}>저는 현재 법적으로 미혼 상태입니다.</span>
          </label>

          <label className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${checks.respectValue ? 'bg-teal-50 border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
            <input type="checkbox" checked={checks.respectValue} onChange={() => toggleCheck('respectValue')} className="hidden" />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${checks.respectValue ? 'bg-[#2DD4BF]' : 'bg-slate-200'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={`text-[13px] font-bold ${checks.respectValue ? 'text-slate-800' : 'text-slate-400'}`}>비혼 가치관을 존중하며 매너를 지킵니다.</span>
          </label>

          <label className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${checks.agreeFutureAuth ? 'bg-teal-50 border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
            <input type="checkbox" checked={checks.agreeFutureAuth} onChange={() => toggleCheck('agreeFutureAuth')} className="hidden" />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${checks.agreeFutureAuth ? 'bg-[#2DD4BF]' : 'bg-slate-200'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={`text-[13px] font-bold ${checks.agreeFutureAuth ? 'text-slate-800' : 'text-slate-400'}`}>추후 정식 인증 도입 시 서류 제출에 동의합니다.</span>
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleComplete}
            disabled={!allChecked}
            className={`w-full py-5 rounded-full font-bold text-[13px] tracking-tight transition-all shadow-lg ${!allChecked ? 'bg-slate-100 text-slate-300' : 'bg-[#2DD4BF] text-white hover:bg-[#28c1ad] active:scale-95'}`}
          >
            선언 완료하고 시작하기
          </button>
          
          <button
            onClick={onSkip}
            className="text-center text-slate-400 text-[11px] font-bold py-2 hover:text-slate-600 transition-colors"
          >
            나중에 하기 (일부 기능 제한)
          </button>
        </div>
      </div>

      <div className="px-10 py-4 flex gap-3 items-start justify-center text-center">
         <p className="text-[10px] text-slate-400 font-light leading-relaxed">
           '비혼뒤맑음'은 서로를 과도하게 의심하지 않는<br/>
           다정한 신뢰 공동체를 꿈꿉니다.
         </p>
      </div>
    </div>
  );
};

export default DocumentUploadView;
