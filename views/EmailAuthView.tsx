
import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, db, collection, doc, getDoc } from '../firebase';
import { UserProfile } from '../types';

interface EmailAuthViewProps {
  onComplete: (data: { email: string; age: number; isNewUser: boolean; existingUser?: UserProfile; needsVerification?: boolean }) => Promise<void>;
  onCancel: () => void;
}

const EmailAuthView: React.FC<EmailAuthViewProps> = ({ onComplete, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number>(35);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSwitchOption, setShowSwitchOption] = useState(false);
  const [checks, setChecks] = useState({
    over35: false,
    isBihon: false,
    isUnmarried: false
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자리 이상이어야 합니다.');
      return;
    }
    if (!isLoginMode && (!checks.over35 || !checks.isBihon || !checks.isUnmarried)) {
      setError('필수 자격 요건에 모두 동의해 주세요.');
      return;
    }
    if (!isLoginMode && (age < 35)) {
      setError('35세 이상만 가입 가능합니다.');
      return;
    }

    setIsLoading(true);
    setError('');
    setShowSwitchOption(false);

    const authPromise = isLoginMode 
      ? signInWithEmailAndPassword(auth, email, password)
      : createUserWithEmailAndPassword(auth, email, password);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 15000)
    );

    try {
      if (isLoginMode) {
        console.log("Attempting login for:", email);
        const userCredential = await Promise.race([authPromise, timeoutPromise]) as any;
        const firebaseUser = userCredential.user;
        console.log("Login successful, user:", firebaseUser.uid);

        if (!firebaseUser.emailVerified) {
          console.log("Email not verified");
          await onComplete({ email, age, isNewUser: false, needsVerification: true });
          return;
        }

        console.log("Fetching user profile...");
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          console.log("Profile found");
          const userData = userDoc.data() as UserProfile;
          await onComplete({ email, age: userData.age, isNewUser: false, existingUser: userData });
        } else {
          console.log("No profile found, redirecting to setup");
          await onComplete({ email, age, isNewUser: true });
        }
      } else {
        console.log("Attempting signup for:", email);
        const userCredential = await Promise.race([authPromise, timeoutPromise]) as any;
        console.log("Signup successful");
        
        await sendEmailVerification(userCredential.user);
        console.log("Verification email sent");
        
        await onComplete({ email, age, isNewUser: true, needsVerification: true });
      }
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      if (err.message === 'AUTH_TIMEOUT') {
        setError('인증 서버 응답 시간이 초과되었습니다. Firebase 콘솔에서 [Email/Password] 인증이 활성화되어 있는지, 그리고 현재 도메인이 [승인된 도메인]에 등록되어 있는지 확인해 주세요.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('이미 가입된 이메일입니다. 로그인 화면으로 가시겠습니까?');
        setShowSwitchOption(true);
      } else if (err.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일 형식입니다.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Firebase 콘솔에서 이메일/비밀번호 인증을 활성화해 주세요.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('현재 도메인이 Firebase 승인 도메인에 등록되어 있지 않습니다.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('네트워크 연결이 원활하지 않습니다. 인터넷 연결을 확인해 주세요.');
      } else {
        setError(`인증 오류: ${err.code || '알 수 없는 오류'}. 잠시 후 다시 시도해 주세요.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setIsLoginMode(true);
    setError('');
    setShowSwitchOption(false);
  };

  return (
    <div className="flex flex-col gap-8 px-6 pt-10 pb-20 page-enter">
      <div className="text-center">
        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-teal-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          {isLoginMode ? '다시 오셨군요!' : '함께해서 기뻐요'}
        </h2>
        <p className="text-slate-400 mt-2 text-xs font-light leading-relaxed">
          {isLoginMode 
            ? '가입하신 이메일로 간편하게 로그인하세요.' 
            : '성숙한 비혼들을 위한 공간, 비혼뒤맑음입니다.'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="flex flex-col gap-6 bg-white p-8 rounded-[40px] border border-teal-50 shadow-lg shadow-teal-900/5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest px-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); setShowSwitchOption(false); }}
              placeholder="example@email.com"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest px-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
            />
          </div>

          {!isLoginMode && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest px-2">Your Age</label>
              <input
                type="number"
                min={35}
                max={100}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
              />
              <p className="text-[10px] text-slate-300 px-2">* 35세 미만은 가입이 제한됩니다.</p>
            </div>
          )}
        </div>

        {!isLoginMode && (
          <div className="flex flex-col gap-2.5">
            <label 
              onClick={() => setChecks(p => ({ ...p, over35: !p.over35 }))}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checks.over35 ? 'bg-teal-500 border-teal-500' : 'bg-slate-50 border-slate-200'}`}>
                {checks.over35 && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-[12px] font-bold text-slate-500 group-hover:text-teal-600 transition-colors">본인은 35세 이상입니다 (필수)</span>
            </label>
            <label 
              onClick={() => setChecks(p => ({ ...p, isBihon: !p.isBihon }))}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checks.isBihon ? 'bg-teal-500 border-teal-500' : 'bg-slate-50 border-slate-200'}`}>
                {checks.isBihon && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-[12px] font-bold text-slate-500 group-hover:text-teal-600 transition-colors">본인은 비혼주의자입니다 (필수)</span>
            </label>
            <label 
              onClick={() => setChecks(p => ({ ...p, isUnmarried: !p.isUnmarried }))}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checks.isUnmarried ? 'bg-teal-500 border-teal-500' : 'bg-slate-50 border-slate-200'}`}>
                {checks.isUnmarried && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-[12px] font-bold text-slate-500 group-hover:text-teal-600 transition-colors">본인은 과거 혼인(이혼/사별) 이력이 전혀 없는 법적 초혼 상태입니다 (필수)</span>
            </label>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {error && (
            <div className="flex flex-col gap-2 items-center">
              <p className="text-rose-500 text-[11px] font-bold text-center leading-tight">{error}</p>
              {showSwitchOption && (
                <button 
                  type="button"
                  onClick={handleSwitchMode}
                  className="text-teal-600 text-[11px] font-bold underline underline-offset-4 hover:text-teal-700 transition-colors"
                >
                  로그인 화면으로 이동하기
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 rounded-[24px] font-bold text-sm tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
              isLoading ? 'bg-slate-100 text-slate-300' : 'bg-teal-500 text-white shadow-teal-500/20 active:scale-[0.97]'
            }`}
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isLoginMode ? '로그인하기' : '회원가입 완료')}
          </button>
          
          <button
            type="button"
            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setShowSwitchOption(false); }}
            className="w-full py-2 text-slate-400 text-[11px] font-bold hover:text-teal-600 transition-colors"
          >
            {isLoginMode ? '아직 계정이 없으신가요? 가입하기' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </form>

      <button
        onClick={onCancel}
        className="text-center text-slate-300 text-[10px] font-bold tracking-widest uppercase hover:text-slate-400 transition-colors"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default EmailAuthView;
