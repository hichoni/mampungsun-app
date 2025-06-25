'use server';
/**
 * @fileOverview 학생의 별명을 기반으로 귀여운 아바타 이미지를 생성하는 AI 플로우입니다.
 * 이 플로우는 이미지 데이터 URI를 반환하며, 클라이언트에서 Firebase Storage에 업로드해야 합니다.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAvatarInputSchema = z.object({
  nickname: z.string().describe('아바타를 생성할 학생의 별명입니다.'),
  userId: z.string().describe('아바타를 생성할 학생의 고유 ID입니다. (참고용)'),
});
type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  imageDataUri: z.string().describe('Base64로 인코딩된 생성된 아바타 이미지의 데이터 URI입니다.'),
});
type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

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
      prompt: `귀여운 만화 동물 캐릭터, '${input.nickname}'라는 별명을 바탕으로. 단순하고, 다채로우며, 플랫 벡터 일러스트 스타일. 단색의 밝은 배경에 캐릭터가 중앙에 위치. 이미지에 글자나 텍스트 없음. 아이의 프로필 사진으로 완벽함.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed. No media was returned.');
    }
    
    return { imageDataUri: media.url };
  }
);
