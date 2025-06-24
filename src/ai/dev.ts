import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-student-emotions.ts';
import '@/ai/flows/emotion-coach-flow.ts';
import '@/ai/flows/moderate-text-flow.ts';
import '@/ai/flows/generate-ai-comment-flow.ts';
import '@/ai/flows/generate-nickname-flow.ts';
import '@/ai/flows/generate-welcome-message-flow.ts';
import '@/ai/flows/generate-my-diary-welcome-flow.ts';
