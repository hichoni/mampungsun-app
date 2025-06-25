'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { getUser, updateUser } from "@/lib/actions"
import type { User } from '@/lib/definitions'

export default function ForcePinChangePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [isUpdating, startUpdating] = useTransition();

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('mampungsun_user_id');
    if (!userId) {
      router.push('/login');
      return;
    }
    
    startLoading(async () => {
        const currentUser = await getUser(userId);
        if (currentUser) {
          if (currentUser.pin !== '0000') {
            // This user doesn't need to be here.
            router.push('/dashboard');
            return;
          }
          setUser(currentUser);
        } else {
            router.push('/login');
        }
    });
  }, [router]);

  const handlePinChange = async () => {
    if (!user) return;

    if (!/^\d{4}$/.test(newPin)) {
      toast({ variant: "destructive", title: "오류", description: "새 PIN 번호는 4자리 숫자여야 합니다." });
      return;
    }
    if (newPin !== confirmPin) {
      toast({ variant: "destructive", title: "오류", description: "새 PIN 번호가 일치하지 않습니다." });
      return;
    }
    if (newPin === '0000') {
        toast({ variant: "destructive", title: "오류", description: "초기 PIN 번호와 다른 번호를 사용해주세요." });
        return;
    }

    startUpdating(async () => {
        await updateUser(user.id, { pin: newPin });
        toast({ title: "성공!", description: "PIN 번호가 안전하게 변경되었습니다. 이제 맘풍선을 이용할 수 있습니다." });
        router.push('/dashboard');
    });
  };
  
  const isPending = isLoading || isUpdating;

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">환영합니다, {user.nickname}님!</CardTitle>
          <CardDescription>
            계정을 안전하게 보호하기 위해 초기 PIN 번호를 변경해주세요. 앞으로 이 새로운 PIN 번호로 로그인하게 됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pin">새 PIN 번호 (4자리 숫자)</Label>
            <Input 
              id="new-pin" 
              type="password" 
              value={newPin} 
              onChange={e => setNewPin(e.target.value)} 
              maxLength={4} 
              disabled={isPending}
              placeholder="••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pin">새 PIN 번호 확인</Label>
            <Input 
              id="confirm-pin" 
              type="password" 
              value={confirmPin} 
              onChange={e => setConfirmPin(e.target.value)} 
              maxLength={4} 
              disabled={isPending}
              placeholder="••••"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePinChange} disabled={isPending} className="w-full">
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            PIN 변경하고 시작하기
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
