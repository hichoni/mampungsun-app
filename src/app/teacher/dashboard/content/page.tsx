'use client'

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, LogOut, Loader2 } from "lucide-react"
import { DiaryCard } from "@/components/diary-card"
import type { DiaryEntry, User } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getAllEntries, getAllStudents, deleteEntry, pinEntry } from "@/lib/actions"

export default function ContentManagementPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, startLoading] = useTransition();
  const { toast } = useToast()

  useEffect(() => {
    startLoading(async () => {
        const [fetchedEntries, fetchedUsers] = await Promise.all([
            getAllEntries(),
            getAllStudents()
        ]);
        setEntries(fetchedEntries);
        setAllUsers([...fetchedUsers, { id: 'teacher-master', name: '선생님', nickname: '선생님', grade: -1, class: -1, studentId: -1, pin: '', isApproved: true }]);
    });
  }, []);

  const handlePinEntry = (entryId: string, currentPinStatus: boolean) => {
    startLoading(async () => {
        await pinEntry(entryId, !currentPinStatus);
        setEntries(currentEntries =>
            currentEntries.map(entry =>
                entry.id === entryId ? { ...entry, isPinned: !entry.isPinned } : entry
            )
        );
        toast({
            title: !currentPinStatus ? "상단에 고정됨" : "고정 해제됨",
            description: "맘풍선 순서가 변경되었습니다.",
        });
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    startLoading(async () => {
        await deleteEntry(entryId);
        setEntries(currentEntries => currentEntries.filter(entry => entry.id !== entryId));
        toast({
            title: "성공",
            description: "맘풍선이 삭제되었습니다."
        });
    });
  };

  const findUserById = (userId: string): User | undefined => {
    return allUsers.find(user => user.id === userId);
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
            {isLoading ? (
                 <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {entries
                      .sort((a, b) => Number(b.isPinned ?? false) - Number(a.isPinned ?? false) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map(entry => (
                      <DiaryCard 
                          key={entry.id} 
                          entry={entry} 
                          author={findUserById(entry.userId)} 
                          onDeleteEntry={handleDeleteEntry}
                          onPinEntry={handlePinEntry}
                          isTeacherView={true} 
                      />
                    ))}
                </div>
            )}
        </main>
    </div>
  )
}
