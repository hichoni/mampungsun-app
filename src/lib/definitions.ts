export type User = {
  id: string;
  name: string;
  nickname: string;
  grade: number;
  class: number;
  studentId: number;
  pin: string;
  isApproved: boolean;
};

export type DiaryEntry = {
  id: string;
  userId: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  dominantEmotion: string;
  suggestedResponses: string[];
  likes: number;
  comments: { userId: string; nickname: string; comment: string }[];
};
