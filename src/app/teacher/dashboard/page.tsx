'use client'

import React, { useState } from "react"
import { mockUsers as initialMockUsers, mockDiaryEntries } from "@/lib/data"
import type { User } from "@/lib/definitions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { BalloonIcon } from "@/components/icons"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const getEmotionBadgeVariant = (emotion: string) => {
  switch (emotion) {
    case '기쁨':
      return 'default';
    case '슬픔':
      return 'destructive';
    case '불안':
      return 'secondary';
    default:
      return 'outline';
  }
};


export default function TeacherDashboard() {
  const [students, setStudents] = useState<User[]>(initialMockUsers);

  const handleApprovalChange = (studentId: string, isApproved: boolean) => {
    setStudents(currentStudents => 
        currentStudents.map(student => 
            student.id === studentId ? { ...student, isApproved } : student
        )
    );
    // In a real app, you would make an API call here to update the database.
  }

  const studentsWithLatestEmotion = students.map(user => {
    const userEntries = mockDiaryEntries
      .filter(entry => entry.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const latestEmotion = userEntries.length > 0 ? userEntries[0].dominantEmotion : "정보 없음";
    
    return {
      ...user,
      latestEmotion,
    };
  }).sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    if (a.class !== b.class) return a.class - b.class;
    return a.studentId - b.studentId;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <BalloonIcon className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-headline font-bold text-foreground">맘톡톡 교사 페이지</span>
        </Link>
        <div className="ml-auto">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                    <LogOut className="h-5 w-5"/>
                    <span className="sr-only">로그아웃</span>
                </Link>
            </Button>
        </div>
      </header>
      <main className="p-4 sm:p-6 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">학생 관리</CardTitle>
            <CardDescription>전체 학생 목록과 로그인 승인 상태입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>학년</TableHead>
                  <TableHead>반</TableHead>
                  <TableHead>번호</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>별명</TableHead>
                  <TableHead>최근 감정</TableHead>
                  <TableHead className="text-right">로그인 승인</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsWithLatestEmotion.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.nickname}</TableCell>
                    <TableCell>
                      <Badge variant={getEmotionBadgeVariant(student.latestEmotion)}>
                        {student.latestEmotion}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end space-x-2">
                         <Switch
                            id={`approval-${student.id}`}
                            checked={student.isApproved}
                            onCheckedChange={(checked) => handleApprovalChange(student.id, checked)}
                         />
                         <Label htmlFor={`approval-${student.id}`} className="sr-only">
                           {student.name} 로그인 승인
                         </Label>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
