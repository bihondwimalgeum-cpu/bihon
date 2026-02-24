
import React, { useState, useEffect } from 'react';
import { auth, reload, sendEmailVerification, signOut } from '../firebase';

interface EmailVerificationViewProps {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
}

const EmailVerificationView: React.FC<EmailVerificationViewProps> = ({ email, onVerified, onCancel }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timer: number;
    if (resendTimer > 0) {
      timer = window.setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const checkVerification = async () => {
    if (!auth.currentUser) return;
    setIsRefreshing(true);
    try {
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        onVerified();
      } else {
        setMessage('아직 인증이 완료되지 않았습니다. 메일함의 링크를 클릭해 주세요.');
      }
    } catch (e) {
      console.error(e);
      setMessage('상태를 확인하는 중 오류가 발생했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResend = async () => {
    if (!auth.currentUser || resendTimer > 0) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('인증 메일을 다시 보내드렸습니다.');
      setResendTimer(60);
    } catch (e) {
      setMessage('메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onCancel();
  };

  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center gap-10 page-enter">
      <div className="relative">
        <div className="w-24 h-24 bg-teal-50 rounded-[40px] flex items-center justify-center shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 text-teal-500 ${isRefreshing ? 'animate-bounce' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
           <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">이메일을 확인해 주세요!</h2>
        <p className="text-[13px] text-slate-400 font-light leading-relaxed">
          <span className="font-bold text-slate-600">{email}</span> 주소로 <br/> 인증 링크를 보내드렸습니다.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <button
          onClick={checkVerification}
          disabled={isRefreshing}
          className="w-full py-5 bg-teal-500 text-white rounded-[28px] font-bold text-sm shadow-xl shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isRefreshing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : '인증 완료했어요'}
        </button>

        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className={`text-xs font-bold transition-colors ${resendTimer > 0 ? 'text-slate-300' : 'text-teal-600 hover:text-teal-700'}`}
        >
          {resendTimer > 0 ? `재발송 가능까지 ${resendTimer}초` : '인증 메일 다시 받기'}
        </button>
      </div>

      {message && <p className="text-[11px] font-bold text-rose-500 animate-fade">{message}</p>}

      <button
        onClick={handleLogout}
        className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-slate-400 mt-10"
      >
        다른 이메일로 가입하기
      </button>
    </div>
  );
};

export default EmailVerificationView;
