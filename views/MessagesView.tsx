
import React from 'react';
import { Meeting, UserParticipation } from '../types';

interface MessagesViewProps {
  userParticipations: UserParticipation[];
  allMeetings: Meeting[];
  unreadMeetingIds: Set<string>;
  onSelectChat: (meetingId: string) => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ userParticipations, allMeetings, unreadMeetingIds, onSelectChat }) => {
  const myChats = userParticipations
    .map(p => allMeetings.find(m => m.id === p.meetingId))
    .filter((m): m is Meeting => !!m);

  return (
    <div className="flex flex-col gap-8 pt-10 px-6 pb-40 page-enter">
      <header className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-[#2DD4BF] uppercase tracking-widest">Chat Lounge</span>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">멤버 라운지</h2>
        <p className="text-sm text-slate-400 font-light leading-relaxed">
          참여 중인 모임의 멤버들과 <br/> 자유롭게 이야기를 나눠보세요.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {myChats.map((chat) => {
          const hasUnread = unreadMeetingIds.has(chat.id);
          
          return (
            <div 
              key={chat.id} 
              onClick={() => onSelectChat(chat.id)}
              className={`group relative bg-white p-6 rounded-[32px] border flex items-center gap-4 card-shadow transition-all cursor-pointer active:scale-[0.98] ${
                hasUnread ? 'border-teal-200 bg-teal-50/10' : 'border-slate-100 hover:border-teal-100'
              }`}
            >
              {hasUnread && (
                <div className="absolute top-5 right-6 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#2DD4BF] rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-black text-[#2DD4BF] uppercase tracking-tighter">New Message</span>
                </div>
              )}
              
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                hasUnread ? 'bg-teal-500 text-white' : 'bg-teal-50 text-teal-500'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.474-.065.75.75 0 01-.356-.62c.001-.698.147-1.362.414-1.967A8.25 8.25 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase ${hasUnread ? 'text-teal-600' : 'text-teal-500'}`}>
                    {chat.category}
                  </span>
                </div>
                <h3 className={`font-bold truncate ${hasUnread ? 'text-slate-900' : 'text-slate-800'}`}>
                  {chat.title}
                </h3>
                <p className={`text-[12px] truncate font-medium ${hasUnread ? 'text-teal-600' : 'text-slate-400'}`}>
                  {hasUnread ? '새로운 메시지가 도착했습니다!' : '멤버들과 인사를 나눠보세요!'}
                </p>
              </div>
            </div>
          );
        })}

        {myChats.length === 0 && (
          <div className="bg-slate-50/50 p-12 rounded-[40px] border border-dashed border-slate-100 flex flex-col gap-6 items-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.474-.065.75.75 0 01-.356-.62c.001-.698.147-1.362.414-1.967A8.25 8.25 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
               </svg>
            </div>
            <div className="flex flex-col gap-2">
               <h3 className="font-bold text-slate-400">참여 중인 모임이 없어요</h3>
               <p className="text-[12px] text-slate-300 font-light leading-relaxed">
                 마음에 드는 모임에 참여하면 <br/> 자동으로 채팅방이 생성됩니다.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
