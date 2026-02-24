
import React, { useState, useEffect, useRef } from 'react';
import { db, collection, addDoc, query, onSnapshot, orderBy } from '../firebase';
import { UserProfile, Meeting, ChatMessage } from '../types';

interface ChatRoomViewProps {
  user: UserProfile;
  meeting: Meeting;
  onBack: () => void;
  onShowDetail: (id: string) => void;
  onBlockUser: (targetUserId: string) => Promise<void>;
}

const ChatRoomView: React.FC<ChatRoomViewProps> = ({ user, meeting, onBack, onShowDetail, onBlockUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesQuery = query(
      collection(db, `meetings/${meeting.id}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [meeting.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, `meetings/${meeting.id}/messages`), {
        senderId: user.id,
        senderName: user.nickname,
        text: text,
        timestamp: new Date()
      });
    } catch (e) {
      console.error("Error sending message: ", e);
    }
  };

  // 차단된 유저 메시지 제외
  const filteredMessages = messages.filter(msg => !user.blockedUserIds.includes(msg.senderId));

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Chat Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 shrink-0 z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">{meeting.title}</h3>
            <span className="text-[10px] text-teal-500 font-bold uppercase">멤버 라운지</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => onShowDetail(meeting.id)}
            className="p-2 text-slate-400 hover:text-teal-500 transition-colors"
            title="모임 정보 보기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
            {meeting.currentParticipants}명
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth"
      >
        <div className="py-10 text-center flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Beginning of gathering</span>
          <p className="text-[12px] text-slate-400 font-light px-10 leading-relaxed">
            반가워요! 매너 있는 대화로 <br/> 따뜻한 모임을 만들어가요.
          </p>
        </div>

        {filteredMessages.map((msg) => {
          const isMine = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-1 group`}>
              {!isMine && (
                <div className="flex items-center gap-2 ml-1">
                  <span className="text-[10px] font-bold text-slate-400">{msg.senderName}</span>
                  <button 
                    onClick={() => onBlockUser(msg.senderId)}
                    className="text-[9px] text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    차단
                  </button>
                </div>
              )}
              <div 
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  isMine 
                    ? 'bg-teal-500 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0 z-10 pb-safe">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="메시지를 입력해 주세요..."
            className="flex-1 px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:outline-none focus:bg-slate-100 transition-all"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              !inputText.trim() ? 'bg-slate-100 text-slate-300' : 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 active:scale-90'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-45">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoomView;
