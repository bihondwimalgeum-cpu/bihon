
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SignupViewProps {
  onComplete: (user: UserProfile) => void;
  onCancel?: () => void;
}

const SignupView: React.FC<SignupViewProps> = ({ onComplete, onCancel }) => {
  const [ssnFront, setSsnFront] = useState('');
  const [ssnBack, setSsnBack] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (ssnFront.length !== 6 || ssnBack.length === 0) {
      setError('정보를 모두 입력해주세요.');
      return;
    }

    const birthYearPrefix = parseInt(ssnFront.substring(0, 2));
    const genderDigit = parseInt(ssnBack.substring(0, 1));
    
    let fullYear = 0;
    if (genderDigit === 1 || genderDigit === 2) fullYear = 1900 + birthYearPrefix;
    else if (genderDigit === 3 || genderDigit === 4) fullYear = 2000 + birthYearPrefix;
    
    const currentYear = new Date().getFullYear();
    const age = currentYear - fullYear + 1;

    if (age < 35) {
      setError('35세 이상만 이용 가능합니다.');
      return;
    }

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    onComplete({
      id: `user_${Date.now()}`,
      nickname,
      age,
      isCertified: false,
      interests: [],
      bio: '',
      location: '서울',
      followerCount: 0,
      followingCount: 0,
      blockedUserIds: []
    });
  };

  return (
    <div className="flex flex-col gap-10 mt-4 pb-10">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
           <div className="absolute inset-0 bg-teal-200 rounded-full blur-2xl opacity-30 animate-pulse"></div>
           <div className="relative bg-white w-full h-full rounded-full flex items-center justify-center shadow-lg border border-teal-50">
              <span className="text-4xl">🌿</span>
           </div>
        </div>
        <h2 className="serif-font text-2xl font-bold text-slate-800 tracking-tight leading-snug">반갑습니다.</h2>
        <p className="text-slate-400 mt-2 text-xs font-light leading-relaxed tracking-wide">성숙한 비혼 생활을 위한 의미 있는 시작,<br/>나이 확인을 위해 정보를 입력해 주세요.</p>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-teal-50 shadow-2xl shadow-teal-900/5 flex flex-col gap-8">
        <div>
          <label className="block text-[10px] font-black text-teal-600 mb-3 uppercase tracking-[0.2em]">Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="어떻게 불러드릴까요?"
            className="w-full px-6 py-4 rounded-3xl bg-teal-50/30 border border-transparent text-slate-800 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-teal-600 mb-3 uppercase tracking-[0.2em]">Verification</label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              maxLength={6}
              value={ssnFront}
              onChange={(e) => setSsnFront(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="YYMMDD"
              className="w-full px-4 py-4 rounded-3xl bg-teal-50/30 border border-transparent text-slate-800 text-center tracking-[0.3em] focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
            />
            <span className="text-teal-200 font-light text-2xl">-</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={1}
                value={ssnBack}
                onChange={(e) => setSsnBack(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="X"
                className="w-14 px-4 py-4 rounded-3xl bg-teal-50/30 border border-transparent text-slate-800 text-center focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
              />
              <span className="text-teal-100 tracking-tighter text-lg font-bold">••••••</span>
            </div>
          </div>
        </div>

        {error && <p className="text-rose-500 text-[10px] font-bold text-center tracking-tight animate-bounce">{error}</p>}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleVerify}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-5 rounded-[28px] transition-all shadow-xl shadow-teal-500/20 active:scale-[0.97] text-sm tracking-widest"
          >
            입장하기
          </button>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full py-3 text-slate-300 hover:text-slate-500 text-[10px] font-bold tracking-widest uppercase transition-colors"
            >
              다음에 할게요
            </button>
          )}
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-300 leading-relaxed font-light tracking-wide px-4">
        입력하신 개인정보는 35세 이상 확인 후 즉시 파기되며,<br/>서버에 절대 저장되거나 노출되지 않습니다.
      </div>
    </div>
  );
};

export default SignupView;
