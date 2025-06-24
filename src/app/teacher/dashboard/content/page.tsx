'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, LogOut } from "lucide-react"
import { DiaryCard } from "@/components/diary-card"
import { mockDiaryEntries, mockUsers } from "@/lib/data"
import type { DiaryEntry, User, Comment } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ContentManagementPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const storedEntriesStr = localStorage.getItem('diaryEntries');
    setEntries(storedEntriesStr ? JSON.parse(storedEntriesStr) : mockDiaryEntries);
  }, []);

  const handleComment = (entryId: string, newComment: Comment) => {
    setEntries(currentEntries => {
        const updatedEntries = currentEntries.map(entry => {
          if (entry.id === entryId) {
            return { ...entry, comments: [...entry.comments, newComment] };
          }
          return entry;
        });
        localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
        return updatedEntries;
    });
  };

  const handleLikeEntry = (entryId: string, action: 'like' | 'unlike') => {
    setEntries(currentEntries => {
        const updatedEntries = currentEntries.map(entry => {
          if (entry.id === entryId) {
            const newLikes = action === 'like' ? entry.likes + 1 : Math.max(0, entry.likes - 1);
            return { ...entry, likes: newLikes };
          }
          return entry;
        });
        localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
        return updatedEntries;
    });
  };

  const handleLikeComment = (entryId: string, commentId: string, action: 'like' | 'unlike') => {
    setEntries(currentEntries => {
        const newEntries = [...currentEntries];
        const entryIndex = newEntries.findIndex(e => e.id === entryId);
        if (entryIndex === -1) return currentEntries;

        const entryToUpdate = { ...newEntries[entryIndex] }; // Deep copy entry
        const commentIndex = entryToUpdate.comments.findIndex(c => c.id === commentId);
        if (commentIndex === -1) return currentEntries;

        const newComments = [...entryToUpdate.comments]; // Copy comments array
        const commentToUpdate = { ...newComments[commentIndex] }; // Deep copy comment
        const newLikes = action === 'like' ? commentToUpdate.likes + 1 : Math.max(0, commentToUpdate.likes - 1);
        newComments[commentIndex] = { ...commentToUpdate, likes: newLikes };
        
        const updatedEntry = { ...entryToUpdate, comments: newComments };
        newEntries[entryIndex] = updatedEntry;

        localStorage.setItem('diaryEntries', JSON.stringify(newEntries));
        return newEntries;
    });
  };

  const handleDeleteComment = (entryId: string, commentId: string) => {
    setEntries(currentEntries => {
        const newEntries = [...currentEntries];
        const entryIndex = newEntries.findIndex(e => e.id === entryId);
        if (entryIndex === -1) return currentEntries;

        const entryToUpdate = { ...newEntries[entryIndex] };
        const newComments = [...entryToUpdate.comments];
        const commentIndex = newComments.findIndex(c => c.id === commentId);
        
        if (commentIndex === -1) return currentEntries;
        
        newComments.splice(commentIndex, 1);

        const updatedEntry = { ...entryToUpdate, comments: newComments };
        newEntries[entryIndex] = updatedEntry;
        
        localStorage.setItem('diaryEntries', JSON.stringify(newEntries));
        toast({
            title: "성공",
            description: "댓글이 삭제되었습니다."
        });
        return newEntries;
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
                    onLikeEntry={handleLikeEntry}
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
