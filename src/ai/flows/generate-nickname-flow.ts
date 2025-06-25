'use server';

/**
 * @fileOverview 학생의 이름을 기반으로 긍정적이고 창의적인 별명을 생성하는 AI 플로우입니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateNicknameInputSchema = z.object({
  name: z.string().describe('별명을 생성할 학생의 이름입니다.'),
});
type GenerateNicknameInput = z.infer<typeof GenerateNicknameInputSchema>;

const GenerateNicknameOutputSchema = z.object({
  nickname: z.string().describe('생성된 별명입니다. "형용사+동물" 형식이어야 합니다.'),
});
type GenerateNicknameOutput = z.infer<typeof GenerateNicknameOutputSchema>;

export async function generateNickname(input: GenerateNicknameInput): Promise<GenerateNicknameOutput> {
  return generateNicknameFlow(input);
}

const generateNicknamePrompt = ai.definePrompt({
  name: 'generateNicknamePrompt',
  input: { schema: GenerateNicknameInputSchema },
  output: { schema: GenerateNicknameOutputSchema },
  prompt: `당신은 초등학생들을 위한 창의적인 별명 생성 전문가입니다.
학생의 이름 '{{{name}}}'을 보고, 그 학생에게 어울리는 긍정적이고 귀여운 별명을 "형용사+동물" 형식으로 하나만 생성해주세요.
예시: 행복한 토끼, 용감한 사자, 씩씩한 다람쥐

생성된 별명을 'nickname' 필드에 담아 JSON 형식으로 응답해주세요.`,
});

const generateNicknameFlow = ai.defineFlow(
  {
    name: 'generateNicknameFlow',
    inputSchema: GenerateNicknameInputSchema,
    outputSchema: GenerateNicknameOutputSchema,
  },
  async (input) => {
    const { output } = await generateNicknamePrompt(input);
    return output!;
  }
);
