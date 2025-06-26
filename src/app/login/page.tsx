
'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { useToast } from "@/hooks/use-toast"
import React, { useState, useTransition, useEffect, useMemo } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { loginUser, getAllStudents, recordLogin } from "@/lib/actions"
import { auth, isFirebaseConfigured } from "@/lib/firebase"
import { signInAnonymously } from "firebase/auth"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { User } from "@/lib/definitions"

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

function FirebaseConfigError({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
            <Card className="mx-auto max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-destructive">Firebase 설정 오류</CardTitle>
                    <CardDescription>로그인에 필요한 Firebase 설정에 문제가 있습니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTitle>오류 발생</AlertTitle>
                        <AlertDescription>
                            <p>{message}</p>
                            <p className="mt-2">문제를 해결하려면 프로젝트의 `README.md` 파일을 참고하여 `.env.local` 파일 설정을 확인하거나, Firebase 콘솔에서 '익명 로그인'이 활성화되어 있는지 확인해주세요.</p>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    )
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [isLoadingStudents, startLoadingStudents] = useTransition();

  const [grade, setGrade] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [isLoggingIn, startLoggingIn] = useTransition();
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (isFirebaseConfigured) {
      startLoadingStudents(async () => {
          const students = await getAllStudents();
          setAllStudents(students.filter(s => s.isApproved && s.id !== 'teacher-master' && s.id !== 'ai-cheerer'));
      });
    }
  }, []);

  const handleGradeChange = (value: string) => {
    setGrade(value);
    setStudentClass('');
    setStudentId('');
  };

  const handleClassChange = (value: string) => {
    setStudentClass(value);
    setStudentId('');
  };

  const availableGrades = useMemo(() => {
    return [...new Set(allStudents.map(u => u.grade))].sort((a,b) => a-b);
  }, [allStudents]);
  
  const availableClasses = useMemo(() => {
    if (!grade) return [];
    return [...new Set(allStudents.filter(u => u.grade === parseInt(grade, 10)).map(u => u.class))].sort((a,b) => a-b);
  }, [allStudents, grade]);
  
  const availableStudentIds = useMemo(() => {
    if (!grade || !studentClass) return [];
    return [...new Set(allStudents.filter(u => u.grade === parseInt(grade, 10) && u.class === parseInt(studentClass, 10)).map(u => u.studentId))].sort((a,b) => a-b);
  }, [allStudents, grade, studentClass]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFirebaseConfigured || !auth) {
        setConfigError("Firebase 설정이 올바르게 구성되지 않았습니다. .env.local 파일을 확인해주세요.");
        return;
    }
    if (!grade || !studentClass || !studentId || !pin) {
        toast({ variant: "destructive", title: "오류", description: "모든 정보를 입력해주세요." });
        return;
    }

    startLoggingIn(async () => {
        try {
            const user = await loginUser(parseInt(grade), parseInt(studentClass), parseInt(studentId));

            if (!user) {
                toast({ variant: "destructive", title: "로그인 실패", description: "학생 정보를 찾을 수 없습니다." });
                return;
            }
            if (!user.isApproved) {
                toast({ variant: "destructive", title: "로그인 실패", description: "아직 선생님의 승인을 받지 않았어요." });
                return;
            }
            if (user.pin !== pin) {
                toast({ variant: "destructive", title: "로그인 실패", description: "PIN 번호가 올바르지 않습니다." });
                return;
            }
            
            await signInAnonymously(auth);
            await recordLogin(user.id);
        
            localStorage.setItem('mampungsun_user_id', user.id);
            toast({ title: "로그인 성공!", description: `환영합니다, ${user.nickname}님!` });

            if (user.pin === '0000') {
              router.push('/dashboard/force-pin-change');
            } else {
              router.push('/dashboard');
            }
            
        } catch (error: any) {
            console.error("Login error:", error);
            if (error.code === 'auth/operation-not-allowed') {
                setConfigError("익명 로그인이 활성화되지 않았습니다. Firebase 콘솔의 Authentication > Sign-in method 탭에서 익명 로그인을 활성화해주세요.");
            } else if (error.code === 'auth/configuration-not-found') {
                setConfigError("Firebase 설정 정보를 찾을 수 없습니다. .env.local 파일의 Firebase 관련 환경 변수가 올바른지 확인해주세요.");
            } else {
                toast({ variant: "destructive", title: "로그인 오류", description: "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." });
            }
        }
    });
  }
  
  const isPending = isLoadingStudents || isLoggingIn;

  if (configError) {
    return <FirebaseConfigError message={configError} />;
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
            <CardTitle className="text-2xl font-headline">학생 로그인</CardTitle>
            <CardDescription>
                학년, 반, 번호를 선택하고 PIN 번호를 입력하세요.
                <br />
                <span className="text-xs text-muted-foreground">초기 PIN 번호는 '0000'입니다.</span>
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="grade">학년</Label>
                    <Select name="grade" required value={grade} onValueChange={handleGradeChange} disabled={isPending}>
                        <SelectTrigger id="grade">
                            <SelectValue placeholder="학년" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingStudents ? <SelectItem value="loading" disabled>불러오는 중...</SelectItem> :
                             availableGrades.map(g => <SelectItem key={g} value={String(g)}>{g}학년</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="class">반</Label>
                    <Select name="class" required value={studentClass} onValueChange={handleClassChange} disabled={!grade || isPending}>
                        <SelectTrigger id="class">
                            <SelectValue placeholder="반" />
                        </SelectTrigger>
                        <SelectContent>
                             {availableClasses.map(c => <SelectItem key={c} value={String(c)}>{c}반</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="studentId">번호</Label>
                     <Select name="studentId" required value={studentId} onValueChange={setStudentId} disabled={!studentClass || isPending}>
                        <SelectTrigger id="studentId">
                            <SelectValue placeholder="번호" />
                        </SelectTrigger>
                        <SelectContent>
                             {availableStudentIds.map(s => <SelectItem key={s} value={String(s)}>{s}번</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pin">PIN 번호</Label>
              <Input id="pin" name="pin" type="password" required placeholder="4자리 숫자" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} disabled={isPending}/>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              로그인
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            교사이신가요?{" "}
            <Link href="/teacher/login" className="underline">
              교사용 로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
