import type { User, DiaryEntry } from './definitions';

export const mockUsers: User[] = [
  // Grade 1 (up to 7 classes)
  {
    id: '101', name: '김민준', nickname: '행복한 토끼', grade: 1, class: 2, studentId: 3, pin: '1234', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('토')}`,
    loginCount: 15, lastLoginAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString(), loginHistory: [new Date(Date.now() - 1000 * 3600 * 2).toISOString(), new Date(Date.now() - 1000 * 3600 * 26).toISOString()]
  },
  {
    id: '102', name: '이서연', nickname: '꿈꾸는 돌고래', grade: 1, class: 3, studentId: 12, pin: '5678', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('돌')}`,
    loginCount: 22, lastLoginAt: new Date(Date.now() - 1000 * 3600 * 8).toISOString(), loginHistory: [new Date(Date.now() - 1000 * 3600 * 8).toISOString()]
  },
  {
    id: '103', name: '박지훈', nickname: '슬기로운 거북이', grade: 1, class: 7, studentId: 15, pin: '1111', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('거')}`,
    loginCount: 5, lastLoginAt: new Date(Date.now() - 1000 * 3600 * 72).toISOString(), loginHistory: []
  },
  {
    id: '4', name: '김테스트', nickname: '테스트다람쥐', grade: 1, class: 1, studentId: 1, pin: '0000', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('테')}`,
    loginCount: 1, lastLoginAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), loginHistory: [new Date(Date.now() - 1000 * 60 * 5).toISOString()]
  },

  // Grade 2 (up to 6 classes)
  {
    id: '201', name: '최수빈', nickname: '밝은 해바라기', grade: 2, class: 1, studentId: 5, pin: '2222', isApproved: false, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('해')}`,
    loginCount: 0, loginHistory: []
  },
  {
    id: '202', name: '정다은', nickname: '친절한 코알라', grade: 2, class: 6, studentId: 3, pin: '3333', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('코')}`,
    loginCount: 30, lastLoginAt: new Date(Date.now() - 1000 * 3600 * 24 * 5).toISOString(), loginHistory: []
  },

  // Grade 3 (up to 5 classes)
  {
    id: '301', name: '강현우', nickname: '씩씩한 호랑이', grade: 3, class: 5, studentId: 21, pin: '4444', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('호')}`,
    loginCount: 8, lastLoginAt: new Date(Date.now() - 1000 * 3600 * 1).toISOString(), loginHistory: []
  },

  // Grade 4 (up to 6 classes)
  {
    id: '401', name: '조아라', nickname: '노래하는 카나리아', grade: 4, class: 6, studentId: 10, pin: '5555', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('카')}`,
    loginCount: 12, loginHistory: []
  },

  // Grade 5 (up to 5 classes)
  {
    id: '501', name: '윤재호', nickname: '지혜로운 부엉이', grade: 5, class: 5, studentId: 8, pin: '6666', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('부')}`,
    loginCount: 3, loginHistory: []
  },

  // Grade 6 (up to 6 classes)
  {
    id: '601', name: '송예진', nickname: '우아한 백조', grade: 6, class: 6, studentId: 19, pin: '7777', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('백')}`,
    loginCount: 18, loginHistory: []
  },

  // AI User
  {
    id: 'ai-cheerer', name: '응원 요정', nickname: '응원 요정', grade: 0, class: 0, studentId: 0, pin: '', isApproved: true, avatarUrl: `https://placehold.co/100x100/FFDAB9/8B4513.png?text=${encodeURIComponent('요')}`,
    loginCount: 0, loginHistory: []
  },

  // Teacher User
  {
    id: 'teacher-master', name: '선생님', nickname: '선생님', grade: -1, class: -1, studentId: -1, pin: 'password123', isApproved: true, avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('샘')}`,
    loginCount: 0, loginHistory: []
  },
];

export const mockDiaryEntries: DiaryEntry[] = [
  {
    id: '101',
    userId: '101',
    content: '오늘 학교에서 친구랑 다퉜다. 너무 속상해서 눈물이 났다. 내가 잘못한 걸까? 마음이 너무 무겁다.',
    isPublic: true,
    createdAt: '2024-05-20T10:00:00Z',
    dominantEmotion: '슬픔',
    suggestedResponses: ['괜찮아, 그럴 수 있어.', '힘내, 내가 옆에 있을게.', '너의 잘못이 아니야.'],
    likes: 12,
    likedBy: ['102', '201', '202'],
    visitCount: 45,
    comments: [
      { id: 'c1', userId: '102', nickname: '꿈꾸는 돌고래', comment: '괜찮아, 그럴 수 있어.', avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('돌')}` }
    ],
    isPinned: false,
  },
  {
    id: '102',
    userId: '102',
    content: '수학 시험을 정말 잘 봤다! 노력한 만큼 결과가 나와서 너무 기쁘다. 하늘을 나는 기분이야!',
    isPublic: true,
    createdAt: '2024-05-21T15:30:00Z',
    dominantEmotion: '기쁨',
    suggestedResponses: ['정말 대단하다!', '네가 자랑스러워.', '노력의 결실이네! 축하해.'],
    likes: 25,
    likedBy: ['101', '201'],
    visitCount: 88,
    comments: [
      { id: 'c2', userId: '101', nickname: '행복한 토끼', comment: '정말 대단하다!', avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('토')}` },
      { id: 'c3', userId: '201', nickname: '밝은 해바라기', comment: '네가 자랑스러워.', avatarUrl: `https://placehold.co/100x100/A0D2EB/263238.png?text=${encodeURIComponent('해')}` }
    ],
    isPinned: true,
  },
  {
    id: '103',
    userId: '201',
    content: '내일 있을 발표 때문에 너무 떨린다. 잘할 수 있을지 걱정된다. 실수하면 어떡하지?',
    isPublic: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Make this post 2 hours old for demo
    dominantEmotion: '불안',
    suggestedResponses: ['넌 잘할 수 있어!', '연습한 만큼만 하면 돼.', '실수해도 괜찮아, 누구나 그래.'],
    likes: 0,
    likedBy: [],
    visitCount: 10,
    comments: [],
    isPinned: false,
  },
  {
    id: '104',
    userId: '101',
    content: '오늘은 그냥 그런 날. 특별히 좋은 일도 나쁜 일도 없었다. 일기를 쓸까 말까 고민했다.',
    isPublic: false,
    createdAt: '2024-05-22T18:00:00Z',
    dominantEmotion: '평온',
    suggestedResponses: ['오늘 하루도 수고했어.', '평범한 날도 소중해.', '내일은 더 좋은 일이 있을 거야.'],
    likes: 0,
    likedBy: [],
    visitCount: 2,
    comments: [],
    isPinned: false,
  },
  {
    id: '105',
    userId: '4',
    content: '안녕하세요! 테스트 계정으로 처음 글을 남겨봐요. 모두 반가워요!',
    isPublic: true,
    createdAt: '2024-05-23T11:00:00Z',
    dominantEmotion: '기쁨',
    suggestedResponses: ['만나서 반가워!', '환영합니다!', '앞으로 자주 만나요!'],
    likes: 5,
    likedBy: [],
    visitCount: 23,
    comments: [],
    isPinned: false,
  },
];
