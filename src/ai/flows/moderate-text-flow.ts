'use server';

/**
 * @fileOverview 텍스트 내용의 부적절성을 검토하는 AI 플로우입니다.
 *
 * 이 플로우는 입력된 텍스트가 초등학생에게 적절한지 판단하고,
 * 부적절할 경우 그 이유를 설명합니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ModerateTextInputSchema = z.object({
  text: z.string().describe('검토할 텍스트 내용입니다.'),
});
export type ModerateTextInput = z.infer<typeof ModerateTextInputSchema>;

const ModerateTextOutputSchema = z.object({
  isAppropriate: z.boolean().describe('텍스트가 적절한지 여부입니다.'),
  reason: z.string().describe('부적절하다고 판단된 경우, 그 이유입니다. 적절한 경우 빈 문자열입니다.'),
});
export type ModerateTextOutput = z.infer<typeof ModerateTextOutputSchema>;

export async function moderateText(input: ModerateTextInput): Promise<ModerateTextOutput> {
  return moderateTextFlow(input);
}

const moderateTextPrompt = ai.definePrompt({
    name: 'moderateTextPrompt',
    input: { schema: ModerateTextInputSchema },
    output: { schema: ModerateTextOutputSchema },
    prompt: `당신은 초등학생용 애플리케이션의 텍스트를 검토하는 AI 안전 관리자입니다.
당신의 임무는 입력된 텍스트가 욕설, 비방, 폭력적인 내용, 따돌림 등 초등학생에게 부적절한 내용을 포함하고 있는지 판단하는 것입니다.

판단 기준:
- 폭력성, 선정성, 욕설, 차별적 발언이 포함되어 있으면 부적절합니다.
- 친구를 놀리거나 따돌리는 내용이 포함되어 있으면 부적절합니다.
- 긍정적이고 건전한 내용, 일상적인 대화는 적절합니다.

분석 후, 'isAppropriate' 필드를 true 또는 false로 설정해주세요.
만약 부적절하다면(isAppropriate: false), 'reason' 필드에 "따뜻하고 고운 말을 사용해주세요." 라고 설정해주세요.
적절하다면(isAppropriate: true), 'reason' 필드는 빈 문자열로 남겨두세요.

검토할 텍스트: {{{text}}}
`,
    config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      }
});


const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: ModerateTextInputSchema,
    outputSchema: ModerateTextOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await moderateTextPrompt(input);
        return output!;
    } catch(e) {
        // Safety settings can throw an error if content is blocked
        console.error("Moderation check failed due to safety settings:", e);
        return {
            isAppropriate: false,
            reason: '따뜻하고 고운 말을 사용해주세요.'
        }
    }
  }
);
