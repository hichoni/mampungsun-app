'use client'

import { useState, useEffect } from "react"
import { DiaryCard } from "@/components/diary-card"
import { mockDiaryEntries, mockUsers } from "@/lib/data"
import type { DiaryEntry, User } from "@/lib/definitions"

export default function MyDiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>(mockDiaryEntries)
  
  useEffect(() => {
    const storedEntries = localStorage.getItem('diaryEntries');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, [])
  
  // In a real app, you'd fetch entries for the currently logged-in user
  const loggedInUserId = '4'; // Test User ID
  const myEntries = entries
    .filter(entry => entry.userId === loggedInUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const currentUser = mockUsers.find(user => user.id === loggedInUserId);

  const handleComment = (entryId: string, newComment: { userId: string; nickname: string; comment: string }) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          comments: [...entry.comments, newComment],
        };
      }
      return entry;
    });
    setEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
  };


  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl font-headline">나의 맘풍선</h1>
          <p className="text-muted-foreground">내가 날린 마음의 풍선들을 다시 확인해보세요.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {myEntries.length > 0 ? (
          myEntries.map(entry => (
            <DiaryCard key={entry.id} entry={entry} author={currentUser} onComment={handleComment} />
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">아직 날린 맘풍선이 없어요.</p>
        )}
      </div>
    </>
  )
}
