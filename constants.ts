
import { Meeting } from './types';

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: '1',
    title: '주말 아침, 한강 러닝 & 스트레칭',
    category: '운동',
    date: '2025-06-15 10:00',
    location: '서울 영등포구 여의도',
    capacity: 6,
    currentParticipants: 3,
    description: '맑은 공기 마시며 함께 뛰고 가볍게 스트레칭해요. 초보자도 속도 맞춰서 달립니다!',
    host: '민트초코',
    hostId: 'user_201',
    isCertifiedOnly: false,
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600',
    moodTags: ['오운완', '건강한', '러닝크루'],
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    title: '동네 보드게임 카페 정복기',
    category: '소셜게임',
    date: '2025-06-16 14:00',
    location: '서울 관악구 샤로수길',
    capacity: 4,
    currentParticipants: 2,
    description: '승부욕보다는 즐겁게 웃고 떠들며 보드게임 하실 분 구합니다. 전략 게임 위주로 해봐요!',
    host: '루미',
    hostId: 'user_202',
    isCertifiedOnly: false,
    imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=600',
    moodTags: ['웃음보장', '두뇌회전', '취향공유'],
    createdAt: '2024-01-02T10:00:00Z'
  },
  {
    id: '3',
    title: '성수동 팝업스토어 & 전시 투어',
    category: '전시',
    date: '2025-06-20 13:00',
    location: '서울 성동구 성수동',
    capacity: 5,
    currentParticipants: 4,
    description: '요즘 핫한 전시랑 팝업 같이 구경해요. 감각적인 전시 보고 영감 나눠요!',
    host: '전시요정',
    hostId: 'user_203',
    isCertifiedOnly: true,
    imageUrl: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&q=80&w=600',
    moodTags: ['감각적인', '영감기록', '인증멤버'],
    createdAt: '2024-01-03T10:00:00Z'
  },
  {
    id: '4',
    title: '비혼을 위한 경제적 자유 스터디',
    category: '스터디/커리어',
    date: '2025-06-22 11:00',
    location: '서울 강남구 강남역',
    capacity: 8,
    currentParticipants: 5,
    description: '혼자서도 든든한 노후를 위해 재테크와 커리어 정보를 공유하는 모임입니다.',
    host: '커리어우먼',
    hostId: 'user_205',
    isCertifiedOnly: true,
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
    moodTags: ['갓생살기', '재테크', '정보공유'],
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: '5',
    title: '심야 서점 조용한 독서 시간',
    category: '독서',
    date: '2025-06-19 20:00',
    location: '서울 서대문구 연희동',
    capacity: 4,
    currentParticipants: 2,
    description: '각자 읽고 싶은 책을 가져와서 조용히 읽고 짧게 감상을 나눕니다.',
    host: '북웜',
    hostId: 'user_206',
    isCertifiedOnly: false,
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    moodTags: ['몰입', '차분한', '책읽는밤'],
    createdAt: '2024-01-06T10:00:00Z'
  },
  {
    id: '6',
    title: '연남동 숨은 디저트 맛집 탐방',
    category: '맛집/카페',
    date: '2025-06-18 19:30',
    location: '서울 마포구 연남동',
    capacity: 4,
    currentParticipants: 1,
    description: '유명한 디저트 카페 투어해요. 달콤한 간식과 함께 소소하게 수다 떨어요.',
    host: '맥주조아',
    hostId: 'user_204',
    isCertifiedOnly: true,
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600',
    moodTags: ['힐링', '달콤한', '미식가'],
    createdAt: '2024-01-04T10:00:00Z'
  }
];

export const INTEREST_OPTIONS = [
  '산책/등산', '보드게임', '전시회', '원데이클래스', '사진/출사', '반려동물', '카페투어', '영화/넷플릭스', '맛집탐방', '러닝'
];

export const CATEGORIES = ['전체', '소셜게임', '전시', '스터디/커리어', '독서', '맛집/카페', '운동'];
