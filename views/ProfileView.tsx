
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { INTEREST_OPTIONS } from '../constants';

interface ProfileViewProps {
  user: UserProfile;
  onComplete: (data: Partial<UserProfile>) => void;
}

const BIHON_VALUES = [
    '나만의 시간 선호', '커리어 집중', '반려동물과 함께', '정서적 독립', '미니멀 라이프', '여행하는 삶', '경제적 자유'
];

const ProfileView: React.FC<ProfileViewProps> = ({ user, onComplete }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleValue = (val: string) => {
    setSelectedValues(prev => 
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleFinish = () => {
    onComplete({
      interests: [...selectedInterests, ...selectedValues],
      bio
    });
  };

  return (
    <div className="flex flex-col gap-10 pb-10">
      <div className="text-center mt-4">
        <h2 className="serif-font text-2xl font-bold text-slate-800 tracking-tight">취향과 가치</h2>
        <p className="text-teal-600 mt-2 text-[10px] font-black uppercase tracking-[0.2em]">Self-Curation</p>
        <p className="text-slate-400 mt-3 text-xs font-light leading-relaxed">
          {user.nickname}님은 어떤 비혼의 삶을 꿈꾸시나요?<br/>가치관이 닮은 분들을 우선적으로 연결해 드려요.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-1">Bihon Values</h3>
        <div className="flex flex-wrap gap-2">
          {BIHON_VALUES.map((val) => (
            <button
              key={val}
              onClick={() => toggleValue(val)}
              className={`px-4 py-2 rounded-2xl border text-[10px] font-bold transition-all ${
                selectedValues.includes(val)
                  ? 'bg-teal-100 border-teal-200 text-teal-700'
                  : 'bg-white border-teal-50 text-slate-400'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-1">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-2 rounded-2xl border text-[10px] font-bold transition-all ${
                selectedInterests.includes(interest)
                  ? 'bg-teal-500 border-teal-500 text-white shadow-md'
                  : 'bg-white border-teal-50 text-slate-400 hover:border-teal-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </section>

      <div className="bg-white p-8 rounded-[40px] border border-teal-50 shadow-2xl shadow-teal-900/5 flex flex-col gap-6">
        <div>
          <label className="block text-[10px] font-black text-teal-600 mb-3 uppercase tracking-[0.2em]">Brief Introduction</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="자신을 한 문장으로 표현한다면?"
            className="w-full px-6 py-4 rounded-[28px] bg-teal-50/30 border border-transparent text-slate-800 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-teal-200 transition-all min-h-[120px] text-sm font-light leading-relaxed"
          />
        </div>
      </div>

      <button
        onClick={handleFinish}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-5 rounded-[28px] transition-all shadow-xl shadow-teal-500/20 active:scale-[0.97] text-sm tracking-widest"
      >
        비혼 라이프 시작하기
      </button>
    </div>
  );
};

export default ProfileView;
