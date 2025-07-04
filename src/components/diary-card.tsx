'use client'

import type { DiaryEntry, User, Comment } from "@/lib/definitions"
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
import { Heart, MessageCircle, Loader2, Trash2, Pin, Eye, Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useState, useTransition, useEffect } from "react"
import { ScrollArea } from "./ui/scroll-area"
import { Input } from "./ui/input"
import { moderateText } from "@/ai/flows/moderate-text-flow"
import { cn } from "@/lib/utils"
import { addComment, deleteComment, likeEntry, incrementVisitCount } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface DiaryCardProps {
  entry: DiaryEntry
  author: User | undefined
  currentUser: User | null
  onDeleteEntry?: (entryId: string) => void;
  onPinEntry?: (entryId: string, isPinned: boolean) => void;
  isTeacherView?: boolean;
}

const getEmotionBadgeVariant = (emotion: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (emotion) {
    case '기쁨': return 'default'
    case '슬픔': return 'destructive'
    case '불안': return 'secondary'
    case '분석 중...':
    case '분석 실패':
    default: return 'outline'
  }
}

export function DiaryCard({ entry, author, currentUser, onDeleteEntry, onPinEntry, isTeacherView = false }: DiaryCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(entry.likes || 0);
  const [visitCount, setVisitCount] = useState(entry.visitCount || 0);

  const [comments, setComments] = useState<Comment[]>(entry.comments || []);
  
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [timeAgo, setTimeAgo] = useState('');
  const [sessionVisited, setSessionVisited] = useState(false);
  
  const isAnalyzing = entry.dominantEmotion === '분석 중...';

  const calculateTimeAgo = () => {
    if (!entry.createdAt) return '';
    const entryDate = new Date(entry.createdAt as string);
    const seconds = Math.floor((new Date().getTime() - entryDate.getTime()) / 1000);
    
    if (isNaN(seconds) || seconds < 0) return '방금 전';
    if (seconds < 60) return `${Math.floor(seconds)}초 전`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}일 전`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}달 전`;

    return `${Math.floor(months / 12)}년 전`;
  };

  useEffect(() => {
    setTimeAgo(calculateTimeAgo());
    const timer = setInterval(() => setTimeAgo(calculateTimeAgo()), 60000);
    return () => clearInterval(timer);
  }, [entry.createdAt]);
  
  useEffect(() => {
    setIsLiked(!!currentUser?.id && !!entry.likedBy && entry.likedBy.includes(currentUser.id));
    setLikeCount(entry.likes || 0);
    setComments(entry.comments || []);
    setVisitCount(entry.visitCount || 0);
  }, [entry, currentUser]);

  const handleLikeToggle = () => {
    if (!currentUser) {
        toast({variant: "destructive", title: "로그인이 필요합니다."});
        router.push('/login');
        return;
    }
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    startTransition(async () => {
        try {
            await likeEntry(entry.id, currentUser.id);
        } catch(e) {
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
            toast({variant: "destructive", title: "오류", description: "좋아요 처리에 실패했습니다."});
        }
    });
  }

  const handlePostComment = (commentText: string) => {
    if (!commentText.trim()) {
        toast({variant: "destructive", title: "댓글을 입력해주세요."});
        return;
    }
    if (!currentUser) {
        toast({variant: "destructive", title: "로그인이 필요합니다."});
        return;
    }

    startTransition(async () => {
      const moderationResult = await moderateText({ text: commentText });

      if (moderationResult && moderationResult.isAppropriate) {
        
        setNewCommentText('');

        try {
            const newComment = await addComment(entry.id, {
                userId: currentUser.id,
                nickname: currentUser.nickname,
                avatarUrl: currentUser.avatarUrl,
                comment: commentText,
            });

            setComments(prev => [...prev, newComment]);
            toast({ title: "댓글이 등록되었어요." });
        } catch(e) {
            toast({ variant: "destructive", title: "댓글 등록 실패", description: "다시 시도해주세요." });
        }

      } else {
        toast({
            variant: "destructive",
            title: "부적절한 내용 감지",
            description: moderationResult?.reason || "따뜻하고 고운 말을 사용해주세요.",
        });
      }
    });
  }

  const handleDeleteComment = (commentId: string) => {
    startTransition(async () => {
        const originalComments = comments;
        setComments(prev => prev.filter(c => c.id !== commentId));
        try {
            await deleteComment(entry.id, commentId);
            toast({title: "성공", description: "댓글이 삭제되었습니다."});
        } catch (e) {
            setComments(originalComments);
            toast({variant: "destructive", title: "삭제 실패", description: "다시 시도해주세요."});
        }
    });
  }

  const handleSubmitCustomComment = (e: React.FormEvent) => {
    e.preventDefault();
    handlePostComment(newCommentText);
  };
  
  const handleDialogOpenChange = (open: boolean) => {
    if (open && currentUser && currentUser.id !== entry.userId && !sessionVisited) {
        setSessionVisited(true);
        startTransition(async () => {
            try {
              await incrementVisitCount(entry.id);
              setVisitCount(prev => prev + 1);
            } catch (e) {
              console.error("Failed to increment visit count", e);
            }
        });
    }
    setDialogOpen(open);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={author?.avatarUrl} alt={author?.nickname} />
            <AvatarFallback>{author?.nickname?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{author?.nickname || '알 수 없음'}</CardTitle>
            <CardDescription>{timeAgo || '방금 전'}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {entry.dominantEmotion && (
              <Badge variant={getEmotionBadgeVariant(entry.dominantEmotion)} className="flex-shrink-0 whitespace-nowrap">
                {isAnalyzing && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                {entry.dominantEmotion}
              </Badge>
            )}
            {isTeacherView && (
              <>
                {onPinEntry && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onPinEntry(entry.id, entry.isPinned || false)}>
                    <Pin className={cn("h-4 w-4", entry.isPinned && "fill-primary text-primary")} />
                    <span className="sr-only">고정하기</span>
                  </Button>
                )}
                {onDeleteEntry && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">맘풍선 삭제</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>정말 이 맘풍선을 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 작업은 되돌릴 수 없습니다. 이 맘풍선과 모든 댓글이 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteEntry(entry.id)} className="bg-destructive hover:bg-destructive/90">
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-base">{entry.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Eye className="h-4 w-4" />
            <span>{visitCount}</span>
        </div>
        <div className="flex gap-4">
            <Button variant="ghost" size="sm" onClick={handleLikeToggle} className="flex items-center gap-2" disabled={isPending}>
                <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                {likeCount}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2" disabled={isAnalyzing}>
                        {isAnalyzing ? <Bot className="h-4 w-4 animate-pulse" /> : <MessageCircle className="h-4 w-4" />}
                        {comments.length}
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
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                      <div key={comment.id} className="flex items-start gap-2">
                                          <Avatar className="w-8 h-8 border">
                                              <AvatarImage src={comment.avatarUrl} alt={comment.nickname} />
                                              <AvatarFallback>{comment.nickname?.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 space-y-1">
                                              <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                                                  <p className="font-semibold text-sm text-foreground">{comment.nickname}</p>
                                                  <p className="text-sm text-muted-foreground">{comment.comment}</p>
                                              </div>
                                              <div className="flex items-center gap-2 pl-2">
                                                  {isTeacherView && (
                                                       <AlertDialog>
                                                          <AlertDialogTrigger asChild>
                                                             <Button variant="ghost" size="sm" className="p-1 h-auto text-destructive hover:text-destructive">
                                                                <Trash2 className="h-3 w-3"/>
                                                             </Button>
                                                          </AlertDialogTrigger>
                                                          <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                                                              <AlertDialogDescription>
                                                                이 댓글은 되돌릴 수 없습니다. 댓글이 영구적으로 삭제됩니다.
                                                              </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                              <AlertDialogCancel>취소</AlertDialogCancel>
                                                              <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive hover:bg-destructive/90">
                                                                삭제
                                                              </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                          </AlertDialogContent>
                                                       </AlertDialog>
                                                  )}
                                              </div>
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
                                    <Button key={`sugg-${entry.id}-${index}`} variant="outline" onClick={() => handlePostComment(res)} disabled={isPending}>
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
                                disabled={isPending || !currentUser}
                            />
                            <Button type="submit" disabled={!newCommentText.trim() || isPending || !currentUser}>
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
