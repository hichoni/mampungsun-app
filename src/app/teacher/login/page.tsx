
'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState, useTransition } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { auth, isFirebaseConfigured } from "@/lib/firebase"
import { signInAnonymously } from "firebase/auth"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const MASTER_ID = "master"
const MASTER_PASSWORD = "password123"

function FirebaseNotConfigured() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive">설정 필요</CardTitle>
          <CardDescription>앱을 사용하기 전에 Firebase 설정이 필요합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Firebase 미설정</AlertTitle>
            <AlertDescription>
              <p>Firestore 데이터베이스 연동을 위한 환경 변수 설정이 필요합니다.</p>
              <p className="mt-2">프로젝트의 `README.md` 파일을 참고하여 `.env.local` 파일 설정을 완료해주세요.</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TeacherLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [masterId, setMasterId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, startLoggingIn] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ variant: "destructive", title: "인증 서비스 오류", description: "Firebase 인증이 올바르게 설정되지 않았습니다. 관리자에게 문의하세요." });
      return;
    }
    
    if (masterId === MASTER_ID && password === MASTER_PASSWORD) {
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
                console.error("Anonymous sign-in failed", error);
                if (error.code === 'auth/operation-not-allowed') {
                    toast({
                      variant: "destructive",
                      title: "Firebase 설정 오류",
                      description: "익명 로그인이 활성화되지 않았을 수 있습니다. Firebase 콘솔의 Authentication > Sign-in method 탭에서 익명 로그인을 활성화해주세요.",
                      duration: 10000,
                    });
                } else {
                    toast({
                      variant: "destructive",
                      title: "인증 실패",
                      description: "Firebase 인증에 실패했습니다. 잠시 후 다시 시도해주세요."
                    });
                }
            }
        });
    } else {
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: "아이디 또는 비밀번호가 올바르지 않습니다."
      })
    }
  }

  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
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
