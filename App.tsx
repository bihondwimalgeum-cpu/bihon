
import React, { useState, useEffect } from 'react';
import { ViewState, UserProfile, Meeting, UserParticipation } from './types';
import { MOCK_MEETINGS } from './constants';
import { db, auth, onAuthStateChanged, signOut, deleteUser, doc, setDoc, getDoc, collection, query, onSnapshot, updateDoc, addDoc, increment, where, getDocs, deleteDoc, arrayUnion, arrayRemove, orderBy } from './firebase';
import EmailAuthView from './views/EmailAuthView';
import EmailVerificationView from './views/EmailVerificationView';
import ProfileSetupView from './views/ProfileSetupView';
import WelcomeView from './views/WelcomeView';
import HomeView from './views/HomeView';
import MeetingDetailView from './views/MeetingDetailView';
import MyPageView from './views/MyPageView';
import MessagesView from './views/MessagesView';
import ChatRoomView from './views/ChatRoomView';
import CreateMeetingView from './views/CreateMeetingView';
import EditMeetingView from './views/EditMeetingView';
import SubscriptionView from './views/SubscriptionView';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<Partial<UserProfile>>({});
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [participations, setParticipations] = useState<UserParticipation[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [blockedBy, setBlockedBy] = useState<string[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [unreadMeetingIds, setUnreadMeetingIds] = useState<Set<string>>(new Set());

  // Firebase Auth 상태 변화 감지 및 사용자 데이터 실시간 동기화
  useEffect(() => {
    let unsubUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          setView('VERIFY_EMAIL');
          return;
        }

        // 사용자 문서 실시간 감시
        unsubUser = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else if (view !== 'PROFILE_SETUP' && view !== 'WELCOME') {
            setView('PROFILE_SETUP');
          }
        });
      } else {
        setUser(null);
        if (unsubUser) unsubUser();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUser) unsubUser();
    };
  }, [view]);

  useEffect(() => {
    if (user?.id) {
      const q = query(collection(db, 'participations'), where('userId', '==', user.id));
      const unsubParticipations = onSnapshot(q, (snapshot) => {
        const parts = snapshot.docs.map(doc => ({
          meetingId: doc.data().meetingId,
          isPrivate: doc.data().isPrivate
        }));
        setParticipations(parts);
      });
      return () => unsubParticipations();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      const q = query(collection(db, 'users'), where('blockedUserIds', 'array-contains', user.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ids = snapshot.docs.map(doc => doc.id);
        setBlockedBy(ids);
      });
      return () => unsubscribe();
    } else {
      setBlockedBy([]);
    }
  }, [user?.id]);

  useEffect(() => {
    const meetingsQuery = query(collection(db, 'meetings'));
    const unsubscribe = onSnapshot(meetingsQuery, (snapshot) => {
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meeting[];
      if (meetingsData.length === 0) setMeetings(MOCK_MEETINGS);
      else setMeetings(meetingsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || participations.length === 0) return;
    const unsubscribes = participations.map(p => {
      const msgQuery = query(collection(db, `meetings/${p.meetingId}/messages`), orderBy('timestamp', 'desc'));
      return onSnapshot(msgQuery, (snapshot) => {
        if (snapshot.empty) return;
        const latestMsg = snapshot.docs[0].data();
        if (latestMsg.senderId !== user.id && activeChatId !== p.meetingId) {
          setUnreadMeetingIds(prev => new Set(prev).add(p.meetingId));
        }
      });
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [user?.id, participations, activeChatId]);

  useEffect(() => {
    if (activeChatId && unreadMeetingIds.has(activeChatId)) {
      setUnreadMeetingIds(prev => {
        const next = new Set(prev);
        next.delete(activeChatId);
        return next;
      });
    }
  }, [activeChatId, unreadMeetingIds]);

  const visibleMeetings = meetings.filter(m => {
    if (!user) return true;
    const isBlockedByMe = user.blockedUserIds?.includes(m.hostId);
    const isBlockingMe = blockedBy.includes(m.hostId);
    return !isBlockedByMe && !isBlockingMe;
  });

  const handleEmailAuthComplete = async (data: { email: string; age: number; isNewUser: boolean; existingUser?: UserProfile; needsVerification?: boolean }) => {
    setTempProfile(prev => ({ ...prev, email: data.email, age: data.age }));
    
    if (data.needsVerification) {
      setView('VERIFY_EMAIL');
      return;
    }

    if (!data.isNewUser && data.existingUser) {
      setUser(data.existingUser);
      setView('HOME');
      return;
    }

    setView('PROFILE_SETUP');
  };

  const handleProfileSetupComplete = async (profileData: Partial<UserProfile>) => {
    if (!auth.currentUser) return;

    const initialUserData = {
      id: auth.currentUser.uid,
      email: tempProfile.email || auth.currentUser.email || '',
      nickname: profileData.nickname || '익명',
      age: tempProfile.age || 35,
      isCertified: false,
      isSubscribed: false,
      joinedAt: new Date().toISOString(), // 가입일시 기록
      interests: profileData.interests || [],
      bio: profileData.bio || '',
      location: profileData.location || '서울',
      followerCount: 0,
      followingCount: 0,
      blockedUserIds: []
    };

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), initialUserData);
      setUser(initialUserData as UserProfile);
      setView('WELCOME');
    } catch (e: any) {
      console.error("Error adding user to Firestore:", e);
      alert("프로필 저장 중 오류가 발생했습니다.");
    }
  };

  const handleBlockUser = async (targetId: string) => {
    if (!user || user.id === targetId) return;
    if (!window.confirm("이 사용자를 차단하시겠습니까? 차단된 사용자의 모임과 메시지가 더 이상 보이지 않습니다.")) return;
    
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        blockedUserIds: arrayUnion(targetId)
      });
    } catch (e) {
      console.error("Block error:", e);
      alert("차단 처리 중 오류가 발생했습니다.");
    }
  };

  const handleUnblockUser = async (targetId: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        blockedUserIds: arrayRemove(targetId)
      });
    } catch (e) {
      console.error("Unblock error:", e);
      alert("차단 해제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!window.confirm("정말로 이 모임을 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.")) return;
    try {
      const q = query(collection(db, 'participations'), where('meetingId', '==', meetingId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, 'meetings', meetingId));
      setView('HOME');
      alert("모임이 삭제되었습니다.");
    } catch (e) {
      console.error("Delete meeting error:", e);
      alert("모임 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateMeeting = async (meetingId: string, updatedData: Partial<Meeting>) => {
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      await updateDoc(meetingRef, updatedData);
      setSelectedMeetingId(meetingId);
      setView('MEETING_DETAIL');
      alert("모임 정보가 수정되었습니다.");
    } catch (e) {
      console.error("Update meeting error:", e);
      alert("모임 수정 중 오류가 발생했습니다.");
    }
  };

  const handleToggleLike = async (meetingId: string) => {
    if (!user) { setView('AUTH_EMAIL'); return; }
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      const meetingSnap = await getDoc(meetingRef);
      if (meetingSnap.exists()) {
        const meetingData = meetingSnap.data() as Meeting;
        const likedUserIds = meetingData.likedUserIds || [];
        if (likedUserIds.includes(user.id)) {
          await updateDoc(meetingRef, {
            likedUserIds: arrayRemove(user.id)
          });
        } else {
          await updateDoc(meetingRef, {
            likedUserIds: arrayUnion(user.id)
          });
        }
      }
    } catch (e) {
      console.error("Toggle like error:", e);
    }
  };

  const handleWithdrawal = async () => {
    if (!user || !auth.currentUser) return;
    const confirmWithdrawal = window.confirm("정말로 탈퇴하시겠습니까?\n작성하신 모임과 프로필 정보가 모두 삭제되며 복구할 수 없습니다.");
    if (!confirmWithdrawal) return;

    try {
      const currentUserId = user.id;
      const hostMeetingsQuery = query(collection(db, 'meetings'), where('hostId', '==', currentUserId));
      const hostMeetingsSnapshot = await getDocs(hostMeetingsQuery);
      
      for (const mDoc of hostMeetingsSnapshot.docs) {
        const meetingId = mDoc.id;
        const pQuery = query(collection(db, 'participations'), where('meetingId', '==', meetingId));
        const pSnapshot = await getDocs(pQuery);
        await Promise.all(pSnapshot.docs.map(d => deleteDoc(d.ref)));
        await deleteDoc(mDoc.ref);
      }

      const userParticipationsQuery = query(collection(db, 'participations'), where('userId', '==', currentUserId));
      const userParticipationsSnapshot = await getDocs(userParticipationsQuery);
      
      for (const pDoc of userParticipationsSnapshot.docs) {
        const mId = pDoc.data().meetingId;
        const meetingRef = doc(db, 'meetings', mId);
        const meetingSnap = await getDoc(meetingRef);
        if (meetingSnap.exists()) {
          await updateDoc(meetingRef, { currentParticipants: increment(-1) });
        }
        await deleteDoc(pDoc.ref);
      }

      await deleteDoc(doc(db, 'users', currentUserId));
      try {
        await deleteUser(auth.currentUser);
      } catch (authErr: any) {
        if (authErr.code === 'auth/requires-recent-login') {
          alert("보안을 위해 다시 로그인한 후 탈퇴를 진행해 주세요.");
          await signOut(auth);
          setView('AUTH_EMAIL');
          return;
        }
        throw authErr;
      }
      setUser(null);
      setView('HOME');
      alert("탈퇴 처리가 정상적으로 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
    } catch (e: any) {
      console.error("Withdrawal error: ", e);
      alert("탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleUpdateProfile = async (data: { nickname: string; bio: string; interests: string[] }) => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, data);
        setUser({ ...user, ...data });
      } catch (e) {
        console.error("Error updating profile: ", e);
        throw e;
      }
    }
  };

  const handleJoinMeeting = async (meetingId: string) => {
    if (!user) { setView('AUTH_EMAIL'); return; }
    
    // 구독 여부 체크
    if (!user.isSubscribed) {
      setSelectedMeetingId(meetingId);
      setView('SUBSCRIPTION');
      return;
    }

    const targetMeeting = meetings.find(m => m.id === meetingId);
    if (!targetMeeting) return;
    if (targetMeeting.currentParticipants >= targetMeeting.capacity) {
      alert("이미 정원이 가득 찬 모임입니다.");
      return;
    }
    
    const isAlreadyJoined = participations.some(p => p.meetingId === meetingId);
    if (!isAlreadyJoined) {
      try {
        await addDoc(collection(db, 'participations'), {
          userId: user.id,
          meetingId: meetingId,
          isPrivate: false,
          joinedAt: new Date()
        });
        const meetingRef = doc(db, 'meetings', meetingId);
        await updateDoc(meetingRef, { currentParticipants: increment(1) });
      } catch (e) { console.error(e); }
    }
    setActiveChatId(meetingId);
    setView('CHAT_ROOM');
  };

  const handleSubscribeComplete = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { isSubscribed: true });
      setUser({ ...user, isSubscribed: true });
      if (selectedMeetingId) {
        setView('MEETING_DETAIL');
      } else {
        setView('HOME');
      }
    } catch (e) {
      console.error(e);
      alert("구독 처리 중 오류가 발생했습니다.");
    }
  };

  const handleKickMembers = async (meetingId: string, userIds: string[]) => {
    if (userIds.length === 0) return;
    try {
      for (const uid of userIds) {
        const q = query(collection(db, 'participations'), where('meetingId', '==', meetingId), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }
      const meetingRef = doc(db, 'meetings', meetingId);
      await updateDoc(meetingRef, { currentParticipants: increment(-userIds.length) });
    } catch (e) { console.error(e); alert("내보내기 실패"); }
  };

  const handleCreateMeetingComplete = async (meetingData: Meeting) => {
    try {
      const { id, ...dataWithoutId } = meetingData;
      await setDoc(doc(db, 'meetings', id), dataWithoutId);
      await addDoc(collection(db, 'participations'), {
        userId: user!.id,
        meetingId: id,
        isPrivate: false,
        joinedAt: new Date()
      });
      setView('HOME');
    } catch (e) { console.error(e); throw e; }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setView('HOME');
  };

  const renderView = () => {
    const handleEmailVerification = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as UserProfile);
        setView('HOME');
      } else {
        setView('PROFILE_SETUP');
      }
    };

    switch (view) {
      case 'AUTH_EMAIL': return <EmailAuthView onComplete={handleEmailAuthComplete} onCancel={() => setView('HOME')} />;
      case 'VERIFY_EMAIL': return <EmailVerificationView email={tempProfile.email || auth.currentUser?.email || ''} onVerified={handleEmailVerification} onCancel={() => setView('HOME')} />;
      case 'PROFILE_SETUP': return <ProfileSetupView onComplete={handleProfileSetupComplete} />;
      case 'WELCOME': return <WelcomeView onFinish={() => setView('HOME')} />;
      case 'HOME': return <HomeView user={user} meetings={visibleMeetings} onSelectMeeting={(id) => { setActiveChatId(null); setSelectedMeetingId(id); setView('MEETING_DETAIL'); }} onToggleLike={handleToggleLike} onCreateClick={() => { if (!user) setView('AUTH_EMAIL'); else setView('CREATE_MEETING'); }} />;
      case 'MEETING_DETAIL': {
        const m = visibleMeetings.find(meeting => meeting.id === selectedMeetingId);
        return m ? <MeetingDetailView user={user} meeting={m} isJoined={participations.some(p => p.meetingId === m.id)} onJoin={handleJoinMeeting} onToggleLike={handleToggleLike} onKickMembers={handleKickMembers} onBlockUser={handleBlockUser} onUnblockUser={handleUnblockUser} onDeleteMeeting={handleDeleteMeeting} onEditMeeting={() => setView('EDIT_MEETING')} onBack={() => activeChatId ? setView('CHAT_ROOM') : setView('HOME')} /> : null;
      }
      case 'CREATE_MEETING': return <CreateMeetingView user={user!} onComplete={handleCreateMeetingComplete} onBack={() => setView('HOME')} />;
      case 'EDIT_MEETING': {
        const m = visibleMeetings.find(meeting => meeting.id === selectedMeetingId);
        return m ? <EditMeetingView meeting={m} onComplete={(data) => handleUpdateMeeting(m.id, data)} onBack={() => setView('MEETING_DETAIL')} /> : null;
      }
      case 'MY_PAGE': return <MyPageView user={user} participations={participations} allMeetings={visibleMeetings} onToggleVisibility={() => {}} onLogout={handleLogout} onWithdrawal={handleWithdrawal} onUpdateProfile={handleUpdateProfile} onSelectMeeting={(id) => { setSelectedMeetingId(id); setView('MEETING_DETAIL'); }} onUnblockUser={handleUnblockUser} />;
      case 'CHATTING': return <MessagesView userParticipations={participations} allMeetings={visibleMeetings} unreadMeetingIds={unreadMeetingIds} onSelectChat={(id) => { setActiveChatId(id); setView('CHAT_ROOM'); }} />;
      case 'CHAT_ROOM': {
        const m = visibleMeetings.find(meeting => meeting.id === activeChatId);
        return user && m ? <ChatRoomView user={user} meeting={m} onBack={() => setView('CHATTING')} onShowDetail={(id) => { setSelectedMeetingId(id); setView('MEETING_DETAIL'); }} onBlockUser={handleBlockUser} /> : null;
      }
      case 'SUBSCRIPTION': return <SubscriptionView onComplete={handleSubscribeComplete} onBack={() => setView('MEETING_DETAIL')} />;
      default: return <HomeView user={user} meetings={visibleMeetings} onSelectMeeting={(id) => { setSelectedMeetingId(id); setView('MEETING_DETAIL'); }} onToggleLike={handleToggleLike} onCreateClick={() => setView('CREATE_MEETING')} />;
    }
  };

  const showHeader = ['HOME', 'MEETING_DETAIL', 'MY_PAGE', 'CHATTING', 'CREATE_MEETING', 'EDIT_MEETING', 'AUTH_EMAIL', 'VERIFY_EMAIL', 'PROFILE_SETUP', 'SUBSCRIPTION'].includes(view);
  const showNav = ['HOME', 'MY_PAGE', 'CHATTING'].includes(view);
  const isChatRoom = view === 'CHAT_ROOM';

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white relative border-x border-slate-100 shadow-sm overflow-hidden">
      {showHeader && <Header title={view === 'HOME' ? '비혼뒤맑음' : ''} showBack={['MEETING_DETAIL', 'CREATE_MEETING', 'EDIT_MEETING', 'AUTH_EMAIL', 'VERIFY_EMAIL', 'PROFILE_SETUP', 'SUBSCRIPTION'].includes(view)} onBack={() => {
        if (view === 'SUBSCRIPTION') setView('MEETING_DETAIL');
        else if (activeChatId) setView('CHAT_ROOM');
        else setView('HOME');
      }} />}
      <main className={`flex-1 flex flex-col ${isChatRoom ? 'overflow-hidden' : 'overflow-y-auto'} ${showNav ? 'pb-32' : isChatRoom ? 'pb-0' : 'pb-16'}`}>
        <div className={`page-enter ${isChatRoom ? 'h-full' : ''}`}>{renderView()}</div>
      </main>
      {showNav && <NavigationBar currentView={view} onViewChange={setView} hasChatBadge={unreadMeetingIds.size > 0} />}
    </div>
  );
};

export default App;
