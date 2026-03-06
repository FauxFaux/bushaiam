import { Ollama } from 'ollama/browser';
import type { Message } from 'ollama';
import type { Result } from './ts.ts';
import ensureError from 'ensure-error';

interface Handlers {
  onThought: (chunk: string) => void;
  onChunk: (chunk: string) => void;
  onMessage: (msg: Message) => void;
  onDone: (err: Error | undefined) => void;
}

export function doStream(messages: Message[], handlers: Handlers) {
  void worker(messages, handlers)
    .then(() => handlers.onDone(undefined))
    .catch((err) => handlers.onDone(ensureError(err)));
}

async function worker(
  messages: Message[],
  { onThought, onChunk, onMessage, onDone }: Handlers,
): Promise<void> {
  const ollama = new Ollama({
    host: import.meta.env.VITE_OLLAMA_HOST ?? window.location.toString(),
  });

  const stream = await ollama.chat({
    model: 'goekdenizguelmez/josie:4b',
    messages,
    stream: true,
    tools: [
      {
        type: 'function',
        function: {
          name: 'setBurner',
          description:
            'control the amount of fire on a burner, as an integer percentage',
          parameters: {
            properties: {
              burner: {
                type: 'number',
              },
              amount: {
                type: 'number',
              },
            },
          },
        },
      },
    ],
  });

  let inThinking = false;
  let content = '';
  let thinking = '';

  for await (const chunk of stream) {
    const tools = !!chunk.message.tool_calls?.length;
    const thoughts = !!chunk.message.thinking
    if (chunk.message.thinking) {
      if (!inThinking) {
        inThinking = true;
      }
      onThought(chunk.message.thinking);
      // accumulate the partial thinking
      thinking += chunk.message.thinking;
    }

    if (chunk.message.content) {
      if (inThinking) {
        inThinking = false;
      }
      onChunk(chunk.message.content);
      // accumulate the partial content
      content += chunk.message.content;
    }

    if (chunk.message.tool_calls) {
      toolMessage = chunk.message;
    }
  }

  onDone();
}
