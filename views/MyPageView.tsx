
import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, Meeting, UserParticipation } from '../types';
import { db, doc, getDoc } from '../firebase';

interface MyPageViewProps {
  user: UserProfile | null;
  participations: UserParticipation[];
  allMeetings: Meeting[];
  onToggleVisibility: (meetingId: string) => void;
  onLogout: () => void;
  onWithdrawal: () => Promise<void>;
  onUpdateProfile: (data: { nickname: string; bio: string; interests: string[] }) => Promise<void>;
  onSelectMeeting: (meetingId: string) => void;
  onUnblockUser: (targetUserId: string) => Promise<void>;
}

interface BlockedUser {
  id: string;
  nickname: string;
}

const MyPageView: React.FC<MyPageViewProps> = ({ 
  user, 
  participations, 
  allMeetings, 
  onLogout, 
  onWithdrawal,
  onUpdateProfile,
  onSelectMeeting,
  onUnblockUser
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState(user?.nickname || '');
  const [isSaving, setIsSaving] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [showBlockedList, setShowBlockedList] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (showBlockedList && user?.blockedUserIds && user.blockedUserIds.length > 0) {
      const fetchBlockedUsers = async () => {
        setIsLoadingBlocks(true);
        try {
          const promises = user.blockedUserIds.map(async (id) => {
            const docSnap = await getDoc(doc(db, 'users', id));
            return { id, nickname: docSnap.exists() ? docSnap.data().nickname : '알 수 없는 사용자' };
          });
          const results = await Promise.all(promises);
          setBlockedUsers(results);
        } catch (error) {
          console.error("Failed to fetch blocked users:", error);
        } finally {
          setIsLoadingBlocks(false);
        }
      };
      fetchBlockedUsers();
    } else if (!showBlockedList) {
      setBlockedUsers([]);
    }
  }, [showBlockedList, user?.blockedUserIds]);

  const { upcomingMeetings, pastMeetings, likedMeetings } = useMemo(() => {
    const now = new Date().getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    const joined = participations
      .map(p => {
        const meeting = allMeetings.find(m => m.id === p.meetingId);
        if (!meeting) return null;
        return { ...meeting, isPrivate: p.isPrivate };
      })
      .filter((m): m is (Meeting & { isPrivate: boolean }) => m !== null);

    const upcoming = joined.filter(m => new Date(m.date).getTime() + oneDayInMs >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const past = joined.filter(m => new Date(m.date).getTime() + oneDayInMs < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const liked = allMeetings.filter(m => m.likedUserIds?.includes(user?.id || ''))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { upcomingMeetings: upcoming, pastMeetings: past, likedMeetings: liked };
  }, [participations, allMeetings, user?.id]);

  const handleSave = async () => {
    if (!editNickname.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }
    if (editNickname.length < 2) {
      alert("닉네임은 최소 2자 이상이어야 합니다.");
      return;
    }
    
    setIsSaving(true);
    try {
      await onUpdateProfile({ 
        nickname: editNickname, 
        bio: user?.bio || '', 
        interests: user?.interests || [] 
      });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("프로필 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const formattedJoinDate = useMemo(() => {
    if (!user?.joinedAt) return '';
    const date = new Date(user.joinedAt);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }, [user?.joinedAt]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-40 px-10 text-center gap-10">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
           </svg>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">멤버십 가입이 필요해요</h2>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            나만의 소중한 일상을 기록하고 <br/> 새로운 친구들을 만나보세요.
          </p>
        </div>
      </div>
    );
  }

  if (showBlockedList) {
    return (
      <div className="flex flex-col gap-8 px-6 pt-10 pb-40 page-enter">
        <header className="flex items-center gap-4">
          <button onClick={() => setShowBlockedList(false)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-slate-800">차단 멤버 관리</h2>
        </header>

        <div className="flex flex-col gap-4">
          {isLoadingBlocks ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-slate-400">목록을 불러오고 있습니다...</p>
            </div>
          ) : blockedUsers.length > 0 ? (
            blockedUsers.map(bUser => (
              <div 
                key={bUser.id} 
                className="w-full bg-white rounded-3xl p-5 border border-slate-100 flex justify-between items-center shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-sm font-bold text-slate-400 border border-slate-100">
                    {bUser.nickname.substring(0, 1)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{bUser.nickname}</span>
                    <span className="text-[10px] text-slate-300 font-medium">활동 제한됨</span>
                  </div>
                </div>
                <button 
                  onClick={() => onUnblockUser(bUser.id)}
                  className="text-[11px] font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-full hover:bg-rose-100 transition-all active:scale-95"
                >
                  차단 해제
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/30 flex flex-col gap-2 items-center">
              <p className="text-[12px] text-slate-300 font-medium tracking-tight">차단한 사용자가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 px-6 pt-10 pb-40 page-enter relative">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          <div className="relative bg-white w-full max-w-xs rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center gap-6 scale-enter">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
               </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-slate-800">벌써 가시나요?</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                언제든 다시 돌아오세요.<br/>비혼뒤맑음은 항상 열려있습니다.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 text-xs font-bold text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
              >
                취소
              </button>
              <button 
                onClick={onLogout}
                className="flex-1 py-4 text-xs font-bold text-white bg-teal-500 rounded-2xl shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-95"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <section className="flex flex-col items-center gap-6 relative">
        <div className="absolute top-0 right-0 z-10 flex flex-col items-end gap-2">
          {!isEditing ? (
            <>
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setEditNickname(user.nickname);
                }}
                className="text-xs font-bold text-teal-500 bg-teal-50 px-4 py-2 rounded-full hover:bg-teal-100 transition-all"
              >
                수정하기
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => { 
                    setIsEditing(false); 
                    setEditNickname(user.nickname); 
                }}
                className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-full hover:bg-slate-100 transition-all"
              >
                취소
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="text-xs font-bold text-white bg-teal-500 px-4 py-2 rounded-full shadow-md disabled:bg-slate-200 transition-all active:scale-95"
              >
                {isSaving ? '...' : '저장'}
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="w-24 h-24 bg-teal-50 rounded-full border border-teal-100 flex items-center justify-center text-4xl shadow-sm overflow-hidden">
             <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600 font-bold text-2xl">
                {user.nickname.substring(0, 1)}
             </div>
          </div>
          {user.isCertified && (
             <div className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.052 3.823 9.21 8.684 9.815a.485.485 0 00.632-.423m0-15.62c4.02.582 7.59 3.085 9.155 6.521a12.01 12.01 0 01-3.155 11.205m-4.987-16.1L12 3m0 0l-.013.01c-.137.017-.273.036-.408.057" />
                </svg>
             </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          {isEditing ? (
            <div className="w-full max-w-[200px] animate-fadeIn">
              <input
                type="text"
                autoFocus
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                placeholder="새 닉네임 입력"
                className="w-full px-4 py-2 text-center text-lg font-bold text-slate-800 bg-white border-2 border-teal-100 rounded-2xl focus:outline-none focus:border-teal-400 transition-all"
              />
              <p className="text-[10px] text-teal-500 mt-2 text-center font-medium">변경할 닉네임을 입력해 주세요.</p>
            </div>
          ) : (
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{user.nickname}</h2>
          )}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] text-slate-400 font-medium px-4 py-1 bg-slate-50 rounded-full border border-slate-100">{user.email}</span>
            {formattedJoinDate && (
              <span className="text-[9px] text-slate-300 font-medium tracking-tight">가입일: {formattedJoinDate}</span>
            )}
          </div>
        </div>
      </section>

      {/* Timeline Section: Upcoming */}
      <section className="flex flex-col gap-5">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest px-1">
           <div className="w-1 h-3 bg-teal-400 rounded-full"></div>
           진행 예정 모임 ({upcomingMeetings.length})
        </h3>
        <div className="flex flex-col gap-3">
          {upcomingMeetings.map(meeting => (
            <button 
              key={meeting.id} 
              onClick={() => onSelectMeeting(meeting.id)}
              className="w-full text-left bg-white rounded-2xl p-5 border border-slate-100 flex justify-between items-center card-shadow active:scale-[0.98] transition-all hover:border-teal-100"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-teal-500 uppercase">{meeting.category}</span>
                   <h4 className="font-bold text-slate-800 text-sm">{meeting.title}</h4>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {meeting.date} | {meeting.location}
                </span>
              </div>
              <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)] animate-pulse"></div>
            </button>
          ))}
          {upcomingMeetings.length === 0 && (
            <div className="py-12 text-center border border-dashed border-slate-100 rounded-3xl bg-slate-50/50 flex flex-col gap-2 items-center">
              <p className="text-[11px] text-slate-400 font-medium">참여 예정인 모임이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Liked Meetings Section */}
      <section className="flex flex-col gap-5">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest px-1">
           <div className="w-1 h-3 bg-rose-400 rounded-full"></div>
           관심 있는 모임 ({likedMeetings.length})
        </h3>
        <div className="flex flex-col gap-3">
          {likedMeetings.map(meeting => (
            <button 
              key={meeting.id} 
              onClick={() => onSelectMeeting(meeting.id)}
              className="w-full text-left bg-white rounded-2xl p-5 border border-slate-100 flex justify-between items-center card-shadow active:scale-[0.98] transition-all hover:border-rose-100"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-rose-500 uppercase">{meeting.category}</span>
                   <h4 className="font-bold text-slate-800 text-sm">{meeting.title}</h4>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {meeting.date} | {meeting.location}
                </span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500 fill-rose-500" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          ))}
          {likedMeetings.length === 0 && (
            <div className="py-12 text-center border border-dashed border-slate-100 rounded-3xl bg-slate-50/50 flex flex-col gap-2 items-center">
              <p className="text-[11px] text-slate-400 font-medium">좋아요를 누른 모임이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Timeline Section: Past */}
      <section className="flex flex-col gap-5">
        <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest px-1">
           <div className="w-1 h-3 bg-slate-300 rounded-full"></div>
           참여 완료 ({pastMeetings.length})
        </h3>
        <div className="flex flex-col gap-3">
          {pastMeetings.map(meeting => (
            <button 
              key={meeting.id} 
              onClick={() => onSelectMeeting(meeting.id)}
              className="w-full text-left bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex justify-between items-center opacity-70 transition-all hover:bg-white hover:opacity-100"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-slate-400 uppercase">{meeting.category}</span>
                   <h4 className="font-bold text-slate-500 text-sm">{meeting.title}</h4>
                </div>
                <span className="text-[11px] text-slate-300 font-medium">
                  {meeting.date.split(' ')[0]} | {meeting.location}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-300 bg-white px-2 py-0.5 rounded border border-slate-100">완료</span>
            </button>
          ))}
        </div>
      </section>

      {/* Subtle Settings Section */}
      <section className="mt-4 pt-10 border-t border-slate-50 flex flex-col gap-6">
        <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] px-1">Settings & Support</h3>
        
        <div className="flex flex-col">
          <button 
            onClick={() => setShowBlockedList(true)}
            className="flex items-center justify-between py-4 px-1 group transition-colors active:opacity-60"
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span className="text-[13px] font-medium text-slate-500 group-hover:text-slate-700">차단 멤버 관리</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-300">{user.blockedUserIds.length}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>

          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 py-4 px-1 group transition-colors active:opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="text-[13px] font-medium text-slate-500 group-hover:text-slate-700">로그아웃</span>
          </button>
          
          <button 
            onClick={onWithdrawal}
            className="flex items-center gap-3 py-4 px-1 group transition-colors active:opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
            <span className="text-[13px] font-medium text-slate-300 group-hover:text-rose-400 underline underline-offset-4 decoration-slate-200">서비스 탈퇴</span>
          </button>

          <div className="flex flex-col gap-1 mt-2 border-t border-slate-50 pt-4">
            <a 
              href="https://kind-radar-db5.notion.site/3114ef1e03d680bf9f53f751f3c79891" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-3 px-1 group transition-colors active:opacity-60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-[12px] font-medium text-slate-400 group-hover:text-slate-600">이용약관 및 개인정보처리방침</span>
            </a>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[9px] text-slate-200 font-medium uppercase tracking-widest">Version 1.2.0</p>
        </div>
      </section>
    </div>
  );
};

export default MyPageView;
