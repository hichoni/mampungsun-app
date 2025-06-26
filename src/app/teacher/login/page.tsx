'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
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
import { ArrowLeft } from "lucide-react"
import { auth, isFirebaseConfigured } from "@/lib/firebase"
import { signInAnonymously } from "firebase/auth"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const MASTER_ID = "master"
const MASTER_PASSWORD = "password123"

export default function TeacherLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [masterId, setMasterId] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (masterId === MASTER_ID && password === MASTER_PASSWORD) {
      try {
        if (!auth) {
            toast({
                variant: "destructive",
                title: "Firebase 설정 오류",
                description: "인증 설정이 올바르지 않습니다. README 파일을 참고하여 .env.local 파일을 다시 확인해주세요."
            });
            return;
        }
        
        await signInAnonymously(auth);
        localStorage.setItem('mampungsun_user_id', 'teacher-master');
        toast({
            title: "로그인 성공",
            description: "교사 대시보드로 이동합니다."
        })
        router.push('/teacher/dashboard')
      } catch (error: any) {
        console.error("Anonymous sign-in failed", error);
        if (error.code === 'auth/configuration-not-found') {
             toast({
                variant: "destructive",
                title: "Firebase 설정 오류",
                description: "환경 변수(.env.local)에 올바른 Firebase 설정 값이 입력되었는지 확인해주세요."
            });
        } else {
            toast({
              variant: "destructive",
              title: "인증 실패",
              description: "Firebase 인증에 실패했습니다. 잠시 후 다시 시도해주세요."
            });
        }
        return;
      }
    } else {
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: "아이디 또는 비밀번호가 올바르지 않습니다."
      })
    }
  }

  if (!isFirebaseConfigured) {
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
                            <p className="mt-2">프로젝트의 `README.md` 파일을 참고하여 설정을 완료해주세요.</p>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    )
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
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">비밀번호</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
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
