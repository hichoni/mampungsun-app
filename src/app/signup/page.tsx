import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BalloonIcon } from "@/components/icons"

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <Link href="/" className="flex items-center justify-center" prefetch={false}>
                    <BalloonIcon className="h-10 w-10 text-primary" />
                </Link>
            </div>
          <CardTitle className="text-2xl font-headline">학생 회원가입</CardTitle>
          <CardDescription>
            정보를 입력하여 맘톡톡 계정을 만드세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade">학년</Label>
                <Select>
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
              <div className="grid gap-2">
                <Label htmlFor="class">반</Label>
                <Input id="class" placeholder="예: 3" type="number" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="studentId">번호</Label>
                <Input id="studentId" placeholder="예: 12" type="number" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" placeholder="김민준" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nickname">별명 (맘풍선에 표시돼요)</Label>
              <Input id="nickname" placeholder="행복한 토끼" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              계정 만들기
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="underline" prefetch={false}>
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
