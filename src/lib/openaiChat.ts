import { games, lessons } from '../data/learningContent';
type ChatRole = 'user' | 'assistant';

interface RequestMessage {
  role: ChatRole;
  text: string;
}

interface OpenAIChatContext {
  currentActivitySummary: string;
  progressSummary: string;
  recommendation: string;
}

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1-mini';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const buildSystemPrompt = (context: OpenAIChatContext) => {
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

export const hasOpenAIConfig = () => Boolean(OPENAI_API_KEY);

export const requestOpenAIChatReply = async (
  messages: RequestMessage[],
  context: OpenAIChatContext
) => {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing VITE_OPENAI_API_KEY');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: buildSystemPrompt(context) }],
        },
        ...messages.map((message) => ({
          role: message.role,
          content: [{ type: 'input_text', text: message.text }],
        })),
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'OpenAI request failed');
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{
      type?: string;
      role?: string;
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  const outputText =
    data.output_text?.trim() ||
    data.output
      ?.filter((item) => item.type === 'message' && item.role === 'assistant')
      .flatMap((item) => item.content ?? [])
      .filter((content) => content.type === 'output_text')
      .map((content) => content.text?.trim() || '')
      .join('\n')
      .trim();

  return outputText || 'I could not generate a response right now.';
};
