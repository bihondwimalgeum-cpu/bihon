
export interface UserParticipation {
  meetingId: string;
  isPrivate: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  age: number;
  isCertified: boolean;
  joinedAt: string; // 가입일시 추가
  interests: string[];
  bio: string;
  location: string;
  followerCount: number;
  followingCount: number;
  blockedUserIds: string[];
}

export interface Meeting {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  capacity: number;
  currentParticipants: number;
  description: string;
  host: string;
  hostId: string;
  isCertifiedOnly: boolean;
  imageUrl: string;
  moodTags?: string[];
  createdAt?: string;
  kickedUserIds?: string[];
  likedUserIds?: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
}

export type ViewState = 
  | 'HOME' 
  | 'AUTH_EMAIL' 
  | 'VERIFY_EMAIL'
  | 'PROFILE_SETUP' 
  | 'WELCOME' 
  | 'MEETING_DETAIL' 
  | 'MY_PAGE' 
  | 'CHATTING' 
  | 'CHAT_ROOM'
  | 'CREATE_MEETING'
  | 'EDIT_MEETING';
