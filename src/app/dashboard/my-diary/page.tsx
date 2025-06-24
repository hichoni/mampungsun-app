'use client'

import { useState, useEffect, useMemo } from "react"
import { DiaryCard } from "@/components/diary-card"
import { mockDiaryEntries, mockUsers } from "@/lib/data"
import type { DiaryEntry, User, Comment } from "@/lib/definitions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell } from "recharts"
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  기쁨: { label: "기쁨", color: "hsl(var(--primary))" },
  슬픔: { label: "슬픔", color: "hsl(var(--destructive))" },
  불안: { label: "불안", color: "hsl(var(--secondary))" },
  평온: { label: "평온", color: "hsl(var(--accent))" },
  '정보 없음': { label: "정보 없음", color: "hsl(var(--muted))" },
} satisfies ChartConfig;


export default function MyDiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  
  useEffect(() => {
    const storedEntries = localStorage.getItem('diaryEntries');
    setEntries(storedEntries ? JSON.parse(storedEntries) : mockDiaryEntries);
  }, [])
  
  // In a real app, you'd fetch entries for the currently logged-in user
  const loggedInUserId = '4'; // Test User ID
  const myEntries = entries
    .filter(entry => entry.userId === loggedInUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const currentUser = mockUsers.find(user => user.id === loggedInUserId);

  const handleComment = (entryId: string, newComment: Comment) => {
    setEntries(currentEntries => {
      const newEntries = JSON.parse(JSON.stringify(currentEntries));
      const entryIndex = newEntries.findIndex((e: DiaryEntry) => e.id === entryId);
      if (entryIndex !== -1) {
        newEntries[entryIndex].comments.push(newComment);
        localStorage.setItem('diaryEntries', JSON.stringify(newEntries));
        return newEntries;
      }
      return currentEntries;
    });
  };
  
  const handleLikeEntry = (entryId: string, action: 'like' | 'unlike') => {
    setEntries(currentEntries => {
      const updatedEntries = currentEntries.map(entry => {
        if (entry.id === entryId) {
          const newLikes = action === 'like' ? entry.likes + 1 : Math.max(0, entry.likes - 1);
          return { ...entry, likes: newLikes };
        }
        return entry;
      });
      localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
      return updatedEntries;
    });
  };

  const handleLikeComment = (entryId: string, commentIndex: number, action: 'like' | 'unlike') => {
    setEntries(currentEntries => {
      const newEntries = JSON.parse(JSON.stringify(currentEntries));
      const entryIndex = newEntries.findIndex((e: DiaryEntry) => e.id === entryId);
      
      if (entryIndex === -1 || !newEntries[entryIndex].comments[commentIndex]) {
        return currentEntries;
      }
      
      const comment = newEntries[entryIndex].comments[commentIndex];
      comment.likes = action === 'like' ? comment.likes + 1 : Math.max(0, comment.likes - 1);
  
      localStorage.setItem('diaryEntries', JSON.stringify(newEntries));
      return newEntries;
    });
  };

  const handleDeleteComment = (entryId: string, commentIndex: number) => {
    // Students cannot delete comments from this view.
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl font-headline">나의 맘풍선</h1>
          <p className="text-muted-foreground">내가 날린 마음의 풍선들을 다시 확인해보세요.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">나의 마음 날씨</CardTitle>
            <CardDescription>최근 7일간 내가 기록한 감정 분포를 돌아보며 마음을 챙겨보세요.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            {chartData.length > 0 ? (
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {myEntries.length > 0 ? (
          myEntries.map(entry => (
            <DiaryCard 
              key={entry.id} 
              entry={entry} 
              author={currentUser} 
              onComment={handleComment} 
              onLikeEntry={handleLikeEntry}
              onLikeComment={handleLikeComment}
              onDeleteComment={handleDeleteComment}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">아직 날린 맘풍선이 없어요. '새로운 맘풍선 날리기'로 첫 마음을 기록해보세요.</p>
        )}
      </div>
    </>
  )
}
