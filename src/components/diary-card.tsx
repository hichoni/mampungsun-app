
'use client'

import type { DiaryEntry, User } from "@/lib/definitions"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface DiaryCardProps {
  entry: DiaryEntry
  author: User | undefined
}

const getEmotionBadgeVariant = (emotion: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (emotion) {
    case '기쁨': return 'default'
    case '슬픔': return 'destructive'
    case '불안': return 'secondary'
    default: return 'outline'
  }
}

export function DiaryCard({ entry, author }: DiaryCardProps) {
  const { toast } = useToast();
  const [likes, setLikes] = useState(entry.likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
        setLikes(likes - 1);
    } else {
        setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  }

  const handleComment = (comment: string) => {
    toast({
      title: "댓글이 등록되었어요.",
      description: `"${comment}"`,
    })
  }
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "년 전";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "달 전";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "일 전";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "시간 전";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "분 전";
    return Math.floor(seconds) + "초 전";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={`https://placehold.co/40x40.png?text=${author?.nickname.charAt(0)}`} />
            <AvatarFallback>{author?.nickname.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{author?.nickname}</CardTitle>
            <CardDescription>{timeAgo(entry.createdAt)}</CardDescription>
          </div>
          <Badge variant={getEmotionBadgeVariant(entry.dominantEmotion)} className="ml-auto">{entry.dominantEmotion}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base">{entry.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-4">
            <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                {likes}
            </Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {entry.comments.length}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>따뜻한 응원 보내기</DialogTitle>
                        <DialogDescription>
                            아래 응원/칭찬 메시지 중 하나를 선택해 마음을 전해보세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-2 mt-4">
                        {entry.suggestedResponses.map((res, index) => (
                            <Button key={index} variant="outline" onClick={() => handleComment(res)}>
                                {res}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}
