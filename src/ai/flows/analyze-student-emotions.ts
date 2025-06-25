// 'use server';

/**
 * @fileOverview 맘풍선(감정 일기)에 담긴 학생의 감정을 분석하기 위한 AI 플로우입니다.
 *
 * 이 플로우는 학생의 일기 텍스트를 입력받아 표현된 감정을 분석하고,
 * 학생이 자신의 감정을 더 잘 이해하고 반응할 수 있도록 돕는 적절한 응원/칭찬 메시지를 제안합니다.
 *
 * @param {AnalyzeStudentEmotionsInput} input - 감정 분석 플로우에 대한 입력입니다.
 * @returns {Promise<AnalyzeStudentEmotionsOutput>} - 분석 결과와 제안된 응답으로 확인되는 프로미스입니다.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStudentEmotionsInputSchema = z.object({
  diaryEntry: z
    .string()
    .describe('학생의 감정 일기(맘풍선)의 텍스트 내용입니다.'),
});
type AnalyzeStudentEmotionsInput = z.infer<typeof AnalyzeStudentEmotionsInputSchema>;

const AnalyzeStudentEmotionsOutputSchema = z.object({
  dominantEmotion: z
    .string()
    .describe('일기에서 감지된 주된 감정입니다.'),
  suggestedResponses: z
    .array(z.string())
    .describe('제안된 응원/칭찬 메시지의 배열입니다.'),
});
type AnalyzeStudentEmotionsOutput = z.infer<typeof AnalyzeStudentEmotionsOutputSchema>;

export async function analyzeStudentEmotions(
  input: AnalyzeStudentEmotionsInput
): Promise<AnalyzeStudentEmotionsOutput> {
  return analyzeStudentEmotionsFlow(input);
}

const analyzeStudentEmotionsPrompt = ai.definePrompt({
  name: 'analyzeStudentEmotionsPrompt',
  input: {schema: AnalyzeStudentEmotionsInputSchema},
  output: {schema: AnalyzeStudentEmotionsOutputSchema},
  prompt: `당신은 학생의 일기를 분석하고 지지적인 반응을 제안하도록 설계된 도움이 되는 AI 어시스턴트입니다.

  다음 일기 내용을 분석하여 표현된 주된 감정을 파악하세요. 그 감정을 바탕으로, 또래 친구가 해줄 법한 응원/칭찬 메시지 3가지를 제안해주세요.

  일기 내용: {{{diaryEntry}}}

  응답을 'dominantEmotion'과 'suggestedResponses' 필드를 가진 JSON 객체 형식으로 작성해주세요. suggestedResponses는 문자열 배열이어야 합니다.`,
});

const analyzeStudentEmotionsFlow = ai.defineFlow(
  {
    name: 'analyzeStudentEmotionsFlow',
    inputSchema: AnalyzeStudentEmotionsInputSchema,
    outputSchema: AnalyzeStudentEmotionsOutputSchema,
  },
  async input => {
    const {output} = await analyzeStudentEmotionsPrompt(input);
    return output!;
  }
);
