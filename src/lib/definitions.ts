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
  likes: number;
  avatarUrl?: string;
  createdAt: string | Timestamp; // Allow both for client/server
};

export type DiaryEntry = {
  id: string;
  userId: string;
  content: string;
  isPublic: boolean;
  createdAt: string | Timestamp; // Allow both for client/server
  dominantEmotion: string;
  suggestedResponses: string[];
  likes: number;
  comments: Comment[];
  isPinned?: boolean;
  likedBy?: string[]; // Array of user IDs who liked the entry
};
