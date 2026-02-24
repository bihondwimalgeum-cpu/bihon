
import React, { useState } from 'react';
import { UserProfile, Meeting } from '../types';
import { CATEGORIES } from '../constants';

interface CreateMeetingViewProps {
  user: UserProfile;
  onComplete: (meeting: Meeting) => Promise<void>;
  onBack: () => void;
}

const CreateMeetingView: React.FC<CreateMeetingViewProps> = ({ user, onComplete, onBack }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00'); // 기본값 오후 2시
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [description, setDescription] = useState('');
  const [moodTags, setMoodTags] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 시간 옵션 생성 (00:00 ~ 23:00)
  const timeOptions = Array.from({ length: 24 }).map((_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !location || !description) {
      setError('모든 필수 항목을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newMeeting: Meeting = {
        id: `meeting_${Date.now()}`,
        title,
        category,
        date: `${date} ${time}`,
        location,
        capacity,
        currentParticipants: 1,
        description,
        host: user.nickname,
        hostId: user.id,
        isCertifiedOnly: false, // 인증 멤버 전용 기능은 사용하지 않으므로 false 고정
        imageUrl: `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600&seed=${Date.now()}`,
        moodTags: moodTags.split(',').map(tag => tag.trim().replace('#', '')).filter(t => t !== ''),
        createdAt: new Date().toISOString()
      };

      await onComplete(newMeeting);
    } catch (err) {
      setError('모임 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pt-6 px-6 pb-40 page-enter">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">즐거운 일상 제안하기</h2>
        <p className="text-sm text-slate-400 font-light">함께하고 싶은 소소한 취미를 멤버들과 공유해 보세요.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <div className="flex flex-col gap-8 bg-white p-6 rounded-[32px] border border-slate-100 card-shadow">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">모임 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              placeholder="예: 주말 산책 같이 하실 분?"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium appearance-none"
              >
                {CATEGORIES.filter(c => c !== '전체').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">모집 인원</label>
              <input
                type="number"
                min={2}
                max={15}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-xs font-medium"
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">시간</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium appearance-none"
              >
                {timeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="absolute right-4 top-[38px] pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">만남 장소</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
              placeholder="예: 여의나루역 2번 출구 앞"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">무드 태그 (쉼표로 구분)</label>
            <input
              type="text"
              value={moodTags}
              onChange={(e) => setMoodTags(e.target.value)}
              disabled={isSubmitting}
              placeholder="#편안한, #수다, #주말아침"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">모임 상세 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="어떤 활동을 하는지, 준비물은 무엇인지 자세히 적어주세요!"
              className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all min-h-[140px] text-sm font-light leading-relaxed"
            />
          </div>
        </div>

        {error && <p className="text-rose-500 text-xs font-bold text-center animate-pulse">{error}</p>}

        <div className="flex gap-4">
          <button 
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 py-4 text-sm font-bold text-slate-400 border border-slate-100 bg-white rounded-full hover:bg-slate-50 transition-all"
          >
            뒤로 가기
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`flex-[2] py-4 rounded-full font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSubmitting 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-[#2DD4BF] text-white hover:bg-[#28c1ad] active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                등록 중...
              </>
            ) : '모임 등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMeetingView;
