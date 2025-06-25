'use client'

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from 'lucide-react';
import { analyzeStudentEmotions } from '@/ai/flows/analyze-student-emotions';
import { useToast } from '@/hooks/use-toast';
import { addDiaryEntry } from '@/lib/actions';

interface NewDiaryFormProps {
    userId: string;
}

export function NewDiaryForm({ userId }: NewDiaryFormProps) {
  const [isSubmitting, startSubmitting] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const [diaryEntry, setDiaryEntry] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = () => {
    if (diaryEntry.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "일기는 10자 이상이어야 AI가 감정을 분석할 수 있어요.",
      });
      return;
    }
    
    startSubmitting(async () => {
      try {
        // AI 감정 분석을 먼저 수행합니다.
        const analysisResult = await analyzeStudentEmotions({ diaryEntry });

        const newEntryData = {
          userId: userId,
          content: diaryEntry,
          isPublic: isPublic,
          dominantEmotion: analysisResult.dominantEmotion,
          suggestedResponses: analysisResult.suggestedResponses,
        };

        await addDiaryEntry(newEntryData);
        
        toast({
          title: "맘풍선을 날렸어요!",
          description: "당신의 마음이 잘 전달되었을 거예요.",
        });
    
        router.push('/dashboard/my-diary');

      } catch (error) {
        console.error("Failed to analyze or save diary entry", error);
        toast({
          variant: "destructive",
          title: "저장 실패",
          description: "맘풍선을 저장하는 중 문제가 발생했습니다. API 키 설정을 확인해주세요.",
        });
      }
    });
  };

  const isPending = isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">새로운 맘풍선 날리기</CardTitle>
        <CardDescription>오늘 어떤 마음이었나요? 솔직한 감정을 기록해보세요. AI가 자동으로 감정을 분석해줄 거예요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="여기에 오늘 있었던 일과 느낀 점을 자유롭게 적어보세요..."
          className="min-h-[200px] text-base"
          value={diaryEntry}
          onChange={(e) => setDiaryEntry(e.target.value)}
          disabled={isPending}
        />
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isPending}/>
          <Label htmlFor="is-public">다른 친구들에게 공개하기</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isPending}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            맘풍선 날리기
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
