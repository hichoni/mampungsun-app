'use client'

import Link from "next/link"
import { useState } from "react"
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
import { BalloonIcon } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "이메일을 입력해주세요.",
      });
      return;
    }
    
    // 실제 앱에서는 여기서 API를 호출하여 인증 코드를 보냅니다.
    console.log(`Sending verification code to ${email}`);
    
    toast({
      title: "인증번호 발송",
      description: "입력하신 이메일로 인증번호를 보냈어요.",
    })
    setStep('verify');
  }

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 앱에서는 여기서 코드를 확인하고 계정을 생성합니다.
    toast({
      title: "회원가입 성공!",
      description: "맘톡톡에 오신 것을 환영합니다! 로그인 페이지로 이동합니다.",
    });
    
    setTimeout(() => {
        router.push('/login');
    }, 1500);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <Link href="/" className="flex items-center justify-center" prefetch={false}>
                    <BalloonIcon className="h-10 w-10 text-primary" />
                </Link>
            </div>
          <CardTitle className="text-2xl font-headline">학생 회원가입</CardTitle>
          <CardDescription>
            {step === 'details' 
                ? "정보를 입력하여 맘톡톡 계정을 만드세요."
                : "이메일로 발송된 인증번호를 입력해주세요."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <form onSubmit={handleInitialSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="grade">학년</Label>
                    <Select>
                        <SelectTrigger id="grade">
                            <SelectValue placeholder="학년" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1학년</SelectItem>
                            <SelectItem value="2">2학년</SelectItem>
                            <SelectItem value="3">3학년</SelectItem>
                            <SelectItem value="4">4학년</SelectItem>
                            <SelectItem value="5">5학년</SelectItem>
                            <SelectItem value="6">6학년</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="class">반</Label>
                    <Input id="class" placeholder="예: 3" type="number" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="studentId">번호</Label>
                    <Input id="studentId" placeholder="예: 12" type="number" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">이름</Label>
                  <Input id="name" placeholder="김민준" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nickname">별명 (맘풍선에 표시돼요)</Label>
                  <Input id="nickname" placeholder="행복한 토끼" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                  인증번호 받기
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit}>
              <div className="grid gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="verification-code">인증번호</Label>
                      <Input
                          id="verification-code"
                          placeholder="6자리 숫자"
                          required
                      />
                  </div>
                  <Button type="submit" className="w-full">
                      인증하고 가입 완료
                  </Button>
                  <Button variant="link" size="sm" type="button" className="text-muted-foreground" onClick={() => setStep('details')}>
                      이메일 다시 입력하기
                  </Button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="underline" prefetch={false}>
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
