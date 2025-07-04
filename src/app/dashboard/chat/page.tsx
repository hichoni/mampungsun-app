'use client'

import { useState, useRef, useEffect, useTransition, type SVGProps } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SendHorizonal, User, Loader2 } from "lucide-react"
import { emotionCoach, type EmotionCoachInput } from "@/ai/flows/emotion-coach-flow"
import { cn } from "@/lib/utils"
import type { User as UserType } from "@/lib/definitions"
import { getUser } from "@/lib/actions"
import { useRouter } from "next/navigation"

type Message = {
    role: 'user' | 'model';
    content: string;
}

const initialMessages: Message[] = [
    {
        role: 'model',
        content: "안녕! 나는 너의 마음속 복잡한 감정들을 시원한 바람에 날려 보낼 수 있도록 도와주는 AI 친구, '바람'이야. 너의 진짜 '바람'은 무엇인지 함께 이야기 나눠볼까?"
    }
]

function AiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}


export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    useEffect(() => {
        const userId = localStorage.getItem('mampungsun_user_id');
        if (!userId) {
            router.push('/login');
            return;
        }

        const fetchUser = async () => {
            const user = await getUser(userId);
            if (user) {
                setCurrentUser(user);
            } else {
                router.push('/login');
            }
        };

        fetchUser();
    }, [router])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentUser) return;

        const userInput = input;
        const newUserMessage: Message = { role: 'user', content: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');

        startTransition(async () => {
            const genkitHistory = messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));
            
            try {
                const result = await emotionCoach({ history: genkitHistory, message: userInput });

                if (result.response) {
                    const newAiMessage: Message = { role: 'model', content: result.response };
                    setMessages(prev => [...prev, newAiMessage]);
                } else {
                    throw new Error("AI did not return a response.");
                }
            } catch (error) {
                console.error("Emotion coach failed:", error);
                const errorMessage: Message = {
                    role: 'model',
                    content: '미안해, 지금은 응답할 수 없어. 잠시 후 다시 시도해 줄래?'
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        });
    }
    
    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
            <div className="flex-1 overflow-hidden">
                 <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4 space-y-6">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                {message.role === 'model' && (
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback><AiIcon className="w-5 h-5 text-primary" /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl text-base",
                                    message.role === 'user' 
                                        ? "bg-primary text-primary-foreground rounded-br-none" 
                                        : "bg-card text-card-foreground rounded-bl-none border"
                                )}>
                                    <p style={{whiteSpace: "pre-wrap"}}>{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                     <Avatar className="w-8 h-8">
                                        <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.nickname} />
                                        <AvatarFallback><User className="w-5 h-5"/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isPending && (
                            <div className="flex items-start gap-4 justify-start">
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback><AiIcon className="w-5 h-5 text-primary" /></AvatarFallback>
                                </Avatar>
                                <div className="max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl text-base bg-card text-card-foreground rounded-bl-none border">
                                   <div className="flex items-center justify-center gap-2">
                                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                                   </div>
                                </div>
                            </div>
                        )}
                    </div>
                 </ScrollArea>
            </div>
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input 
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="바람이에게 하고 싶은 말을 입력하세요..."
                        className="flex-1"
                        disabled={isPending}
                    />
                    <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                        <SendHorizonal className="w-5 h-5"/>
                        <span className="sr-only">전송</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}
