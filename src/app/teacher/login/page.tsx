
'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState, useTransition } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { signInAnonymously } from "firebase/auth"

const MASTER_ID = "master"
const MASTER_PASSWORD = "password123"

export default function TeacherLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [masterId, setMasterId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, startLoggingIn] = useTransition();

  // If auth is null, Firebase isn't configured correctly.
  // This is the most robust way to prevent auth errors.
  if (!auth) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/50">
            <Card className="mx-auto max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-destructive">Firebase 설정 오류</CardTitle>
                    <CardDescription>
                        앱이 Firebase에 연결할 수 없습니다. 환경 변수 설정이 올바른지 확인해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        프로젝트의 `README.md` 파일을 열어 `Step 2: 로컬 개발 환경 설정` 부분을 다시 한번 확인하고, `.env.local` 파일에 올바른 값을 입력했는지 검토해주세요.
                    </p>
                </CardContent>
                 <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/">홈으로 돌아가기</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (masterId !== MASTER_ID || password !== MASTER_PASSWORD) {
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: "아이디 또는 비밀번호가 올바르지 않습니다."
      })
      return;
    }

    startLoggingIn(async () => {
        try {
            await signInAnonymously(auth);
            
            localStorage.setItem('mampungsun_user_id', 'teacher-master');
            toast({
                title: "로그인 성공",
                description: "교사 대시보드로 이동합니다."
            })
            router.push('/teacher/dashboard')

        } catch (error: any) {
            console.error("Teacher login error:", error);
            if (error.code === 'auth/configuration-not-found') {
                 toast({
                    variant: "destructive",
                    title: "Firebase 인증 오류",
                    description: "Firebase 설정 값(API 키 등)이 올바르지 않습니다. .env.local 파일을 다시 확인해주세요.",
                });
            } else if (error.code === 'auth/operation-not-allowed') {
                 toast({
                    variant: "destructive",
                    title: "Firebase 설정 오류",
                    description: "Firebase 콘솔에서 '익명 로그인'을 활성화해주세요.",
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "로그인 중 알 수 없는 오류",
                    description: "잠시 후 다시 시도해주세요.",
                });
            }
        }
    });
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
       <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        홈으로 돌아가기
      </Link>
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">교사 로그인</CardTitle>
            <CardDescription>
                마스터 아이디와 비밀번호를 입력하세요.
                <br />
                <span className="text-xs text-muted-foreground">초기 아이디: master, 비밀번호: password123</span>
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="masterId">마스터 아이디</Label>
              <Input
                id="masterId"
                placeholder="master"
                required
                value={masterId}
                onChange={(e) => setMasterId(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">비밀번호</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              로그인
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            학생이신가요?{" "}
            <Link href="/login" className="underline">
              학생 로그인
            </Link>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
