
import React, { useState, useEffect, useMemo } from 'react';
import { Meeting, UserProfile } from '../types';
import { db, collection, query, where, onSnapshot, getDoc, doc } from '../firebase';

interface MeetingDetailViewProps {
  user: UserProfile | null;
  meeting: Meeting;
  isJoined: boolean;
  onJoin: (id: string) => void;
  onToggleLike: (id: string) => void;
  onKickMembers: (meetingId: string, userIds: string[]) => Promise<void>;
  onBlockUser: (targetUserId: string) => Promise<void>;
  onUnblockUser: (targetUserId: string) => Promise<void>;
  onDeleteMeeting: (meetingId: string) => Promise<void>;
  onEditMeeting: () => void;
  onBack: () => void;
}

interface ParticipantInfo {
  id: string;
  nickname: string;
}

const MeetingDetailView: React.FC<MeetingDetailViewProps> = ({ 
  user, 
  meeting, 
  isJoined, 
  onJoin, 
  onToggleLike,
  onKickMembers, 
  onBlockUser, 
  onUnblockUser, 
  onDeleteMeeting,
  onEditMeeting,
  onBack 
}) => {
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isKicking, setIsKicking] = useState(false);

  const isHost = user?.id === meeting.hostId;
  const isFull = meeting.currentParticipants >= meeting.capacity;
  
  const isPast = useMemo(() => {
    const meetingTime = new Date(meeting.date).getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return meetingTime + oneDayInMs < new Date().getTime();
  }, [meeting.date]);

  useEffect(() => {
    if (!meeting.id) return;

    const q = query(collection(db, 'participations'), where('meetingId', '==', meeting.id));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setIsLoadingParticipants(true);
      const participantPromises = snapshot.docs.map(async (pDoc) => {
        const userId = pDoc.data().userId;
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          return { id: userId, nickname: userDoc.data().nickname };
        }
        return { id: userId, nickname: '알 수 없는 사용자' };
      });

      const results = await Promise.all(participantPromises);
      setParticipants(results);
      setIsLoadingParticipants(false);
    });

    return () => unsubscribe();
  }, [meeting.id]);

  const toggleSelect = (id: string) => {
    if (id === user?.id) return; 
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleKickSelected = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`선택한 ${selectedIds.length}명의 멤버를 모임에서 내보내시겠습니까?`)) {
      setIsKicking(true);
      await onKickMembers(meeting.id, selectedIds);
      setSelectedIds([]);
      setIsManageMode(false);
      setIsKicking(false);
    }
  };

  const handleBlockToggle = async (targetId: string, isBlocked: boolean) => {
    if (isBlocked) {
      await onUnblockUser(targetId);
    } else {
      await onBlockUser(targetId);
    }
  };

  if (!meeting) return null;

  return (
    <div className={`flex flex-col pb-48 page-enter min-h-screen ${isPast ? 'bg-slate-50' : 'bg-white'}`}>
      {/* Action Bar Header */}
      <header className="h-20 flex items-center justify-between px-6 bg-white sticky top-0 z-20 border-b border-slate-50">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center">
           <span className="text-[11px] font-black text-teal-500 uppercase tracking-widest">Detail View</span>
           {isPast && <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">종료된 모임</span>}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onToggleLike(meeting.id)}
            className="p-2 text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 transition-all ${meeting.likedUserIds?.includes(user?.id || '') ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-300'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className={`text-xs font-bold ${meeting.likedUserIds?.includes(user?.id || '') ? 'text-rose-500' : 'text-slate-400'}`}>
              {meeting.likedUserIds?.length || 0}
            </span>
          </button>
          {isHost && !isPast && (
            <>
              <button 
                onClick={onEditMeeting}
                className="text-[11px] font-bold text-slate-400 hover:text-teal-500 transition-colors"
              >
                수정
              </button>
              <button 
                onClick={() => onDeleteMeeting(meeting.id)}
                className="text-[11px] font-bold text-slate-300 hover:text-rose-500 transition-colors"
              >
                삭제
              </button>
              <button 
                onClick={() => {
                  setIsManageMode(!isManageMode);
                  setSelectedIds([]);
                }}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-all ${isManageMode ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'}`}
              >
                {isManageMode ? '취소' : '멤버관리'}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="px-6 flex flex-col gap-10">
        {/* Core Header */}
        <header className="flex flex-col gap-4 pt-8">
          <div className="flex items-center justify-between">
             <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${isPast ? 'bg-slate-200 text-slate-500' : 'bg-teal-50 text-teal-600'}`}>
                {meeting.category}
             </span>
             {meeting.isCertifiedOnly && (
               <span className={`text-[10px] font-bold border px-3 py-1 rounded-full flex items-center gap-1 ${isPast ? 'text-slate-400 border-slate-200' : 'text-teal-600 border-teal-100'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.052 3.823 9.21 8.684 9.815a.485.485 0 00.632-.423m0-15.62c4.02.582 7.59 3.085 9.155 6.521a12.01 12.01 0 01-3.155 11.205m-4.987-16.1L12 3m0 0l-.013.01c-.137.017-.273.036-.408.057" />
                 </svg>
                 신뢰멤버전용
               </span>
             )}
          </div>
          <h2 className={`text-2xl font-bold leading-tight ${isPast ? 'text-slate-500' : 'text-slate-800'}`}>{meeting.title}</h2>
          <div className="flex flex-wrap gap-2">
            {meeting.moodTags?.map(tag => (
              <span key={tag} className="text-[12px] text-slate-400 font-medium">#{tag}</span>
            ))}
          </div>
        </header>

        {/* Info Grid */}
        <div className={`grid grid-cols-2 gap-6 p-8 rounded-[32px] border ${isPast ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isPast ? 'bg-white text-slate-400' : 'bg-white text-teal-500'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
               </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">일정</span>
              <span className="text-xs font-bold text-slate-700">{meeting.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isPast ? 'bg-white text-slate-400' : 'bg-white text-teal-500'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
               </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">장소</span>
              <span className="text-xs font-bold text-slate-700">{meeting.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isPast ? 'bg-white text-slate-400' : 'bg-white text-teal-500'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.998 5.998 0 00-5.48-5.974m0 0a6.001 6.001 0 00-5.481 5.974m10.962 0A10.4 10.4 0 0112 21.01m-5.962-2.292a10.4 10.4 0 01-5.962-2.292m0 0a3 3 0 014.681-2.72m4.681 2.72l-.001.031c0 .225.012.447.037.666A11.944 11.944 0 0112 21c2.17 0 4.207-.576-5.963-1.584" />
               </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">인원</span>
              <span className={`text-xs font-bold ${isFull || isPast ? 'text-rose-500' : 'text-slate-700'}`}>{meeting.currentParticipants} / {meeting.capacity} 명</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isPast ? 'bg-white text-slate-400' : 'bg-white text-teal-500'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">호스트</span>
              <span className="text-xs font-bold text-slate-700">{meeting.host}</span>
            </div>
          </div>
        </div>

        {/* Participant List */}
        <article className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
              <div className={`w-1 h-4 rounded-full ${isPast ? 'bg-slate-300' : 'bg-teal-400'}`}></div>
              함께하는 멤버 ({participants.length})
            </h3>
            {isManageMode && (
              <span className="text-[11px] font-bold text-rose-500 animate-pulse">관리 모드 작동 중</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {isLoadingParticipants ? (
              <div className="py-4 text-center text-slate-400 text-xs font-medium">멤버 정보를 불러오고 있어요...</div>
            ) : participants.length > 0 ? (
              participants.map(p => {
                const isSelf = p.id === user?.id;
                const isSelected = selectedIds.includes(p.id);
                const isBlocked = user?.blockedUserIds.includes(p.id);

                return (
                  <div 
                    key={p.id} 
                    onClick={() => isManageMode && !isSelf && toggleSelect(p.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isSelected ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'
                    } ${isManageMode && !isSelf ? 'cursor-pointer active:scale-95' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {isManageMode && !isSelf && (
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-200'}`}>
                           {isSelected && (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                             </svg>
                           )}
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border ${isPast ? 'bg-slate-50 border-slate-100' : 'bg-teal-50/50 border-teal-50'}`}>
                        {p.id === meeting.hostId ? '👑' : '🌿'}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isBlocked ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                            {p.nickname}
                          </span>
                          {p.id === meeting.hostId && (
                            <span className="text-[9px] bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Host</span>
                          )}
                          {isSelf && (
                            <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">나</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!isManageMode && !isSelf && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleBlockToggle(p.id, !!isBlocked); }}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                          isBlocked ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' : 'bg-slate-100 text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        {isBlocked ? '차단됨' : '차단'}
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-[12px] text-slate-400 font-medium bg-slate-50/50">
                아직 참여한 멤버가 없습니다.
              </div>
            )}
          </div>
        </article>

        {/* Description */}
        <article className="flex flex-col gap-6">
          <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
            <div className={`w-1 h-4 rounded-full ${isPast ? 'bg-slate-300' : 'bg-teal-400'}`}></div>
            모임 소개
          </h3>
          <div className="text-slate-600 text-sm leading-relaxed font-light whitespace-pre-wrap px-1">
            {meeting.description}
          </div>
        </article>

        {/* Manners Section */}
        <div className={`p-8 rounded-[32px] border flex gap-4 items-start shadow-sm shadow-teal-900/5 ${isPast ? 'bg-slate-100 border-slate-200' : 'bg-teal-50 border-teal-100'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mt-0.5 shrink-0 ${isPast ? 'text-slate-400' : 'text-teal-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.052 3.823 9.21 8.684 9.815a.485.485 0 00.632-.423m0-15.62c4.02.582 7.59 3.085 9.155 6.521a12.01 12.01 0 01-3.155 11.205m-4.987-16.1L12 3m0 0l-.013.01c-.137.017-.273.036-.408.057" />
           </svg>
           <div className="flex flex-col gap-1.5">
              <span className={`text-xs font-bold ${isPast ? 'text-slate-600' : 'text-teal-700'}`}>성숙한 대화 약속</span>
              <p className={`text-[12px] font-light leading-relaxed ${isPast ? 'text-slate-500' : 'text-teal-800/70'}`}>
                서로의 비혼 가치관을 존중하며 다정한 거리를 유지합니다. 불쾌한 행동 시 즉시 경고 없이 퇴출될 수 있습니다.
              </p>
           </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 glass-nav z-40 flex flex-col gap-3">
        {isManageMode ? (
          <button 
            onClick={handleKickSelected}
            disabled={selectedIds.length === 0 || isKicking}
            className={`w-full font-bold py-5 rounded-full shadow-lg transition-all active:scale-[0.98] text-[13px] tracking-tight flex items-center justify-center gap-2 ${
              selectedIds.length === 0 || isKicking 
                ? 'bg-slate-100 text-slate-300' 
                : 'bg-rose-500 text-white hover:bg-rose-600'
            }`}
          >
            {isKicking ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                내보내는 중...
              </>
            ) : (
              `선택한 멤버 ${selectedIds.length}명 내보내기`
            )}
          </button>
        ) : (
          <button 
            onClick={() => !isPast && onJoin(meeting.id)}
            disabled={isJoined || isFull || isPast}
            className={`w-full font-bold py-5 rounded-full shadow-lg transition-all duration-500 active:scale-[0.98] text-[13px] tracking-tight ${
                isJoined || isFull || isPast 
                ? 'bg-slate-100 text-slate-400 cursor-default' 
                : 'bg-[#2DD4BF] text-white hover:bg-[#28c1ad]'
            }`}
          >
            {isPast ? '종료된 모임입니다' : isJoined ? '참여가 확정되었습니다' : isFull ? '모집이 완료되었습니다' : '참여 신청하기'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingDetailView;
