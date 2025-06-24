'use server';
/**
 * @fileOverview 학생의 별명을 기반으로 귀여운 아바타 이미지를 생성하는 AI 플로우입니다.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateAvatarInputSchema = z.object({
  nickname: z.string().describe('아바타를 생성할 학생의 별명입니다.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

export const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z.string().describe('생성된 아바타 이미지의 데이터 URI입니다.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
    return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A cute, friendly cartoon animal avatar based on the nickname '${input.nickname}'. The style should be a simple, colorful, flat vector illustration, perfect for a children's app profile picture. The character should be centered with a simple, solid light-colored background. No text or letters in the image.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed.');
    }

    return { avatarDataUri: media.url };
  }
);
