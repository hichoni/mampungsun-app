'use server';

/**
 * @fileOverview 일정 시간 동안 반응이 없는 맘풍선에 AI가 자동으로 따뜻한 응원 댓글을 달아주는 플로우입니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAiCommentInputSchema = z.object({
  diaryEntryContent: z.string().describe('학생의 맘풍선(일기) 내용입니다.'),
});
type GenerateAiCommentInput = z.infer<typeof GenerateAiCommentInputSchema>;

const GenerateAiCommentOutputSchema = z.object({
  comment: z.string().describe('AI 응원 요정이 생성한 따뜻한 응원 댓글입니다.'),
});
type GenerateAiCommentOutput = z.infer<typeof GenerateAiCommentOutputSchema>;

export async function generateAiComment(input: GenerateAiCommentInput): Promise<GenerateAiCommentOutput> {
  return generateAiCommentFlow(input);
}

const generateAiCommentPrompt = ai.definePrompt({
  name: 'generateAiCommentPrompt',
  input: { schema: GenerateAiCommentInputSchema },
  output: { schema: GenerateAiCommentOutputSchema },
  prompt: `당신은 초등학생용 앱 '맘풍선'의 '응원 요정'입니다.
한 학생이 아래와 같이 일기를 썼지만, 아직 아무런 응원이나 '좋아요'를 받지 못했습니다.
그 학생을 위해 따뜻하고 힘이 나는 응원 댓글을 친구처럼 반말로 작성해주세요. 댓글은 짧고 긍정적이어야 합니다.

학생의 일기 내용:
{{{diaryEntryContent}}}

당신의 응원 댓글을 "comment" 필드에 담아 JSON 형식으로 응답해주세요.`,
});

const generateAiCommentFlow = ai.defineFlow(
  {
    name: 'generateAiCommentFlow',
    inputSchema: GenerateAiCommentInputSchema,
    outputSchema: GenerateAiCommentOutputSchema,
  },
  async (input) => {
    const { output } = await generateAiCommentPrompt(input);
    return output!;
  }
);
