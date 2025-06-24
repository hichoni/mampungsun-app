'use client'

import React, { useState, useRef } from "react"
import Papa from 'papaparse'
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
import { LogOut, PlusCircle, Trash2, Upload, Download } from "lucide-react"
import Link from "next/link"
import { BalloonIcon } from "@/components/icons"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


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
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [isAddStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [isBatchUploadDialogOpen, setBatchUploadDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ grade: '', studentClass: '', studentId: '', name: '', nickname: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleApprovalChange = (studentId: string, isApproved: boolean) => {
    setStudents(currentStudents => 
        currentStudents.map(student => 
            student.id === studentId ? { ...student, isApproved } : student
        )
    );
    // In a real app, you would make an API call here to update the database.
  }

  const handleAddStudent = () => {
    const { grade, studentClass, studentId, name, nickname } = newStudent;
    if (!grade || !studentClass || !studentId || !name || !nickname) {
      toast({ variant: "destructive", title: "오류", description: "모든 필드를 입력해주세요." });
      return;
    }

    const newUser: User = {
      id: new Date().getTime().toString(),
      grade: parseInt(grade, 10),
      class: parseInt(studentClass, 10),
      studentId: parseInt(studentId, 10),
      name,
      nickname,
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      isApproved: true,
    };

    setStudents(prev => [...prev, newUser]);
    toast({ title: "성공", description: "새로운 학생이 추가되었습니다." });
    setNewStudent({ grade: '', studentClass: '', studentId: '', name: '', nickname: '' });
    setAddStudentDialogOpen(false);
  };
  
  const handleDeleteStudent = (studentId: string) => {
    setStudents(currentStudents => currentStudents.filter(s => s.id !== studentId));
    toast({ title: "성공", description: "학생 정보가 삭제되었습니다." });
    setStudentToDelete(null);
  }

  const handleDownloadSample = () => {
    const csvHeader = "학년,반,번호,이름,별명\n";
    const csvExample = "1,1,1,김샘플,활기찬다람쥐\n";
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvHeader + csvExample);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "학생_일괄등록_양식.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        try {
          const newStudents: User[] = results.data.map((row: any, index: number) => {
            if (!row['학년'] || !row['반'] || !row['번호'] || !row['이름'] || !row['별명']) {
              throw new Error(`CSV 파일의 ${index + 2}번째 줄 형식을 확인해주세요. 모든 헤더(학년,반,번호,이름,별명)가 필요합니다.`);
            }
            return {
              id: new Date().getTime().toString() + Math.random(),
              grade: parseInt(row['학년'], 10),
              class: parseInt(row['반'], 10),
              studentId: parseInt(row['번호'], 10),
              name: row['이름'],
              nickname: row['별명'],
              pin: Math.floor(1000 + Math.random() * 9000).toString(),
              isApproved: true,
            };
          });

          setStudents(prev => [...prev, ...newStudents]);
          toast({ title: "성공", description: `${newStudents.length}명의 학생이 추가되었습니다.` });
          setBatchUploadDialogOpen(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

        } catch (error: any) {
          toast({ variant: "destructive", title: "업로드 실패", description: error.message || "CSV 파일 처리 중 오류가 발생했습니다." });
        }
      },
      error: (error: any) => {
        toast({ variant: "destructive", title: "파싱 오류", description: error.message });
      }
    });
  };


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
          <span className="ml-2 text-xl font-headline font-bold text-foreground">맘풍선 교사 페이지</span>
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
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <CardTitle className="font-headline">학생 관리</CardTitle>
                    <CardDescription>전체 학생 목록과 로그인 승인 상태입니다.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> 학생 추가</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>새 학생 추가</DialogTitle>
                                <DialogDescription>추가할 학생의 정보를 입력해주세요. PIN 번호는 자동으로 생성됩니다.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">이름</Label>
                                    <Input id="name" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="nickname" className="text-right">별명</Label>
                                    <Input id="nickname" value={newStudent.nickname} onChange={(e) => setNewStudent({...newStudent, nickname: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="grade" className="text-right">학년</Label>
                                    <Input id="grade" type="number" value={newStudent.grade} onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="class" className="text-right">반</Label>
                                    <Input id="class" type="number" value={newStudent.studentClass} onChange={(e) => setNewStudent({...newStudent, studentClass: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="studentId" className="text-right">번호</Label>
                                    <Input id="studentId" type="number" value={newStudent.studentId} onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleAddStudent}>추가하기</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isBatchUploadDialogOpen} onOpenChange={setBatchUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> 일괄 등록</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>학생 일괄 등록</DialogTitle>
                                <DialogDescription>CSV 파일을 사용하여 여러 학생을 한번에 등록할 수 있습니다.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <p className="text-sm text-muted-foreground">1. 먼저 샘플 양식을 다운로드하여 학생 정보를 입력하세요.</p>
                               <Button variant="secondary" onClick={handleDownloadSample}><Download className="mr-2 h-4 w-4" /> 양식 다운로드</Button>
                               <p className="text-sm text-muted-foreground mt-4">2. 정보 입력이 완료된 CSV 파일을 업로드해주세요.</p>
                               <Input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
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
                  <TableHead>로그인 승인</TableHead>
                  <TableHead className="text-right">관리</TableHead>
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
                    <TableCell>
                       <div className="flex items-center justify-start">
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
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive"/>
                                <span className="sr-only">삭제</span>
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                              <AlertDialogDescription>
                                이 작업은 되돌릴 수 없습니다. {student.name} 학생의 정보가 영구적으로 삭제됩니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteStudent(student.id)} className="bg-destructive hover:bg-destructive/90">
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
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
