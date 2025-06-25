'use server';
/**
 * @fileOverview 학생의 별명을 기반으로 귀여운 아바타 이미지를 생성하고 Firebase Storage에 업로드하는 AI 플로우입니다.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const GenerateAvatarInputSchema = z.object({
  nickname: z.string().describe('아바타를 생성할 학생의 별명입니다.'),
  userId: z.string().describe('아바타를 생성할 학생의 고유 ID입니다. 이미지 저장 경로에 사용됩니다.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarUrl: z.string().describe('Firebase Storage에 업로드된 아바타 이미지의 URL입니다.'),
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
    if (!storage) {
        throw new Error("Firebase Storage is not configured. Please check environment variables.");
    }
      
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Cute, friendly, cartoon animal character based on the nickname ${input.nickname}. Simple, colorful, flat vector illustration style. Centered character on a plain, light-colored background. No text or letters in the image. Perfect for a child's profile picture.`,
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
    
    // The generated data URI is too large for Firestore. Upload to Firebase Storage instead.
    const storageRef = ref(storage, `avatars/${input.userId}/${new Date().getTime()}.png`);
    const uploadResult = await uploadString(storageRef, media.url, 'data_url');
    const downloadUrl = await getDownloadURL(uploadResult.ref);

    return { avatarUrl: downloadUrl };
  }
);
