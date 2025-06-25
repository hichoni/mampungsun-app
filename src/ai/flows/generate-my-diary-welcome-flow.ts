'use server';

/**
 * @fileOverview 사용자가 '나의 맘풍선' 페이지에 방문했을 때 보여줄 격려 메시지를 생성하는 AI 플로우입니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMyDiaryWelcomeMessageInputSchema = z.object({});
export type GenerateMyDiaryWelcomeMessageInput = z.infer<typeof GenerateMyDiaryWelcomeMessageInputSchema>;

const GenerateMyDiaryWelcomeMessageOutputSchema = z.object({
  welcomeMessage: z.string().describe('생성된 격려 메시지입니다.'),
});
export type GenerateMyDiaryWelcomeMessageOutput = z.infer<typeof GenerateMyDiaryWelcomeMessageOutputSchema>;

export async function generateMyDiaryWelcomeMessage(input?: GenerateMyDiaryWelcomeMessageInput): Promise<GenerateMyDiaryWelcomeMessageOutput> {
  return generateMyDiaryWelcomeMessageFlow(input ?? {});
}

const generateMyDiaryWelcomeMessagePrompt = ai.definePrompt({
  name: 'generateMyDiaryWelcomeMessagePrompt',
  input: { schema: GenerateMyDiaryWelcomeMessageInputSchema },
  output: { schema: GenerateMyDiaryWelcomeMessageOutputSchema },
  prompt: `당신은 초등학생용 앱 '맘풍선'의 따뜻하고 친근한 AI 도우미입니다.
'나의 맘풍선'은 자신이 기록했던 마음 풍선들을 돌아보며 스스로를 이해하고 성찰하는 개인적인 공간입니다.

'나의 맘풍선' 페이지에 방문한 학생을 위해, 이 공간의 의미를 설명하고 스스로를 돌아보도록 격려하는 짧고 따뜻한 메시지를 한두 문장으로 생성해주세요. 자신의 감정을 소중히 여기고, 과거의 경험을 통해 배우는 것의 중요성을 강조해주세요.

환영 메시지를 "welcomeMessage" 필드에 담아 JSON 형식으로 응답해주세요.`,
});

const generateMyDiaryWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'generateMyDiaryWelcomeMessageFlow',
    inputSchema: GenerateMyDiaryWelcomeMessageInputSchema,
    outputSchema: GenerateMyDiaryWelcomeMessageOutputSchema,
  },
  async (input) => {
    const { output } = await generateMyDiaryWelcomeMessagePrompt(input);
    return output!;
  }
);
