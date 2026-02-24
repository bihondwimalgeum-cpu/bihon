
import React, { useState } from 'react';
import { Meeting } from '../types';
import { CATEGORIES } from '../constants';

interface EditMeetingViewProps {
  meeting: Meeting;
  onComplete: (data: Partial<Meeting>) => Promise<void>;
  onBack: () => void;
}

const EditMeetingView: React.FC<EditMeetingViewProps> = ({ meeting, onComplete, onBack }) => {
  const [title, setTitle] = useState(meeting.title);
  const [category, setCategory] = useState(meeting.category);
  const [date, setDate] = useState(meeting.date.split(' ')[0]);
  const [time, setTime] = useState(meeting.date.split(' ')[1] || '14:00');
  const [location, setLocation] = useState(meeting.location);
  const [capacity, setCapacity] = useState(meeting.capacity);
  const [description, setDescription] = useState(meeting.description);
  const [moodTags, setMoodTags] = useState(meeting.moodTags?.map(t => `#${t}`).join(', ') || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const updatedData: Partial<Meeting> = {
        title,
        category,
        date: `${date} ${time}`,
        location,
        capacity,
        description,
        moodTags: moodTags.split(',').map(tag => tag.trim().replace('#', '')).filter(t => t !== ''),
      };

      await onComplete(updatedData);
    } catch (err) {
      setError('정보 수정 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pt-6 px-6 pb-40 page-enter">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">모임 정보 수정</h2>
        <p className="text-sm text-slate-400 font-light">더 정확한 정보로 멤버들에게 모임을 소개해 보세요.</p>
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
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">최대 정원</label>
              <input
                type="number"
                min={capacity < meeting.currentParticipants ? meeting.currentParticipants : capacity}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
              />
              {capacity < meeting.currentParticipants && (
                <p className="text-[10px] text-rose-500 mt-1 font-medium">현재 참여자 수보다 작게 설정할 수 없습니다.</p>
              )}
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
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">만남 장소</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">무드 태그</label>
            <input
              type="text"
              value={moodTags}
              onChange={(e) => setMoodTags(e.target.value)}
              disabled={isSubmitting}
              placeholder="#분위기, #태그로구분"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent text-slate-800 focus:outline-none focus:bg-white focus:border-teal-200 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">상세 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
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
            취소
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
            {isSubmitting ? '수정 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMeetingView;
