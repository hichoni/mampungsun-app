'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
import { mockUsers } from "@/lib/data"
import React, { useState } from "react"

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [grade, setGrade] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [pin, setPin] = useState<string>('');

  const handleGradeChange = (value: string) => {
    setGrade(value);
    setStudentClass('');
    setStudentId('');
  };

  const handleClassChange = (value: string) => {
    setStudentClass(value);
    setStudentId('');
  };

  const availableGrades = [...new Set(mockUsers.filter(u => u.grade > 0).map(u => u.grade))].sort((a,b) => a-b);
  const availableClasses = grade ? [...new Set(mockUsers.filter(u => u.grade === parseInt(grade, 10)).map(u => u.class))].sort((a,b) => a-b) : [];
  const availableStudentIds = (grade && studentClass) ? [...new Set(mockUsers.filter(u => u.grade === parseInt(grade, 10) && u.class === parseInt(studentClass, 10)).map(u => u.studentId))].sort((a,b) => a-b) : [];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!grade || !studentClass || !studentId || !pin) {
        toast({
            variant: "destructive",
            title: "오류",
            description: "모든 정보를 입력해주세요."
        });
        return;
    }

    const user = mockUsers.find(
        (u) => 
        u.grade === parseInt(grade) && 
        u.class === parseInt(studentClass) && 
        u.studentId === parseInt(studentId)
    );

    if (!user) {
        toast({
            variant: "destructive",
            title: "로그인 실패",
            description: "학생 정보를 찾을 수 없습니다."
        });
        return;
    }

    if (!user.isApproved) {
        toast({
            variant: "destructive",
            title: "로그인 실패",
            description: "아직 선생님의 승인을 받지 않았어요."
        });
        return;
    }

    if (user.pin !== pin) {
        toast({
            variant: "destructive",
            title: "로그인 실패",
            description: "PIN 번호가 올바르지 않습니다."
        });
        return;
    }

    toast({
        title: "로그인 성공!",
        description: `환영합니다, ${user.nickname}님!`
    })

    router.push('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center space-y-4">
            <Image src="/balloon2.png" alt="맘풍선 로고" width={40} height={40} className="mx-auto" />
            <div className="space-y-1">
                <CardTitle className="text-2xl font-headline">학생 로그인</CardTitle>
                <CardDescription>
                    학년, 반, 번호를 선택하고 PIN 번호를 입력하세요.
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="grade">학년</Label>
                    <Select name="grade" required value={grade} onValueChange={handleGradeChange}>
                        <SelectTrigger id="grade">
                            <SelectValue placeholder="학년" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableGrades.map(g => <SelectItem key={g} value={String(g)}>{g}학년</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="class">반</Label>
                    <Select name="class" required value={studentClass} onValueChange={handleClassChange} disabled={!grade}>
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
                     <Select name="studentId" required value={studentId} onValueChange={setStudentId} disabled={!studentClass}>
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
              <Input id="pin" name="pin" type="password" required placeholder="4자리 숫자" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">
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
