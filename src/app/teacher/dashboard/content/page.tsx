'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DiaryCard } from "@/components/diary-card"
import { mockDiaryEntries, mockUsers } from "@/lib/data"
import type { DiaryEntry, User, Comment } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ContentManagementPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>(mockDiaryEntries)
  const { toast } = useToast()

  useEffect(() => {
    const storedEntriesStr = localStorage.getItem('diaryEntries');
    const initialEntries = storedEntriesStr ? JSON.parse(storedEntriesStr) : mockDiaryEntries;
    setEntries(initialEntries);
  }, []);

  const updateAndStoreEntries = (updatedEntries: DiaryEntry[]) => {
    setEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
  }

  const handleComment = (entryId: string, newComment: Comment) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return { ...entry, comments: [...entry.comments, newComment] };
      }
      return entry;
    });
    updateAndStoreEntries(updatedEntries);
  };

  const handleLikeComment = (entryId: string, commentId: string) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          comments: entry.comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, likes: comment.likes + 1 };
            }
            return comment;
          }),
        };
      }
      return entry;
    });
    updateAndStoreEntries(updatedEntries);
  };

  const handleDeleteComment = (entryId: string, commentId: string) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          comments: entry.comments.filter(comment => comment.id !== commentId),
        };
      }
      return entry;
    });
    updateAndStoreEntries(updatedEntries);
    toast({
        title: "성공",
        description: "댓글이 삭제되었습니다."
    });
  };

  const findUserById = (userId: string): User | undefined => {
    return mockUsers.find(user => user.id === userId);
  }

  return (
    <div className="min-h-screen bg-background">
         <header className="px-4 lg:px-6 h-16 flex items-center border-b">
            <Button variant="outline" size="icon" asChild className="mr-4">
                <Link href="/teacher/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">뒤로가기</span>
                </Link>
            </Button>
            <div className="flex-1">
                <h1 className="text-xl font-semibold font-headline">콘텐츠 관리</h1>
                <p className="text-sm text-muted-foreground">학생들의 모든 맘풍선과 댓글을 확인하고 관리합니다.</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                    <LogOut className="h-5 w-5"/>
                    <span className="sr-only">로그아웃</span>
                </Link>
            </Button>
        </header>
        <main className="p-4 sm:p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(entry => (
                <DiaryCard 
                    key={entry.id} 
                    entry={entry} 
                    author={findUserById(entry.userId)} 
                    onComment={handleComment}
                    onLikeComment={handleLikeComment}
                    onDeleteComment={handleDeleteComment}
                    isTeacherView={true} 
                />
                ))}
            </div>
        </main>
    </div>
  )
}
