'use client'

import { useState, useEffect, useMemo, useTransition } from "react"
import { DiaryCard } from "@/components/diary-card"
import type { DiaryEntry, User } from "@/lib/definitions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell } from "recharts"
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { generateMyDiaryWelcomeMessage } from "@/ai/flows/generate-my-diary-welcome-flow"
import { Lightbulb, Loader2 } from "lucide-react"
import { getUser, getUserEntries } from "@/lib/actions"
import { useRouter } from "next/navigation"

const chartConfig = {
  기쁨: { label: "기쁨", color: "hsl(var(--primary))" },
  슬픔: { label: "슬픔", color: "hsl(var(--destructive))" },
  불안: { label: "불안", color: "hsl(var(--secondary))" },
  평온: { label: "평온", color: "hsl(var(--accent))" },
  '정보 없음': { label: "정보 없음", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

export default function MyDiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [isLoading, startLoading] = useTransition();
  const router = useRouter();
  
  useEffect(() => {
    const userId = localStorage.getItem('mampungsun_user_id');
    if (!userId) {
        router.push('/login');
        return;
    }

    startLoading(async () => {
      const [user, userEntries] = await Promise.all([
        getUser(userId),
        getUserEntries(userId)
      ]);
      setCurrentUser(user);
      setEntries(userEntries);

      try {
        const result = await generateMyDiaryWelcomeMessage();
        setWelcomeMessage(result.welcomeMessage || "내가 날린 마음의 풍선들을 다시 확인해보세요.");
      } catch (error) {
        console.error("Failed to generate welcome message:", error);
        setWelcomeMessage("내가 날린 마음의 풍선들을 다시 확인해보세요."); // Fallback message
      }
    });
  }, [router])
  
  const myEntries = entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const chartData = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentEntries = myEntries.filter(entry => new Date(entry.createdAt) > oneWeekAgo);

    if (recentEntries.length === 0) return [];
    
    const emotionCounts = recentEntries.reduce((acc, entry) => {
        const emotion = entry.dominantEmotion || '정보 없음';
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.keys(emotionCounts)
      .filter(emotion => emotion in chartConfig)
      .map(emotion => ({
          emotion,
          count: emotionCounts[emotion],
          fill: chartConfig[emotion as keyof typeof chartConfig].color
      }));
  }, [myEntries]);

  return (
    <>
      <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/10 mb-6 border border-primary/20">
        <Lightbulb className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
        <div>
          <h1 className="text-lg font-semibold md:text-xl font-headline text-primary">나의 맘풍선</h1>
          {isLoading ? (
             <p className="text-muted-foreground animate-pulse">따뜻한 격려의 말을 준비 중이에요...</p>
          ) : (
            <p className="text-muted-foreground">{welcomeMessage}</p>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">나의 마음 날씨</CardTitle>
            <CardDescription>최근 7일간 내가 기록한 감정 분포를 돌아보며 마음을 챙겨보세요.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">마음 날씨를 분석하고 있어요...</p>
                </div>
            ) : chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="emotion" />} />
                        <Pie data={chartData} dataKey="count" nameKey="emotion" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} className="stroke-background hover:opacity-80" />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="emotion" />} className="[&_.recharts-legend-item-text]:capitalize" />
                    </PieChart>
                </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-48">
                  <p className="text-muted-foreground text-center">
                    최근 7일간의 마음 날씨 데이터가 없어요.
                    <br />
                    맘풍선을 날려 나의 감정을 기록해보세요!
                  </p>
                </div>
            )}
        </CardContent>
      </Card>

      {isLoading ? (
         <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">내가 날린 맘풍선들을 돌아보고 있어요...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myEntries.length > 0 ? (
            myEntries.map(entry => (
                <DiaryCard 
                key={entry.id} 
                entry={entry} 
                author={currentUser} 
                currentUser={currentUser}
                />
            ))
            ) : (
            <p className="col-span-full text-center text-muted-foreground pt-8">아직 날린 맘풍선이 없어요. '새로운 맘풍선 날리기'로 첫 마음을 기록해보세요.</p>
            )}
        </div>
      )}
    </>
  )
}
