'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User, LogOut, Shield } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

export function HeaderActions() {
  const [isTeacher, setIsTeacher] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem('mampungsun_user_id')
    if (userId === 'teacher-master') {
      setIsTeacher(true)
    }
  }, [])

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
    localStorage.removeItem('mampungsun_user_id');
    router.push('/');
  }

  return (
    <div className="flex items-center gap-2">
      {isTeacher && (
        <Button variant="outline" size="icon" asChild>
          <Link href="/teacher/dashboard">
            <Shield className="h-5 w-5" />
            <span className="sr-only">교사 관리</span>
          </Link>
        </Button>
      )}
      <Button variant="outline" size="icon" asChild>
        <Link href="/dashboard/profile">
          <User className="h-5 w-5" />
          <span className="sr-only">프로필</span>
        </Link>
      </Button>
      <Button variant="outline" size="icon" onClick={handleLogout}>
        <LogOut className="h-5 w-5" />
        <span className="sr-only">로그아웃</span>
      </Button>
    </div>
  )
}