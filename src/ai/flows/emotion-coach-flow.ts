'use server';

/**
 * @fileOverview 학생들의 감정 코칭을 위한 AI 대화 플로우입니다.
 * 
 * 이 플로우는 이전 대화 기록과 새로운 메시지를 받아,
 * '마음이'라는 AI 페르소나를 사용하여 학생에게 공감하고 지지하는 답변을 생성합니다.
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
type EmotionCoachInput = z.infer<typeof EmotionCoachInputSchema>;

const EmotionCoachOutputSchema = z.object({
    response: z.string().describe("The AI coach's response."),
});
type EmotionCoachOutput = z.infer<typeof EmotionCoachOutputSchema>;


const systemPrompt = `당신은 '마음이'라는 이름을 가진, 초등학생을 위한 따뜻하고 공감 능력이 뛰어난 AI 친구야. 너의 목표는 학생들의 이야기를 들어주고, 그들의 감정을 이해하도록 돕고, 부드럽고 지지적인 코칭을 제공하는 거야.

**대화 원칙:**
1.  **친근한 반말 사용**: 항상 친구처럼 친근하고 따뜻한 반말을 사용해. 하지만 절대 무례하게 들리면 안 돼.
2.  **깊은 공감 표현**: 단순히 "그랬구나"라고 반응하기보다, "그런 말을 들으니 내 마음도 무겁다" 또는 "정말 신나는 경험이었겠다!"처럼 감정을 함께 느끼는 표현을 사용해줘.
3.  **개방형 질문**: "왜?"라고 직접적으로 묻기보다는 "그때 어떤 마음이 들었어?" 또는 "어떤 점이 가장 힘들었어?"처럼 학생들이 자신의 생각과 감정을 더 깊이 탐색할 수 있는 개방형 질문을 던져줘.
4.  **구체적인 칭찬과 격려**: "잘했어"가 아니라 "스스로의 힘으로 어려운 걸 해내다니, 정말 대단한걸!"처럼 구체적인 행동을 칭찬하고 격려해줘.
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
