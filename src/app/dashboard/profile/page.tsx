'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import React, { useState, useEffect, useTransition } from "react"
import type { User } from "@/lib/definitions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Loader2 } from "lucide-react"
import { generateAvatar } from "@/ai/flows/generate-avatar-flow"
import { useRouter } from "next/navigation"
import { getUser, updateUser } from "@/lib/actions"
import { storage } from "@/lib/firebase"
import { ref, uploadString, getDownloadURL } from "firebase/storage"

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, startLoadingUser] = useTransition();
  const [isGenerating, startGenerating] = useTransition();
  const [isUpdating, startUpdating] = useTransition();
  
  const [nickname, setNickname] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('mampungsun_user_id');
    if (!userId) {
      router.push('/login');
      return;
    }
    
    startLoadingUser(async () => {
        const currentUser = await getUser(userId);
        if (currentUser) {
          setUser(currentUser);
          setNickname(currentUser.nickname);
        } else {
            router.push('/login');
        }
    });
  }, [router]);

  const handleProfileUpdate = () => {
    if (!user) return;
    
    startUpdating(async () => {
        await updateUser(user.id, { nickname });
        setUser(prev => prev ? {...prev, nickname} : null);
        toast({
          title: "성공",
          description: "프로필이 저장되었습니다."
        });
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

    startUpdating(async () => {
        await updateUser(user.id, { pin: newPin });
        setUser(prev => prev ? {...prev, pin: newPin} : null);
        toast({ title: "성공", description: "PIN 번호가 변경되었습니다." });
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
    });
  }

  const handleAvatarGeneration = () => {
    if (!user) return;
    startGenerating(async () => {
      try {
        toast({ title: "AI 아바타 생성 중...", description: "잠시만 기다려주세요. 멋진 아바타를 만들고 있어요!" });
        const result = await generateAvatar({ nickname: user.nickname, userId: user.id });
        const imageDataUri = result.imageDataUri;
        
        if (!imageDataUri) {
          throw new Error("AI did not return an image.");
        }

        if (!storage) {
          throw new Error("Firebase Storage is not configured. Please check environment variables.");
        }
        
        const storageRef = ref(storage, `avatars/${user.id}/${new Date().getTime()}.png`);
        const uploadResult = await uploadString(storageRef, imageDataUri, 'data_url');
        const newAvatarUrl = await getDownloadURL(uploadResult.ref);

        await updateUser(user.id, { avatarUrl: newAvatarUrl });
        setUser(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);

        toast({
          title: "성공!",
          description: "새로운 AI 아바타가 생성되어 적용되었습니다."
        });
      } catch (error) {
        console.error("Avatar generation failed:", error);
        toast({
          variant: "destructive",
          title: "오류",
          description: "아바타 생성에 실패했습니다. 잠시 후 다시 시도하거나, API 키 또는 Firebase 설정을 확인해주세요."
        });
      }
    });
  };
  
  const isPending = isGenerating || isUpdating || isLoadingUser;

  if (isLoadingUser || !user) {
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
                            {isGenerating ? <Loader2 className="h-12 w-12 animate-spin" /> : user.nickname?.charAt(0) || <UserIcon />}
                        </AvatarFallback>
                    </Avatar>
                    <Button onClick={handleAvatarGeneration} disabled={isPending}>
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
                        <Input id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} disabled={isPending}/>
                    </div>
                    <Button onClick={handleProfileUpdate} disabled={isPending}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        저장하기
                    </Button>
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
                        <Input id="current-pin" type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)} maxLength={4} disabled={isPending}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-pin">새 PIN 번호</Label>
                        <Input id="new-pin" type="password" value={newPin} onChange={e => setNewPin(e.target.value)} maxLength={4} disabled={isPending}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-pin">새 PIN 번호 확인</Label>
                        <Input id="confirm-pin" type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} maxLength={4} disabled={isPending}/>
                    </div>
                    <Button onClick={handlePinChange} disabled={isPending}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        PIN 변경하기
                    </Button>
                </CardContent>
            </Card>
        </div>
    </>
  )
}
