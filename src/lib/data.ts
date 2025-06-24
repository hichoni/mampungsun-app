import type { User, DiaryEntry } from './definitions';

export const mockUsers: User[] = [
  { id: '1', name: '김민준', nickname: '행복한 토끼', grade: 1, class: 2, studentId: 3, email: 'minjun@example.com' },
  { id: '2', name: '이서연', nickname: '꿈꾸는 돌고래', grade: 1, class: 3, studentId: 12, email: 'seoyeon@example.com' },
  { id: '3', name: '박하은', nickname: '용감한 사자', grade: 2, class: 1, studentId: 5, email: 'haeun@example.com' },
];

export const mockDiaryEntries: DiaryEntry[] = [
  {
    id: '101',
    userId: '1',
    content: '오늘 학교에서 친구랑 다퉜다. 너무 속상해서 눈물이 났다. 내가 잘못한 걸까? 마음이 너무 무겁다.',
    isPublic: true,
    createdAt: '2024-05-20T10:00:00Z',
    dominantEmotion: '슬픔',
    suggestedResponses: ['괜찮아, 그럴 수 있어.', '힘내, 내가 옆에 있을게.', '너의 잘못이 아니야.'],
    likes: 12,
    comments: [
      { userId: '2', nickname: '꿈꾸는 돌고래', comment: '괜찮아, 그럴 수 있어.' }
    ],
  },
  {
    id: '102',
    userId: '2',
    content: '수학 시험을 정말 잘 봤다! 노력한 만큼 결과가 나와서 너무 기쁘다. 하늘을 나는 기분이야!',
    isPublic: true,
    createdAt: '2024-05-21T15:30:00Z',
    dominantEmotion: '기쁨',
    suggestedResponses: ['정말 대단하다!', '네가 자랑스러워.', '노력의 결실이네! 축하해.'],
    likes: 25,
    comments: [
      { userId: '1', nickname: '행복한 토끼', comment: '정말 대단하다!' },
      { userId: '3', nickname: '용감한 사자', comment: '네가 자랑스러워.' }
    ],
  },
  {
    id: '103',
    userId: '3',
    content: '내일 있을 발표 때문에 너무 떨린다. 잘할 수 있을지 걱정된다. 실수하면 어떡하지?',
    isPublic: true,
    createdAt: '2024-05-22T09:00:00Z',
    dominantEmotion: '불안',
    suggestedResponses: ['넌 잘할 수 있어!', '연습한 만큼만 하면 돼.', '실수해도 괜찮아, 누구나 그래.'],
    likes: 8,
    comments: [],
  },
  {
    id: '104',
    userId: '1',
    content: '오늘은 그냥 그런 날. 특별히 좋은 일도 나쁜 일도 없었다. 일기를 쓸까 말까 고민했다.',
    isPublic: false,
    createdAt: '2024-05-22T18:00:00Z',
    dominantEmotion: '평온',
    suggestedResponses: ['오늘 하루도 수고했어.', '평범한 날도 소중해.', '내일은 더 좋은 일이 있을 거야.'],
    likes: 0,
    comments: [],
  },
];
