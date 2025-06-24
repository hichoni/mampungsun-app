'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { mockUsers } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import React, { useState } from "react"

export default function ProfilePage() {
  const { toast } = useToast();
  // Set user to the test user ('4')
  const [user, setUser] = useState(mockUsers[3]);

  const [nickname, setNickname] = useState(user.nickname);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleProfileUpdate = () => {
    // In a real app, update the database
    setUser(prev => ({...prev, nickname}));
    toast({
      title: "성공",
      description: "프로필이 저장되었습니다."
    })
  }
  
  const handlePinChange = () => {
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

    // In a real app, update PIN in database
    setUser(prev => ({...prev, pin: newPin}));
    toast({ title: "성공", description: "PIN 번호가 변경되었습니다." });
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  }

  return (
    <>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">프로필</h1>
        <div className="grid gap-6">
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
