'use server';

/**
 * @fileOverview 사용자가 '모두의 맘풍선' 페이지에 방문했을 때 보여줄 따뜻한 환영 메시지를 생성하는 AI 플로우입니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateWelcomeMessageInputSchema = z.object({});
export type GenerateWelcomeMessageInput = z.infer<typeof GenerateWelcomeMessageInputSchema>;

const GenerateWelcomeMessageOutputSchema = z.object({
  welcomeMessage: z.string().describe('생성된 환영 메시지입니다.'),
});
export type GenerateWelcomeMessageOutput = z.infer<typeof GenerateWelcomeMessageOutputSchema>;

export async function generateWelcomeMessage(input?: GenerateWelcomeMessageInput): Promise<GenerateWelcomeMessageOutput> {
  return generateWelcomeMessageFlow(input ?? {});
}

const generateWelcomeMessagePrompt = ai.definePrompt({
  name: 'generateWelcomeMessagePrompt',
  input: { schema: GenerateWelcomeMessageInputSchema },
  output: { schema: GenerateWelcomeMessageOutputSchema },
  prompt: `당신은 초등학생용 앱 '맘풍선'의 따뜻하고 친근한 AI 도우미입니다.
'모두의 맘풍선'은 친구들이 용기를 내어 공개적으로 띄운 마음 풍선들을 구경하고, 따뜻한 응원을 보낼 수 있는 공간입니다.

'모두의 맘풍선' 페이지에 방문한 학생을 위해, 이 공간을 소개하는 짧고 따뜻한 환영 메시지를 한두 문장으로 생성해주세요. 친구들의 이야기에 귀 기울이고, 따뜻한 마음을 나눠보도록 격려하는 내용을 포함해주세요.

환영 메시지를 "welcomeMessage" 필드에 담아 JSON 형식으로 응답해주세요.`,
});

const generateWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'generateWelcomeMessageFlow',
    inputSchema: GenerateWelcomeMessageInputSchema,
    outputSchema: GenerateWelcomeMessageOutputSchema,
  },
  async (input) => {
    const { output } = await generateWelcomeMessagePrompt(input);
    return output!;
  }
);
