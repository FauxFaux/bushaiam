import { Ollama } from 'ollama/browser';
import type { Message } from 'ollama';
import type { Result } from './ts.ts';
import ensureError from 'ensure-error';

interface Handlers {
  onThought: (chunk: string) => void;
  onChunk: (chunk: string) => void;
  onMessage: (msg: Result<Message>) => void;
}

export function doStream(messages: Message[], handlers: Handlers) {
  void worker(messages, handlers)
    .then((value) =>
      handlers.onMessage({
        ok: true,
        value,
      }),
    )
    .catch((err) =>
      handlers.onMessage({
        ok: false,
        err: ensureError(err),
      }),
    );
}

async function worker(
  messages: Message[],
  handlers: Handlers,
): Promise<Message> {
  const ollama = new Ollama({
    host: import.meta.env.VITE_OLLAMA_HOST ?? window.location.toString(),
  });

  const stream = await ollama.chat({
    model: 'goekdenizguelmez/josie:4b',
    messages,
    stream: true,
  });

  let inThinking = false;
  let content = '';
  let thinking = '';

  let lastMessage: Message | null = null;

  for await (const chunk of stream) {
    if (chunk.message.thinking) {
      if (!inThinking) {
        inThinking = true;
      }
      handlers.onThought(chunk.message.thinking);
      // accumulate the partial thinking
      thinking += chunk.message.thinking;
    } else if (chunk.message.content) {
      if (inThinking) {
        inThinking = false;
      }
      handlers.onChunk(chunk.message.content);
      // accumulate the partial content
      content += chunk.message.content;
    }
    lastMessage = chunk.message;
  }

  if (!lastMessage) throw new Error('nothing received');

  return {
    ...lastMessage,
    content,
    thinking,
  };
}
