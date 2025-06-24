
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
import { Heart, MessageCircle, Loader2 } from "lucide-react"
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
import { useState, useTransition } from "react"
import { mockUsers } from "@/lib/data"
import { ScrollArea } from "./ui/scroll-area"
import { Input } from "./ui/input"
import { moderateText } from "@/ai/flows/moderate-text-flow"

interface DiaryCardProps {
  entry: DiaryEntry
  author: User | undefined
  onComment: (entryId: string, comment: { userId: string; nickname: string; comment: string }) => void;
}

const getEmotionBadgeVariant = (emotion: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (emotion) {
    case '기쁨': return 'default'
    case '슬픔': return 'destructive'
    case '불안': return 'secondary'
    default: return 'outline'
  }
}

export function DiaryCard({ entry, author, onComment }: DiaryCardProps) {
  const { toast } = useToast();
  const [likes, setLikes] = useState(entry.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPending, startTransition] = useTransition();

  const commenter = mockUsers.find(u => u.id === '4');

  const handleLike = () => {
    if (isLiked) {
        setLikes(likes - 1);
    } else {
        setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  }

  const handlePostComment = (commentText: string) => {
    if (!commentText.trim() || !commenter) return;

    startTransition(async () => {
      const moderationResult = await moderateText({ text: commentText });

      if (moderationResult && moderationResult.isAppropriate) {
        const newCommentPayload = {
          userId: commenter.id,
          nickname: commenter.nickname,
          comment: commentText,
        };
    
        onComment(entry.id, newCommentPayload);
        
        toast({
          title: "댓글이 등록되었어요.",
          description: `"${commentText}"`,
        });

        setNewCommentText('');
      } else {
        toast({
            variant: "destructive",
            title: "부적절한 내용 감지",
            description: moderationResult?.reason || "따뜻하고 고운 말을 사용해주세요.",
        });
      }
    });
  }

  const handleSubmitCustomComment = (e: React.FormEvent) => {
    e.preventDefault();
    handlePostComment(newCommentText);
  };


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
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {entry.comments.length}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>응원 보내기 및 댓글 보기</DialogTitle>
                        <DialogDescription>
                            따뜻한 응원의 말을 보내거나, 다른 친구들의 댓글을 확인해보세요.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 my-4 overflow-hidden">
                        <ScrollArea className="h-full pr-6">
                            <div className="space-y-4">
                                {entry.comments.length > 0 ? (
                                    entry.comments.map((comment, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <Avatar className="w-8 h-8 border">
                                                <AvatarImage src={`https://placehold.co/40x40.png?text=${comment.nickname.charAt(0)}`} />
                                                <AvatarFallback>{comment.nickname.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-full">
                                                <p className="font-semibold text-sm text-foreground">{comment.nickname}</p>
                                                <p className="text-sm text-muted-foreground">{comment.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-muted-foreground py-4">
                                        아직 응원의 댓글이 없어요. <br/> 첫 번째로 따뜻한 마음을 전해보세요!
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="mt-auto space-y-4 border-t pt-4">
                        <div>
                            <p className="text-sm font-medium mb-2 text-foreground">AI 추천 응원 메시지</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {entry.suggestedResponses.map((res, index) => (
                                    <Button key={index} variant="outline" onClick={() => handlePostComment(res)} disabled={isPending}>
                                        {res}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmitCustomComment} className="flex items-center gap-2">
                            <Input
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="직접 응원 메시지를 입력할 수도 있어요."
                                className="flex-1"
                                disabled={isPending}
                            />
                            <Button type="submit" disabled={!newCommentText.trim() || isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "전송"}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}
