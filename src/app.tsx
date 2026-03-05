import { InputBox } from './input-box.tsx';
import { useState } from 'preact/hooks';
import type { Message } from 'ollama';
import { AssistantLoaderContent, Messages } from './messages.tsx';
import { doStream } from './client.ts';
import { serializeError } from 'serialize-error';
import { Fire } from './fire.tsx';

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [working, setWorking] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [chunks, setChunks] = useState<string>('');

  const [burners, setBurners] = useState({
    a: 50,
    b: 60,
    c: 40,
    d: 20,
  });

  const input = (
    <InputBox
      hasContent={messages.length > 0}
      onSend={(msg) => {
        const newMessages = [
          ...messages,
          {
            role: 'user',
            content: msg,
          },
        ];
        setMessages(newMessages);
        setWorking(true);
        doStream(newMessages, {
          onChunk: (chunk) => setChunks((existing) => existing + chunk),
          onThought: () => {},
          onMessage: (msg) => {
            setChunks('');
            if (msg.ok) {
              setMessages((messages) => [...messages, msg.value]);
              setWorking(false);
            } else {
              console.error(msg.err);
              setError(msg.err);
            }
          },
        });
      }}
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
