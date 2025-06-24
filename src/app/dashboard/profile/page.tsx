import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { mockUsers } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
  // In a real app, you'd fetch the current user's data
  const user = mockUsers[0];

  return (
    <>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">프로필</h1>
        <Card>
            <CardHeader>
                <CardTitle>내 정보</CardTitle>
                <CardDescription>계정 정보를 확인하고 수정할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="grade">학년</Label>
                        <Select defaultValue={String(user.grade)}>
                            <SelectTrigger id="grade">
                                <SelectValue placeholder="학년" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1학년</SelectItem>
                                <SelectItem value="2">2학년</SelectItem>
                                <SelectItem value="3">3학년</SelectItem>
                                <SelectItem value="4">4학년</SelectItem>
                                <SelectItem value="5">5학년</SelectItem>
                                <SelectItem value="6">6학년</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="class">반</Label>
                        <Input id="class" defaultValue={user.class} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="studentId">번호</Label>
                        <Input id="studentId" defaultValue={user.studentId} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input id="name" defaultValue={user.name} disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input id="email" defaultValue={user.email} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nickname">별명</Label>
                    <Input id="nickname" defaultValue={user.nickname} />
                </div>
                <Button>저장하기</Button>
            </CardContent>
        </Card>
    </>
  )
}
