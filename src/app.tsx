import { InputBox } from './input-box.tsx';
import {
  type Dispatch,
  type StateUpdater,
  useEffect,
  useState,
} from 'preact/hooks';
import type { Message, ToolCall } from 'ollama';
import { AssistantLoaderContent, Messages } from './messages.tsx';
import { serializeError } from 'serialize-error';
import { Fire } from './fire.tsx';
import { doStream } from './client.ts';

type Burners = Record<number, number>;

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [working, setWorking] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [chunks, setChunks] = useState<string>('');

  const [burners, setBurners] = useState<Burners>({
    1: 50,
    2: 60,
    3: 40,
    4: 20,
  });

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (!['user', 'tool'].includes(latestMessage?.role) || working) return;

    setWorking(true);
    doStream(messages, {
      onChunk: (chunk) => setChunks((existing) => existing + chunk),
      onThought: () => {},
      onMessage: (msg) => {
        setMessages((messages) => [...messages, msg]);
        if (msg.tool_calls) {
          handleCall(
            msg.tool_calls,
            (args) => handleBurnerCall(args.burner, args.amount, setBurners),
            setMessages,
          );
        }
      },
      onDone: (err) => {
        if (err) {
          console.error(err);
          setError(err);
        }
        setChunks('');
        setWorking(false);

        window.scrollTo({
          // bottom
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      },
    });
  }, [messages, working]);

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
  handler: (args: Record<string, unknown>) => string,
  setMessages: Dispatch<StateUpdater<Message[]>>,
) {
  for (const call of calls) {
    const content = handler(call.function.arguments);
    setMessages((messages) => [
      ...messages,
      {
        role: 'tool',
        content,
      },
    ]);
  }
}

function handleBurnerCall(
  key: unknown,
  value: unknown,
  setBurners: Dispatch<StateUpdater<Burners>>,
) {
  if (typeof key !== 'number' || !Number.isInteger(key) || key < 1 || key > 4) {
    return "'burner' must be 1, 2, 3 or 4";
  }
  if (typeof value !== 'number' || value < 0 || value > 100) {
    return "'amount' must be a positive number between 0 and 100";
  }
  setBurners((curr) => ({ ...curr, [key]: value }));
  return 'set';
}
