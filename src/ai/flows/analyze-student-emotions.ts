// 'use server';

/**
 * @fileOverview AI flow for analyzing student emotions in a 맘풍선 (emotional diary entry).
 *
 * This flow takes the text of a student's diary entry as input, analyzes the emotions expressed,
 * and suggests appropriate 응원/칭찬 (support/praise) responses to help the student better
 * understand and respond to their feelings.
 *
 * @param {AnalyzeStudentEmotionsInput} input - The input for the emotion analysis flow.
 * @returns {Promise<AnalyzeStudentEmotionsOutput>} - A promise that resolves to the analysis results and suggested responses.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStudentEmotionsInputSchema = z.object({
  diaryEntry: z
    .string()
    .describe('The text content of the student emotional diary entry (맘풍선).'),
});
export type AnalyzeStudentEmotionsInput = z.infer<typeof AnalyzeStudentEmotionsInputSchema>;

const AnalyzeStudentEmotionsOutputSchema = z.object({
  dominantEmotion: z
    .string()
    .describe('The primary emotion detected in the diary entry.'),
  suggestedResponses: z
    .array(z.string())
    .describe('An array of suggested 응원/칭찬 (support/praise) responses.'),
});
export type AnalyzeStudentEmotionsOutput = z.infer<typeof AnalyzeStudentEmotionsOutputSchema>;

export async function analyzeStudentEmotions(
  input: AnalyzeStudentEmotionsInput
): Promise<AnalyzeStudentEmotionsOutput> {
  return analyzeStudentEmotionsFlow(input);
}

const analyzeStudentEmotionsPrompt = ai.definePrompt({
  name: 'analyzeStudentEmotionsPrompt',
  input: {schema: AnalyzeStudentEmotionsInputSchema},
  output: {schema: AnalyzeStudentEmotionsOutputSchema},
  prompt: `You are a helpful AI assistant designed to analyze student diary entries and suggest supportive responses.

  Analyze the following diary entry and identify the dominant emotion expressed. Based on the emotion, suggest 3 응원/칭찬 (support/praise) responses that a peer might offer.

  Diary Entry: {{{diaryEntry}}}

  Format your response as a JSON object with 'dominantEmotion' and 'suggestedResponses' fields. suggestedResponses should be an array of strings.`,
});

const analyzeStudentEmotionsFlow = ai.defineFlow(
  {
    name: 'analyzeStudentEmotionsFlow',
    inputSchema: AnalyzeStudentEmotionsInputSchema,
    outputSchema: AnalyzeStudentEmotionsOutputSchema,
  },
  async input => {
    const {output} = await analyzeStudentEmotionsPrompt(input);
    return output!;
  }
);
