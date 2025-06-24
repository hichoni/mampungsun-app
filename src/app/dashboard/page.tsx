import { DiaryCard } from "@/components/diary-card"
import { mockDiaryEntries, mockUsers } from "@/lib/data"
import type { DiaryEntry, User } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  // In a real app, you would fetch this data
  const publicEntries = mockDiaryEntries.filter(entry => entry.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const findUserById = (userId: string): User | undefined => {
    return mockUsers.find(user => user.id === userId);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl font-headline">모두의 맘풍선</h1>
          <p className="text-muted-foreground">다른 친구들의 마음 이야기를 들어보세요.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {publicEntries.map(entry => (
          <DiaryCard key={entry.id} entry={entry} author={findUserById(entry.userId)} />
        ))}
      </div>
    </>
  )
}
