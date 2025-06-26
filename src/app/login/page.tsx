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
import { auth } from "@/lib/firebase"
import { signInAnonymously, signOut } from "firebase/auth"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { User } from "@/lib/definitions"

function FirebaseErrorDisplay({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive">{title}</CardTitle>
          <CardDescription>앱을 사용하기 전에 필요한 설정입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>해결 방법</AlertTitle>
            <AlertDescription>
              <p>{description}</p>
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="w-full mt-4">
            설정 후 새로고침
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [isLoading, startLoading] = useTransition();

  const [grade, setGrade] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [pin, setPin] = useState<string>('');

  const [firebaseError, setFirebaseError] = useState<{ title: string; description: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyConnectionAndFetchStudents = async () => {
      if (!auth) {
        setFirebaseError({
            title: "Firebase 미설정",
            description: "Firestore 데이터베이스 연동을 위한 환경 변수 설정이 필요합니다. 프로젝트의 `README.md` 파일을 참고하여 설정을 완료해주세요.",
        });
        setIsVerifying(false);
        return;
      }
      try {
        await signInAnonymously(auth);
        await signOut(auth); // Immediately sign out, this was just a check

        // Fetch students only after successful verification
        startLoading(async () => {
            const students = await getAllStudents();
            setAllStudents(students.filter(s => s.isApproved && s.id !== 'teacher-master' && s.id !== 'ai-cheerer'));
        });

      } catch (error: any) {
        console.error("Firebase connection verification failed:", error);
        if (error.code === 'auth/operation-not-allowed') {
          setFirebaseError({
              title: 'Firebase 설정 오류',
              description: "Firebase 콘솔의 Authentication > Sign-in method 탭에서 '익명 로그인'을 활성화해주세요.",
          });
        } else {
             setFirebaseError({
                title: 'Firebase 설정 오류',
                description: 'Firebase 구성이 올바르지 않습니다. .env.local 파일의 환경 변수 값이 정확한지 확인해주세요.',
            });
        }
      } finally {
        setIsVerifying(false);
      }
    };
    verifyConnectionAndFetchStudents();
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!grade || !studentClass || !studentId || !pin) {
        toast({ variant: "destructive", title: "오류", description: "모든 정보를 입력해주세요." });
        return;
    }

    startLoading(async () => {
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
            
            if (!auth) throw new Error("Firebase auth not available");
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
            toast({
                variant: "destructive",
                title: "로그인 오류",
                description: "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            });
        }
    });
  }
  
  if (isVerifying) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  if (firebaseError) {
    return <FirebaseErrorDisplay title={firebaseError.title} description={firebaseError.description} />;
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
                    <Select name="grade" required value={grade} onValueChange={handleGradeChange} disabled={isLoading}>
                        <SelectTrigger id="grade">
                            <SelectValue placeholder="학년" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading ? <SelectItem value="loading" disabled>불러오는 중...</SelectItem> :
                             availableGrades.map(g => <SelectItem key={g} value={String(g)}>{g}학년</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="class">반</Label>
                    <Select name="class" required value={studentClass} onValueChange={handleClassChange} disabled={!grade || isLoading}>
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
                     <Select name="studentId" required value={studentId} onValueChange={setStudentId} disabled={!studentClass || isLoading}>
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
              <Input id="pin" name="pin" type="password" required placeholder="4자리 숫자" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} disabled={isLoading}/>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
