import OpenAI from 'openai';

/**
 * Returns server-side system instructions tailored to the selected tone.
 * PRIORITY 2:
 * Professional: Formal and professional.
 * Casual: Friendly and conversational.
 * Concise: Short and direct.
 */
export function getSystemPrompt(tone = 'Professional') {
  switch (tone) {
    case 'Casual':
      return 'You are AIChatbot. Your tone is friendly and conversational. Be warm, approachable, natural, and helpful.';
    case 'Concise':
      return 'You are AIChatbot. Your tone is short and direct. Deliver concise, bulleted, to-the-point answers without filler, preamble, or pleasantries.';
    case 'Professional':
    default:
      return 'You are AIChatbot. Your tone is formal and professional. Provide articulate, well-structured, objective, and polite responses.';
  }
}

/**
 * Streams real-time AI responses using the official OpenAI Node SDK.
 * Reads OPENAI_API_KEY from server/.env.
 * If key is not configured, streams helpful tone-aware setup instructions.
 */
export async function streamOpenAIResponse({
  content,
  tone = 'Professional',
  chatHistory = [],
  onToken,
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== 'your_openai_api_key_here' && apiKey.trim().startsWith('sk-')) {
    const openai = new OpenAI({ apiKey: apiKey.trim() });
    const systemPrompt = getSystemPrompt(tone);

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: content.trim() },
    ];

    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      temperature: tone === 'Concise' ? 0.2 : tone === 'Casual' ? 0.75 : 0.5,
      stream: true,
    });

    let fullText = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullText += delta;
        onToken(delta);
      }
    }
    return fullText;
  }

  // Fallback tone-aware response when API key is awaiting setup
  const query = content.trim();
  let fallbackMessage = '';

  if (tone === 'Concise') {
    fallbackMessage = `• Query: ${query}\n• Response [Concise]: OpenAI streaming pipeline is active.\n• Status: Add your OPENAI_API_KEY in server/.env to stream live GPT responses.`;
  } else if (tone === 'Casual') {
    fallbackMessage = `Hey there! I got your message: "${query}".\n\nThe streaming response system is working great. To get live answers from OpenAI, just paste your API key into server/.env and you're good to go!`;
  } else {
    fallbackMessage = `Thank you for your prompt regarding: "${query}".\n\nThe AIChatbot backend has successfully established a Server-Sent Events (SSE) streaming channel.\n\nTo enable live completions directly from OpenAI's models, configure your OPENAI_API_KEY in server/.env.`;
  }

  // Stream the fallback message in realistic word chunks
  const words = fallbackMessage.split(' ');
  let accumulated = '';
  for (let i = 0; i < words.length; i++) {
    const token = (i === 0 ? '' : ' ') + words[i];
    accumulated += token;
    onToken(token);
    await new Promise((r) => setTimeout(r, 20));
  }
  return accumulated;
}

/**
 * Non-streaming fallback for standard request/response calls
 */
export async function generateAIResponse(content, tone = 'Professional', chatHistory = []) {
  let fullText = '';
  await streamOpenAIResponse({
    content,
    tone,
    chatHistory,
    onToken: (token) => {
      fullText += token;
    },
  });
  return fullText;
}
