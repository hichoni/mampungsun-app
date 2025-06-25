import { type Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  nickname: string;
  grade: number;
  class: number;
  studentId: number;
  pin: string;
  isApproved: boolean;
  avatarUrl?: string;
};

export type Comment = {
  id: string;
  userId: string;
  nickname: string;
  comment: string;
  createdAt: string | Timestamp;
  avatarUrl?: string;
};

export type DiaryEntry = {
  id: string;
  userId: string;
  content: string;
  isPublic: boolean;
  createdAt: string | Timestamp;
  dominantEmotion: string;
  suggestedResponses: string[];
  likes: number;
  comments: Comment[];
  isPinned?: boolean;
  likedBy: string[]; // Array of user IDs who liked the entry
  visitCount: number;
};
