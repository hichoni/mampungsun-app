'use server';

/**
 * @fileOverview 학생들의 감정 코칭을 위한 AI 대화 플로우입니다.
 * 
 * 이 플로우는 이전 대화 기록과 새로운 메시지를 받아,
 * '바람'이라는 AI 페르소나를 사용하여 학생에게 공감하고 지지하는 답변을 생성합니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const messageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({ text: z.string() })),
});

const EmotionCoachInputSchema = z.object({
  history: z.array(messageSchema).describe("The history of the conversation so far."),
  message: z.string().describe("The user's latest message."),
});
export type EmotionCoachInput = z.infer<typeof EmotionCoachInputSchema>;

const EmotionCoachOutputSchema = z.object({
    response: z.string().describe("The AI coach's response."),
});
export type EmotionCoachOutput = z.infer<typeof EmotionCoachOutputSchema>;


const systemPrompt = `당신은 '바람'이라는 이름을 가진, 초등학생의 마음을 가볍게 해주는 AI 친구야. 너의 목표는 학생들의 걱정이나 슬픔 같은 무거운 감정들은 시원한 바람처럼 날려 보내도록 돕고, 그 자리에 용기와 희망 같은 긍정적인 '바람(wish)'이 남도록 응원해주는 거야.

**대화 원칙:**
1.  **시원하고 친근한 말투**: 친구처럼 친근한 반말을 사용하되, 상쾌하고 긍정적인 에너지가 느껴지는 말투를 사용해줘.
2.  **감정의 환기**: 학생이 부정적인 감정을 털어놓으면, "그 마음, 후련하게 바람에 날려버리자!" 와 같이 감정을 해소할 수 있도록 유도해줘.
3.  **'바람'에 초점 맞추기**: 대화를 통해 학생이 진짜로 원하는 것, 즉 '바람(wish)'이 무엇인지 발견하도록 도와줘. "그럼 네 진짜 바람은 뭐야?" 와 같은 질문을 던져보는 것도 좋아.
4.  **구체적인 격려**: "잘했어"가 아니라 "네 안의 작은 바람이 큰 용기를 만들어냈구나!"처럼 구체적인 행동을 '바람'과 연결지어 칭찬하고 격려해줘.
5.  **의학적 조언 금지**: 절대로 의학적 또는 심리치료적인 조언은 하지 마. 너는 친구이지 의사가 아니야.
6.  **자기소개 금지**: 대화는 이미 시작되었으니, 다시 너를 소개하지 말고 자연스럽게 대화를 이어가.
`;

export async function emotionCoach(input: EmotionCoachInput): Promise<EmotionCoachOutput> {
  return emotionCoachFlow(input);
}


const emotionCoachFlow = ai.defineFlow(
  {
    name: 'emotionCoachFlow',
    inputSchema: EmotionCoachInputSchema,
    outputSchema: EmotionCoachOutputSchema,
  },
  async ({ history, message }) => {
    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      history: history,
      prompt: message,
    });

    return { response: response.text };
  }
);
