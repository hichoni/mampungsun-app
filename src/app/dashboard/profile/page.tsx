'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { mockUsers } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import React, { useState, useEffect, useTransition } from "react"
import type { User } from "@/lib/definitions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Loader2 } from "lucide-react"
import { generateAvatar } from "@/ai/flows/generate-avatar-flow"

const USERS_STORAGE_KEY = 'mampungsun_users';
const LOGGED_IN_USER_ID = '4'; // Test User ID

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isGenerating, startTransition] = useTransition();

  const [nickname, setNickname] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    let allUsers: User[] = [];
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
        allUsers = JSON.parse(storedUsers);
    } else {
        allUsers = mockUsers;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
    }
    const currentUser = allUsers.find(u => u.id === LOGGED_IN_USER_ID);
    if (currentUser) {
      setUser(currentUser);
      setNickname(currentUser.nickname);
    }
  }, []);

  const handleProfileUpdate = () => {
    if (!user) return;
    
    const updatedUser = { ...user, nickname };
    setUser(updatedUser);

    const allUsers: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    }
    
    toast({
      title: "성공",
      description: "프로필이 저장되었습니다."
    });
  }
  
  const handlePinChange = () => {
    if (!user) return;
    if (currentPin !== user.pin) {
      toast({ variant: "destructive", title: "오류", description: "현재 PIN 번호가 일치하지 않습니다." });
      return;
    }
    if (!newPin || newPin.length !== 4) {
      toast({ variant: "destructive", title: "오류", description: "새 PIN 번호는 4자리여야 합니다." });
      return;
    }
    if (newPin !== confirmPin) {
      toast({ variant: "destructive", title: "오류", description: "새 PIN 번호가 일치하지 않습니다." });
      return;
    }

    const updatedUser = { ...user, pin: newPin };
    setUser(updatedUser);

    const allUsers: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    }

    toast({ title: "성공", description: "PIN 번호가 변경되었습니다." });
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  }

  const handleAvatarGeneration = () => {
    if (!user) return;
    startTransition(async () => {
      try {
        toast({ title: "AI 아바타 생성 중...", description: "잠시만 기다려주세요. 멋진 아바타를 만들고 있어요!" });
        const result = await generateAvatar({ nickname: user.nickname });
        const newAvatarUrl = result.avatarDataUri;

        const updatedUser = { ...user, avatarUrl: newAvatarUrl };
        setUser(updatedUser);

        const allUsers: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
        const userIndex = allUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          allUsers[userIndex] = updatedUser;
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
        }

        toast({
          title: "성공!",
          description: "새로운 AI 아바타가 생성되어 적용되었습니다."
        });
      } catch (error) {
        console.error("Avatar generation failed:", error);
        toast({
          variant: "destructive",
          title: "오류",
          description: "아바타 생성에 실패했습니다. 잠시 후 다시 시도해주세요."
        });
      }
    });
  };
  
  if (!user) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">프로필</h1>
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>프로필 아바타</CardTitle>
                    <CardDescription>AI를 이용해 나의 개성을 나타내는 아바타를 만들어보세요.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <Avatar className="w-32 h-32 text-6xl">
                        <AvatarImage src={user.avatarUrl} alt={user.nickname} />
                        <AvatarFallback>
                            {user.nickname?.charAt(0) || <UserIcon />}
                        </AvatarFallback>
                    </Avatar>
                    <Button onClick={handleAvatarGeneration} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        AI 아바타 새로 만들기
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>내 정보</CardTitle>
                    <CardDescription>계정 정보를 확인하고 수정할 수 있습니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grade">학년</Label>
                             <Input id="grade" value={`${user.grade}학년`} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="class">반</Label>
                            <Input id="class" value={`${user.class}반`} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentId">번호</Label>
                            <Input id="studentId" value={`${user.studentId}번`} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <Input id="name" value={user.name} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nickname">별명</Label>
                        <Input id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
                    </div>
                    <Button onClick={handleProfileUpdate}>저장하기</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>PIN 번호 변경</CardTitle>
                    <CardDescription>로그인에 사용하는 4자리 PIN 번호를 변경할 수 있습니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-pin">현재 PIN 번호</Label>
                        <Input id="current-pin" type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)} maxLength={4}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-pin">새 PIN 번호</Label>
                        <Input id="new-pin" type="password" value={newPin} onChange={e => setNewPin(e.target.value)} maxLength={4}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-pin">새 PIN 번호 확인</Label>
                        <Input id="confirm-pin" type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} maxLength={4}/>
                    </div>
                    <Button onClick={handlePinChange}>PIN 변경하기</Button>
                </CardContent>
            </Card>
        </div>
    </>
  )
}
