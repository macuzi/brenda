import { DEFAULT_MODEL, getAnthropicClient } from './ai/client';

export async function generateAltText(imageUrl: string): Promise<string> {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: imageUrl } },
          {
            type: 'text',
            text: `Generate concise alt text for this image.
Rules:
- Be specific and descriptive
- Don't start with "Image of" or "Picture of"
- Keep under 125 characters
- If purely decorative, return exactly: decorative`,
          },
        ],
      },
    ],
  });

  const block = message.content.find((b) => b.type === 'text');
  if (block && block.type === 'text') return block.text;
  throw new Error('Response did not include text');
}
