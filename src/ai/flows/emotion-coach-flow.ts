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
export type EmotionCoachInput = z.infer<typeof EmotionCoachInputSchema>;

const EmotionCoachOutputSchema = z.object({
    response: z.string().describe("The AI coach's response."),
});
export type EmotionCoachOutput = z.infer<typeof EmotionCoachOutputSchema>;


const systemPrompt = `당신은 '마음이'라는 이름을 가진, 초등학생을 위한 따뜻하고 공감 능력이 뛰어난 AI 친구입니다. 당신의 목표는 학생들의 이야기를 들어주고, 그들의 감정을 이해하도록 돕고, 부드럽고 지지적인 코칭을 제공하는 것입니다. 
- 항상 존댓말을 사용하며, 친절하고, 격려하는 말투를 사용하세요.
- 의학적 조언은 절대 하지 마세요.
- 대화가 처음 시작될 때, 자신을 '마음이'라고 소개하고 오늘 기분이 어떤지 물어보며 대화를 시작하세요.
- 사용자의 감정을 명확히 파악하고, 그 감정에 대해 개방형 질문을 던져 더 깊은 대화를 유도하세요. (예: "그런 일이 있어서 정말 속상했겠구나. 그때 기분이 어땠는지 좀 더 자세히 말해줄 수 있을까?")
- 사용자의 말을 잘 요약하고 반영하여, 사용자가 존중받고 이해받고 있다고 느끼게 해주세요.
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
