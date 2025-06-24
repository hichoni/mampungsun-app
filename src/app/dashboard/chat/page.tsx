'use client'

import { useState, useRef, useEffect, useTransition, type SVGProps } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SendHorizonal, User } from "lucide-react"
import { emotionCoach, type EmotionCoachInput } from "@/ai/flows/emotion-coach-flow"
import { cn } from "@/lib/utils"

type Message = {
    role: 'user' | 'model';
    content: string;
}

const initialMessages: Message[] = [
    {
        role: 'model',
        content: '안녕! 나는 너의 마음을 들어주고 함께 이야기 나눌 AI 친구, 마음이라고 해. 오늘 기분은 어때?'
    }
]

function AiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newUserMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');

        startTransition(async () => {
            const genkitHistory = messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));
            
            const result = await emotionCoach({ history: genkitHistory, message: input });

            if (result.response) {
                const newAiMessage: Message = { role: 'model', content: result.response };
                setMessages(prev => [...prev, newAiMessage]);
            }
        });
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
                        placeholder="마음이에게 하고 싶은 말을 입력하세요..."
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
