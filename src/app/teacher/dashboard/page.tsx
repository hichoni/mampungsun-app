
'use client'

import React, { useState, useRef, useEffect, useMemo, useTransition } from "react"
import Papa from 'papaparse'
import Image from "next/image"
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, PlusCircle, Trash2, Upload, Download, MessageSquareText, Loader2, Database, KeyRound, Palette, User as UserIcon, Home } from "lucide-react"
import Link from "next/link"
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
import { PieChart, Pie, Cell } from "recharts"
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateNickname } from "@/ai/flows/generate-nickname-flow"
import { isFirebaseConfigured, auth } from "@/lib/firebase"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { getAllStudents, approveUser, deleteUser, addUser, getAllEntries, seedDatabase, resetStudentPin, getFontSettings, updateFontSettings } from "@/lib/actions"
import type { DiaryEntry } from "@/lib/definitions"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"

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

const availableFonts = [
    { value: 'Belleza', name: 'Belleza (기본 제목체)' },
    { value: 'Alegreya', name: 'Alegreya (기본 본문체)' },
    { value: 'Gaegu', name: '개구쟁이 (Gaegu)' },
    { value: 'Gowun Dodum', name: '고운 돋움 (Gowun Dodum)' },
    { value: 'Nanum Pen Script', name: '나눔손글씨 펜' },
    { value: 'Do Hyeon', name: '도현 (Do Hyeon)' },
    { value: 'Noto Sans KR', name: '노토 산스 (Noto Sans KR)' },
    { value: 'Nanum Gothic', name: '나눔 고딕 (Nanum Gothic)' },
    { value: 'Black Han Sans', name: '검은고딕 (Black Han Sans)' },
    { value: 'East Sea Dokdo', name: '동해 독도 (East Sea Dokdo)' },
    { value: 'Gugi', name: '구기 (Gugi)' },
    { value: 'IBM Plex Sans KR', name: 'IBM 플렉스 산스' },
    { value: 'Sunflower', name: '해바라기 (Sunflower)' },
    { value: 'Hi Melody', name: '하이 멜로디 (Hi Melody)' },
];


