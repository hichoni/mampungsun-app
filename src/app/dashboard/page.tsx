'use client'

import { useState, useEffect, useTransition } from "react"
import { DiaryCard } from "@/components/diary-card"
import type { DiaryEntry, User, Comment, DiaryEntryAnalysisResult } from "@/lib/definitions"
import { generateAiComment } from "@/ai/flows/generate-ai-comment-flow"
import { analyzeStudentEmotions } from "@/ai/flows/analyze-student-emotions"
import { generateWelcomeMessage } from "@/ai/flows/generate-welcome-message-flow"
import { Lightbulb, Loader2 } from "lucide-react"
import { getPublicEntries, getAllStudents, addComment, getUser, updateDiaryEntryAnalysis } from "@/lib/actions"
import { db } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

const AI_CHEERER_ID = 'ai-cheerer';
const AI_COMMENT_THRESHOLD_HOURS = 1;

async function processAndAddAiComments(entries: DiaryEntry[], aiUser: User) {
    const now = new Date().getTime();
    const threshold = now - AI_COMMENT_THRESHOLD_HOURS * 60 * 60 * 1000;

    const commentPromises = entries
        .filter(entry => {
            const hasEngagement = (entry.likes || 0) > 0 || (entry.comments?.length || 0) > 0;
            const hasAiComment = entry.comments?.some(c => c.userId === AI_CHEERER_ID);
            const entryTime = new Date(entry.createdAt as string).getTime();
            return !hasEngagement && !hasAiComment && entryTime < threshold;
        })
        .map(async (entry) => {
            try {
                const result = await generateAiComment({ diaryEntryContent: entry.content });
                if (result.comment) {
                    const aiComment: Omit<Comment, 'id' | 'createdAt'> = {
                        userId: aiUser.id,
                        nickname: aiUser.nickname,
                        avatarUrl: aiUser.avatarUrl,
                        comment: result.comment,
                    };
                    await addComment(entry.id, aiComment);
                }
            } catch (error) {
                console.error(`Failed to generate AI comment for entry ${entry.id}:`, error);
            }
        });
    
    await Promise.allSettled(commentPromises);
    if (commentPromises.length > 0) {
        console.log("AI comment processing finished in the background.");
    }
}

async function processAndAnalyzeEmotions(entries: DiaryEntry[]) {
    const entriesToAnalyze = entries.filter(entry => entry.dominantEmotion === '분석 중...');

    if (entriesToAnalyze.length === 0) return;

    const analysisPromises = entriesToAnalyze.map(async (entry) => {
        try {
            const analysisResult = await analyzeStudentEmotions({ diaryEntry: entry.content });
            await updateDiaryEntryAnalysis(entry.id, analysisResult);
        } catch (error) {
            console.error(`Failed to analyze entry ${entry.id}:`, error);
            // Mark as failed to prevent retrying every time
            await updateDiaryEntryAnalysis(entry.id, { dominantEmotion: '분석 실패', suggestedResponses: [] });
        }
    });

    await Promise.allSettled(analysisPromises);
    if (analysisPromises.length > 0) {
        console.log("Emotion analysis processing finished in the background.");
    }
}


export default function DashboardPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [isLoadingWelcome, setIsLoadingWelcome] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('mampungsun_user_id');
    if (userId) {
        getUser(userId)
          .then(setCurrentUser)
          .catch(err => {
            console.error("Failed to get current user, logging out.", err);
            router.push('/login');
          });
    } else {
        router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!db) return;

    // Fetch welcome message in parallel
    setIsLoadingWelcome(true);
    generateWelcomeMessage()
      .then(result => {
        setWelcomeMessage(result.welcomeMessage || "친구들의 마음에 귀를 기울이고, 따뜻한 응원을 보내보세요!");
      })
      .catch(error => {
        console.error("Failed to generate welcome message:", error);
        setWelcomeMessage("친구들의 마음에 귀를 기울이고, 따뜻한 응원을 보내보세요!"); // Fallback message
      })
      .finally(() => {
        setIsLoadingWelcome(false);
      });
      
    // Fetch users and entries
    startLoading(async () => {
      try {
        const [users, initialEntries] = await Promise.all([getAllStudents(), getPublicEntries()]);
        setAllUsers(users);
        setEntries(initialEntries);

        // Non-blocking AI comment generation
        const aiUser = users.find(u => u.id === AI_CHEERER_ID);
        if (aiUser) {
          processAndAddAiComments(initialEntries, aiUser);
        }
        
        // Non-blocking emotion analysis
        processAndAnalyzeEmotions(initialEntries);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setEntries([]);
        setAllUsers([]);
      }
    });
  }, []);

  const findUserById = (userId: string): User | undefined => {
    return allUsers.find(user => user.id === userId);
  }

  if (!db) {
    return (
        <Alert variant="destructive" className="m-4">
            <AlertTitle>Firebase 미설정</AlertTitle>
            <AlertDescription>
                Firestore 데이터베이스 연동을 위한 환경 변수 설정이 필요합니다. `README.md` 파일을 참고하여 설정을 완료해주세요.
            </AlertDescription>
        </Alert>
    )
  }

  const sortedEntries = entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/10 mb-6 border border-primary/20">
        <Lightbulb className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
        <div>
          <h1 className="text-lg font-semibold md:text-xl font-headline text-primary">모두의 맘풍선</h1>
          {isLoadingWelcome ? (
             <p className="text-muted-foreground animate-pulse">따뜻한 환영 인사를 준비 중이에요...</p>
          ) : (
            <p className="text-muted-foreground">{welcomeMessage}</p>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">흩어진 맘풍선을 모으는 중이에요...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedEntries.map(entry => (
            <DiaryCard 
              key={entry.id} 
              entry={entry} 
              author={findUserById(entry.userId)} 
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </>
  )
}
