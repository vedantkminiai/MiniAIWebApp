import { games, lessons } from '../data/learningContent';
type ChatRole = 'user' | 'assistant';

interface RequestMessage {
  role: ChatRole;
  text: string;
}

interface GeminiChatContext {
  currentActivitySummary: string;
  progressSummary: string;
  recommendation: string;
}

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const buildSystemPrompt = (context: GeminiChatContext) => {
  const lessonGuide = lessons
    .map((lesson) => `${lesson.title}: ${lesson.helperSummary}`)
    .join('\n');
  const gameGuide = games
    .map((game) => `${game.title}: ${game.helperSummary}`)
    .join('\n');

  return `You are MiniAI Helper, a friendly educational chatbot for children ages 6 to 12.
Use short, clear language.
Be encouraging without sounding childish.
Stay focused on AI education, the user's progress, and the activities available inside the app.
If the user asks something unrelated or unsafe, gently redirect back to the learning app.
Do not claim to perform actions you cannot perform.

User progress:
${context.progressSummary}

Recommendation:
${context.recommendation}

Current activity:
${context.currentActivitySummary}

Lessons:
${lessonGuide}

Games:
${gameGuide}`;
};

export const hasGeminiConfig = () => Boolean(GEMINI_API_KEY);

export const requestGeminiChatReply = async (
  messages: RequestMessage[],
  context: GeminiChatContext
) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(context) }],
        },
        contents: messages.map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.text }],
        })),
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    try {
      const parsedError = JSON.parse(errorText) as {
        error?: {
          code?: number;
          message?: string;
          status?: string;
        };
      };
      throw new Error(parsedError.error?.message || parsedError.error?.status || errorText);
    } catch {
      throw new Error(errorText || 'Gemini request failed');
    }
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
    promptFeedback?: {
      blockReason?: string;
    };
  };

  if (data.promptFeedback?.blockReason) {
    return 'I could not answer that request right now. Please try asking about AI lessons, games, or your progress.';
  }

  const outputText = data.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text?.trim() || '')
    .filter(Boolean)
    .join('\n')
    .trim();

  return outputText || 'I could not generate a response right now.';
};