export default function TeacherDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<User[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, startLoading] = useTransition();
  const [isSeeding, startSeeding] = useTransition();

  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [isAddStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [isBatchUploadDialogOpen, setBatchUploadDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ grade: '', studentClass: '', studentId: '', name: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
    
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const [fontSettings, setFontSettings] = useState({ headline: 'Belleza', body: 'Alegreya' });
  const [isFontSaving, startFontSaving] = useTransition();
  
  const { toast } = useToast();

  useEffect(() => {
    if (isFirebaseConfigured) {
        startLoading(async () => {
            const [fetchedStudents, fetchedEntries, currentFonts] = await Promise.all([
                getAllStudents(),
                getAllEntries(),
                getFontSettings()
            ]);
            setStudents(fetchedStudents);
            setDiaryEntries(fetchedEntries);
            setFontSettings(currentFonts);
        });
    }
  }, []);

  const handleLogout = () => {
    if (auth) {
        signOut(auth);
    }
    localStorage.removeItem('mampungsun_user_id');
    router.push('/');
  }

  const handleApprovalChange = (studentId: string, isApproved: boolean) => {
    startLoading(async () => {
        await approveUser(studentId, isApproved);
        setStudents(currentStudents => 
            currentStudents.map(student => 
                student.id === studentId ? { ...student, isApproved } : student
            )
        );
    });
  }

  const handleAddStudent = () => {
    const { grade, studentClass, studentId, name } = newStudent;
    if (!grade || !studentClass || !studentId || !name) {
      toast({ variant: "destructive", title: "오류", description: "모든 필드를 입력해주세요." });
      return;
    }

    startLoading(async () => {
        const nicknameResult = await generateNickname({ name });
        const nickname = nicknameResult.nickname;
        const newUser = await addUser({
            grade: parseInt(grade, 10),
            class: parseInt(studentClass, 10),
            studentId: parseInt(studentId, 10),
            name,
            nickname,
        });
        setStudents(prev => [...prev, newUser]);
        setNewStudent({ grade: '', studentClass: '', studentId: '', name: '' });
        setAddStudentDialogOpen(false);
        toast({ title: "성공!", description: `${newUser.name} 학생이 추가되었습니다. 초기 PIN은 '0000'입니다.` });
    });
  };
  
  const handleDeleteStudent = (studentId: string) => {
    startLoading(async () => {
        await deleteUser(studentId);
        setStudents(currentStudents => currentStudents.filter(s => s.id !== studentId));
        toast({ title: "성공", description: "학생 정보가 삭제되었습니다." });
        setStudentToDelete(null);
    });
  }

  const handlePinReset = (studentId: string) => {
    startLoading(async () => {
        await resetStudentPin(studentId);
        toast({ title: "성공", description: "학생의 PIN이 '0000'으로 초기화되었습니다." });
    });
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

    setBatchUploadDialogOpen(false);
    toast({
      title: '학생 목록 처리 중...',
      description: 'AI 별명 생성 등 학생 정보를 처리하고 있습니다. 잠시만 기다려주세요.',
    });

    startLoading(async () => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            encoding: "UTF-8",
            complete: async (results) => {
              try {
                const studentPromises = results.data.map(async (row: any, index: number) => {
                  if (!row['학년'] || !row['반'] || !row['번호'] || !row['이름']) {
                    throw new Error(`CSV 파일의 ${index + 2}번째 줄 형식을 확인해주세요. 필수 항목(학년,반,번호,이름)이 모두 필요합니다.`);
                  }
                  
                  let nickname = row['별명'];
                  if (!nickname || nickname.trim() === '') {
                    try {
                        const result = await generateNickname({ name: row['이름'] });
                        nickname = result.nickname;
                    } catch(e) {
                        console.error("AI 별명 생성에 실패했습니다:", e);
                        nickname = `멋진${row['이름']}`;
                    }
                  }
      
                  return {
                    grade: parseInt(row['학년'], 10),
                    class: parseInt(row['반'], 10),
                    studentId: parseInt(row['번호'], 10),
                    name: row['이름'],
                    nickname: nickname,
                  };
                });
      
                const newStudentData = await Promise.all(studentPromises);

                const addedStudents = [];
                for (const studentData of newStudentData) {
                    const newU = await addUser(studentData);
                    addedStudents.push(newU);
                }
                
                setStudents(prev => [...prev, ...addedStudents]);

                toast({ title: "성공!", description: `${addedStudents.length}명의 학생이 추가되었습니다. 초기 PIN은 '0000'입니다.` });
                
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
    });
  };

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedClass('all');
  };

  const availableGrades = useMemo(() => {
    return [...new Set(students.filter(s => s.grade > 0).map(s => s.grade))].sort((a, b) => a - b);
  }, [students]);

  const availableClasses = useMemo(() => {
    if (selectedGrade === 'all') return [];
    return [...new Set(students.filter(s => s.grade === parseInt(selectedGrade)).map(s => s.class))].sort((a, b) => a - b);
  }, [students, selectedGrade]);

  const filteredStudentIds = useMemo(() => {
    return new Set(students
      .filter(student => {
        if (student.grade <= 0) return false;
        if (selectedGrade === 'all') return true;
        if (student.grade !== parseInt(selectedGrade)) return false;
        if (selectedClass === 'all') return true;
        return student.class === parseInt(selectedClass);
      })
      .map(s => s.id));
  }, [students, selectedGrade, selectedClass]);
  
  const studentsWithLatestEmotion = useMemo(() => {
    return students
        .filter(s => filteredStudentIds.has(s.id))
        .map(user => {
            const userEntries = diaryEntries
              .filter(entry => entry.userId === user.id)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            const latestEmotion = userEntries.length > 0 ? userEntries[0].dominantEmotion : "정보 없음";
            
            return { ...user, latestEmotion };
        })
        .sort((a, b) => {
            if (a.grade !== b.grade) return a.grade - b.grade;
            if (a.class !== b.class) return a.class - b.class;
            return a.studentId - b.studentId;
        });
  }, [students, diaryEntries, filteredStudentIds]);

  const chartConfig = {
      기쁨: { label: "기쁨", color: "hsl(var(--primary))" },
      슬픔: { label: "슬픔", color: "hsl(var(--destructive))" },
      불안: { label: "불안", color: "hsl(var(--secondary))" },
      평온: { label: "평온", color: "hsl(var(--accent))" },
      '정보 없음': { label: "정보 없음", color: "hsl(var(--muted))" },
  } satisfies ChartConfig;
  
  const chartData = useMemo(() => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentEntries = diaryEntries.filter(entry => 
          new Date(entry.createdAt) > oneWeekAgo && filteredStudentIds.has(entry.userId)
      );
      
      const emotionCounts = recentEntries.reduce((acc, entry) => {
          const emotion = entry.dominantEmotion || '정보 없음';
          acc[emotion] = (acc[emotion] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
  
      return Object.keys(emotionCounts)
        .filter(emotion => emotion in chartConfig)
        .map(emotion => ({
            emotion,
            count: emotionCounts[emotion],
            fill: chartConfig[emotion as keyof typeof chartConfig].color
        }));
  }, [diaryEntries, filteredStudentIds]);

  const handleSeedDatabase = () => {
    startSeeding(async () => {
        const result = await seedDatabase();
        if (result.success) {
            toast({ title: "성공!", description: result.message });
            // Refetch data
            const [fetchedStudents, fetchedEntries, currentFonts] = await Promise.all([
                getAllStudents(),
                getAllEntries(),
                getFontSettings(),
            ]);
            setStudents(fetchedStudents);
            setDiaryEntries(fetchedEntries);
            setFontSettings(currentFonts);
        } else {
            toast({ variant: "destructive", title: "실패", description: result.message });
        }
    });
  }

  const handleFontSettingsSave = () => {
    startFontSaving(async () => {
        await updateFontSettings(fontSettings);
        toast({ title: "성공!", description: "앱 폰트가 변경되었습니다. 페이지를 새로고침하면 적용됩니다." });
    });
  }

  if (!isFirebaseConfigured) {
    return (
        <div className="p-8">
             <Card className="mx-auto max-w-2xl w-full">
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
    <div className="min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/teacher/dashboard" className="flex items-center gap-2 font-semibold">
          <Image src="/icon-balloon2.png" alt="맘풍선 로고" width={32} height={32} />
          <span className="font-headline text-xl text-foreground">맘풍선 교사 페이지</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
            <Button asChild variant="outline">
                <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    학생 화면으로
                </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>
                로그아웃
            </Button>
        </div>
      </header>
      <main className="p-4 sm:p-6 md:p-8 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">데이터베이스 관리</CardTitle>
                <CardDescription>데이터베이스를 샘플 데이터로 초기화합니다. 기존 데이터는 유지됩니다.</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="secondary" disabled={isSeeding}>
                            <Database className="mr-2 h-4 w-4" />
                            {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            초기 데이터 설정
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>데이터베이스를 초기화하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>
                                이 작업은 샘플 학생 및 맘풍선 데이터를 데이터베이스에 추가합니다. 이미 데이터가 있는 경우, 새로운 데이터가 추가되지 않습니다.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSeedDatabase}>
                                확인
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">콘텐츠 관리</CardTitle>
                <CardDescription>학생들이 작성한 맘풍선과 댓글을 확인하고 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/teacher/dashboard/content">
                        <MessageSquareText className="mr-2 h-4 w-4" />
                        콘텐츠 관리 페이지로 이동
                    </Link>
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">앱 폰트 설정</CardTitle>
                <CardDescription>앱 전체에서 사용될 제목과 본문 폰트를 변경할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="headline-font">제목 폰트</Label>
                    <Select 
                        value={fontSettings.headline} 
                        onValueChange={(value) => setFontSettings(prev => ({...prev, headline: value}))}
                        disabled={isLoading || isFontSaving}
                    >
                        <SelectTrigger id="headline-font">
                            <SelectValue placeholder="제목 폰트 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableFonts.map(font => <SelectItem key={font.value} value={font.value}>{font.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="body-font">본문 폰트</Label>
                     <Select 
                        value={fontSettings.body} 
                        onValueChange={(value) => setFontSettings(prev => ({...prev, body: value}))}
                        disabled={isLoading || isFontSaving}
                    >
                        <SelectTrigger id="body-font">
                            <SelectValue placeholder="본문 폰트 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableFonts.map(font => <SelectItem key={font.value} value={font.value}>{font.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleFontSettingsSave} disabled={isLoading || isFontSaving}>
                    {isFontSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Palette className="mr-2 h-4 w-4" />
                    폰트 설정 저장
                </Button>
            </CardFooter>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">학생 보기 설정</CardTitle>
                <CardDescription>학년과 반을 선택하여 특정 그룹의 학생 통계 및 목록을 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="grade-filter">학년</Label>
                        <Select value={selectedGrade} onValueChange={handleGradeChange}>
                            <SelectTrigger id="grade-filter">
                                <SelectValue placeholder="학년 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 학년</SelectItem>
                                {availableGrades.map(g => <SelectItem key={g} value={String(g)}>{g}학년</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="class-filter">반</Label>
                        <Select value={selectedClass} onValueChange={setSelectedClass} disabled={selectedGrade === 'all'}>
                             <SelectTrigger id="class-filter">
                                <SelectValue placeholder="반 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 반</SelectItem>
                                {availableClasses.map(c => <SelectItem key={c} value={String(c)}>{c}반</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">학급 감정 통계</CardTitle>
                <CardDescription>최근 일주일간 선택된 학생들의 감정 분포입니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                {isLoading ? (
                     <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
                        <PieChart>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="emotion" />} />
                            <Pie data={chartData} dataKey="count" nameKey="emotion" cx="50%" cy="50%" outerRadius={100} innerRadius={60}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.emotion}`} fill={entry.fill} className="stroke-background hover:opacity-80" />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="emotion" />} className="[&_.recharts-legend-item-text]:capitalize" />
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground text-center">선택된 그룹의 맘풍선 데이터가 없습니다.</p>
                    </div>
                )}
            </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <CardTitle className="font-headline">학생 관리</CardTitle>
                    <CardDescription>선택된 학생 목록과 로그인 승인 상태입니다.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> 학생 추가</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>새 학생 추가</DialogTitle>
                                <DialogDescription>추가할 학생의 정보를 입력해주세요. 초기 PIN 번호는 '0000'으로 설정됩니다.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">이름</Label>
                                    <Input id="name" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} className="col-span-3" />
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
                                <Button type="submit" onClick={handleAddStudent} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    추가하기
                                </Button>
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
                                <DialogDescription>CSV 파일을 사용하여 여러 학생을 한번에 등록할 수 있습니다. 별명 칸을 비워두면 AI가 자동으로 생성합니다.</DialogDescription>
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
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                        </TableCell>
                    </TableRow>
                ) : studentsWithLatestEmotion.length > 0 ? (
                  studentsWithLatestEmotion.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell className="font-medium">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="link" className="p-0 h-auto font-medium text-left">
                                    {student.name}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16 text-3xl border">
                                            <AvatarImage src={student.avatarUrl} alt={student.nickname} />
                                            <AvatarFallback>
                                                <UserIcon />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <DialogTitle className="text-2xl font-headline">{student.nickname}</DialogTitle>
                                            <DialogDescription>{student.grade}학년 {student.class}반 {student.studentId}번 {student.name}</DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                                <div className="mt-4 grid gap-4">
                                    <Card>
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-base">활동 요약</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">작성한 맘풍선</span>
                                                <strong>{diaryEntries.filter(e => e.userId === student.id).length}개</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">총 로그인</span>
                                                <strong>{student.loginCount || 0}회</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">최근 로그인</span>
                                                <strong>
                                                {student.lastLoginAt 
                                                    ? format(new Date(student.lastLoginAt as string), 'yyyy년 M월 d일 HH:mm', { locale: ko })
                                                    : '기록 없음'}
                                                </strong>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">로그인 기록</h4>
                                        <ScrollArea className="h-40 rounded-md border">
                                            <div className="p-4 text-sm">
                                                {(student.loginHistory && student.loginHistory.length > 0) ? (
                                                    <ul className="space-y-2">
                                                        {[...student.loginHistory].reverse().map((loginTime, index) => (
                                                            <li key={index}>
                                                                {format(new Date(loginTime as string), 'yyyy.MM.dd HH:mm:ss', { locale: ko })}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-muted-foreground text-center py-4">로그인 기록이 없습니다.</p>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                      </TableCell>
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
                                <Button variant="ghost" size="icon" title="PIN 초기화">
                                    <KeyRound className="h-4 w-4 text-muted-foreground"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{student.name} 학생의 PIN을 초기화하시겠습니까?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        이 작업은 학생의 PIN 번호를 '0000'으로 재설정합니다. 학생은 다음 로그인 시 새로운 PIN 번호를 설정해야 합니다.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handlePinReset(student.id)}>
                                        초기화
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" title="학생 삭제">
                                  <Trash2 className="h-4 w-4 text-destructive"/>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      선택된 그룹에 학생이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
