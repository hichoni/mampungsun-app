'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
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
import { BalloonIcon } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"

const MASTER_ID = "master"
const MASTER_PASSWORD = "password123"

export default function TeacherLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [masterId, setMasterId] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterId === MASTER_ID && password === MASTER_PASSWORD) {
      toast({
        title: "로그인 성공",
        description: "교사 페이지로 이동합니다."
      })
      router.push('/teacher/dashboard')
    } else {
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: "아이디 또는 비밀번호가 올바르지 않습니다."
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
              <Link href="/" className="flex items-center justify-center" prefetch={false}>
                  <BalloonIcon className="h-10 w-10 text-primary" />
              </Link>
          </div>
          <CardTitle className="text-2xl font-headline">교사용 로그인</CardTitle>
          <CardDescription>
            마스터 아이디와 비밀번호를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="masterId">마스터 아이디</Label>
              <Input
                id="masterId"
                placeholder="master"
                required
                value={masterId}
                onChange={(e) => setMasterId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">비밀번호</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            학생이신가요?{" "}
            <Link href="/login" className="underline" prefetch={false}>
              학생 로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
