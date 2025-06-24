import { DiaryCard } from "@/components/diary-card"
import { mockDiaryEntries, mockUsers } from "@/lib/data"
import type { User } from "@/lib/definitions"

export default function MyDiaryPage() {
  // In a real app, you'd fetch entries for the currently logged-in user
  const loggedInUserId = '1';
  const myEntries = mockDiaryEntries
    .filter(entry => entry.userId === loggedInUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const currentUser = mockUsers.find(user => user.id === loggedInUserId) as User;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl font-headline">나의 일기</h1>
          <p className="text-muted-foreground">내가 기록한 마음의 발자취를 돌아보세요.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {myEntries.length > 0 ? (
          myEntries.map(entry => (
            <DiaryCard key={entry.id} entry={entry} author={currentUser} />
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">아직 작성한 일기가 없어요.</p>
        )}
      </div>
    </>
  )
}
