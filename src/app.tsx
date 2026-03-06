import { InputBox } from './input-box.tsx';
import { useEffect, useState } from 'preact/hooks';
import type { Message, ToolCall } from 'ollama';
import { AssistantLoaderContent, Messages } from './messages.tsx';
import { serializeError } from 'serialize-error';
import { Fire } from './fire.tsx';
import { doStream } from './client.ts';

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [working, setWorking] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [chunks, setChunks] = useState<string>('');

  const [burners, setBurners] = useState({
    1: 50,
    2: 60,
    3: 40,
    4: 20,
  });

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.role !== 'user' || working) return;

    doStream(messages, {
      onChunk: (chunk) => setChunks((existing) => existing + chunk),
      onThought: () => {},
      onMessage: (msg) => {
        setChunks('');
        if (msg.ok) {
          setMessages((messages) => [...messages, msg.value]);
          if (msg.value.tool_calls) {
            handleCall(msg.value.tool_calls, (key, value) =>
              setBurners((curr) => ({ ...curr, [key ?? 1]: value })),
            );
            setMessages((messages) => [
              ...messages,
              {
                role: 'tool',
                content: 'ok',
              },
            ]);
          }
          setWorking(false);
        } else {
          console.error(msg.err);
          setError(msg.err);
        }
      },
    });
  }, [messages]);

  const input = (
    <InputBox
      hasContent={messages.length > 0}
      onSend={(msg) =>
        setMessages((messages) => [
          ...messages,
          {
            role: 'user',
            content: msg,
          },
        ])
      }
    />
  );

  return (
    <>
      <h1 class={'writing-regular'}>Hark!</h1>
      <Messages messages={messages} />
      {error ? (
        <pre class={'error'}>
          {JSON.stringify(serializeError(error), null, 2)}
        </pre>
      ) : undefined}
      {working ? <AssistantLoaderContent content={chunks} /> : input}
      <div class={'fires'}>
        {Object.entries(burners).map(([name, strength]) => (
          <Fire name={name} strength={strength} />
        ))}
      </div>
    </>
  );
}

function handleCall(
  calls: ToolCall[],
  setBurner: (key: number, value: number) => void,
) {
  for (const call of calls) {
    setBurner(call.function.arguments.burner, call.function.arguments.amount);
  }
}
