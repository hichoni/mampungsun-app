'use client'

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lightbulb, Loader2 } from 'lucide-react';
import { analyzeStudentEmotions, type AnalyzeStudentEmotionsOutput } from '@/ai/flows/analyze-student-emotions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { DiaryEntry } from '@/lib/definitions';
import { addDiaryEntry } from '@/lib/actions';

interface NewDiaryFormProps {
    userId: string;
}

export function NewDiaryForm({ userId }: NewDiaryFormProps) {
  const [isSubmitting, startSubmitting] = useTransition();
  const [isAnalyzing, startAnalyzing] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const [diaryEntry, setDiaryEntry] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeStudentEmotionsOutput | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const handleAnalyze = () => {
    if (diaryEntry.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "일기는 10자 이상이어야 분석할 수 있어요.",
      });
      return;
    }

    startAnalyzing(async () => {
      try {
        const result = await analyzeStudentEmotions({ diaryEntry });
        if (result) {
          setAnalysis(result);
        } else {
          toast({
            variant: "destructive",
            title: "분석 실패",
            description: "AI 감정 분석에 실패했어요. 잠시 후 다시 시도해주세요.",
          });
        }
      } catch (error) {
        toast({
            variant: "destructive",
            title: "분석 오류",
            description: "AI 감정 분석 중 오류가 발생했습니다. API 키 설정을 확인해주세요.",
        });
      }
    });
  };

  const handleSubmit = () => {
    if (diaryEntry.trim().length === 0) {
         toast({
            variant: "destructive",
            title: "오류",
            description: "일기 내용을 입력해주세요.",
         });
         return;
    }
    
    startSubmitting(async () => {
        const newEntryData = {
          userId: userId,
          content: diaryEntry,
          isPublic: isPublic,
          dominantEmotion: analysis?.dominantEmotion || '평온',
          suggestedResponses: analysis?.suggestedResponses || ['오늘 하루도 수고했어.', '평범한 날도 소중해.', '내일은 더 좋은 일이 있을 거야.'],
        };

        try {
            await addDiaryEntry(newEntryData);
            
            toast({
              title: "맘풍선을 날렸어요!",
              description: "당신의 마음이 잘 전달되었을 거예요.",
            });
        
            router.push('/dashboard/my-diary');

        } catch (error) {
            console.error("Failed to save to Firestore", error);
            toast({
                variant: "destructive",
                title: "저장 실패",
                description: "맘풍선을 저장하는 중 문제가 발생했습니다.",
            });
        }
    });
  };

  const isPending = isAnalyzing || isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">새로운 맘풍선 날리기</CardTitle>
        <CardDescription>오늘 어떤 마음이었나요? 솔직한 감정을 기록해보세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="여기에 오늘 있었던 일과 느낀 점을 자유롭게 적어보세요..."
          className="min-h-[200px] text-base"
          value={diaryEntry}
          onChange={(e) => setDiaryEntry(e.target.value)}
          disabled={isPending}
        />
        {analysis && (
          <Alert className="bg-accent/50">
            <Lightbulb className="h-4 w-4" />
            <AlertTitle className="font-semibold text-accent-foreground">AI 감정 분석 결과</AlertTitle>
            <AlertDescription className="text-accent-foreground/90">
              <p className="mb-2">AI가 분석한 주요 감정은 '<strong>{analysis.dominantEmotion}</strong>'인 것 같아요.</p>
              <p>이런 마음이 들 때 도움이 될 만한 생각들이에요:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {analysis.suggestedResponses.map((res, i) => (
                  <li key={i}>{res}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isPending}/>
          <Label htmlFor="is-public">다른 친구들에게 공개하기</Label>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleAnalyze} disabled={isPending}>
            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4"/>}
            AI 감정 분석
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            맘풍선 날리기
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
