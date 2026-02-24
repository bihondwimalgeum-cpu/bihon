
import React, { useState } from 'react';

interface CertificationViewProps {
  onComplete: () => void;
  onSkip: () => void;
}

const CertificationView: React.FC<CertificationViewProps> = ({ onComplete, onSkip }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setStatus('IDLE');
    }
  };

  const handleVerify = () => {
    if (!preview) return;
    setStatus('PROCESSING');
    
    // 베타 기간 동안은 업로드만으로 즉시 승인 처리 (시뮬레이션)
    setTimeout(() => {
      setStatus('SUCCESS');
      setTimeout(onComplete, 1000);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-10 mt-4 pb-10 page-enter">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">신뢰의 완성</h2>
        <p className="text-[#2DD4BF] mt-1 text-[11px] font-bold uppercase tracking-widest">Single Verification</p>
        <p className="text-slate-400 mt-3 text-xs font-light leading-relaxed px-8">
          '정부24'에서 발급한 <span className="font-bold text-[#14B8A6]">혼인관계증명서(상세)</span>를<br/>
          업로드해 주세요. 운영팀에서 확인 후 배지를 부여해 드립니다.
        </p>
      </div>

      <div className="bg-white p-6 rounded-[40px] border border-slate-100 card-shadow flex flex-col gap-6 mx-2">
        <div className="bg-[#F0F7FF] p-5 rounded-3xl border border-[#E0F2FE] flex flex-col gap-3">
          <div className="flex items-start gap-2 text-left">
             <div className="mt-0.5 text-[#3B82F6]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
             </div>
             <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-bold text-slate-800">
                  반드시 <span className="text-[#2DD4BF]">'상세'</span> 유형으로 발급해 주세요!
                </span>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  과거 이력이 모두 포함된 상세 증명서만 접수가 가능합니다. (주민등록번호 뒷자리는 가리고 촬영해 주세요)
                </p>
             </div>
          </div>
        </div>

        <div className="relative">
          <label className={`w-full flex flex-col items-center justify-center min-h-[260px] rounded-[32px] border-2 border-dashed transition-all cursor-pointer overflow-hidden ${preview ? 'border-[#2DD4BF]' : 'border-slate-100 hover:border-[#2DD4BF]/30'}`}>
            {preview ? (
              <div className="relative w-full h-full">
                <img src={preview} alt="Certificate preview" className="w-full h-64 object-cover opacity-50 blur-[1px]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-900/5">
                   <span className="bg-white px-4 py-2 rounded-full text-[11px] font-bold text-[#2DD4BF] shadow-sm">서류 다시 선택하기</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center p-8 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-[#2DD4BF]">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75v-2.25m-9-13.5v13.5m0-13.5L8.25 7.5M12 3l3.75 4.5" />
                   </svg>
                </div>
                <span className="text-[12px] font-bold text-slate-400">서류 촬영 또는 파일 선택</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {status === 'SUCCESS' && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[11px] font-bold text-emerald-600">서류가 정상적으로 접수되었습니다.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleVerify}
            disabled={!preview || status === 'PROCESSING' || status === 'SUCCESS'}
            className={`w-full py-5 rounded-full font-bold text-[13px] tracking-tight transition-all flex items-center justify-center gap-2 ${
              !preview || status === 'PROCESSING' || status === 'SUCCESS' 
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
              : 'bg-[#2DD4BF] text-white shadow-lg active:scale-95'
            }`}
          >
            {status === 'PROCESSING' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                업로드 중...
              </>
            ) : '인증 서류 제출하기'}
          </button>
          
          <button
            onClick={onSkip}
            disabled={status === 'PROCESSING'}
            className="w-full py-2 text-slate-400 font-bold text-[11px] hover:text-slate-600 transition-colors"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificationView;
