'use client'
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="font-headline">이런, 문제가 발생했어요</CardTitle>
                <CardDescription>페이지를 불러오는 중 오류가 발생했습니다.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => reset()}>
                    다시 시도하기
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}
