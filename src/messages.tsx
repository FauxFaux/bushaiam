import type { Message } from 'ollama';
import { FaUserInjured } from 'react-icons/fa6';
import dcIcon from './assets/dc.webp';

export function Messages({ messages }: { messages: Message[] }) {
  return messages.map((message) => {
    switch (message.role) {
      case 'user':
        return <UserContent content={message.content} />;
      case 'assistant':
        return <AssistantContent content={message.content} />;
    }

    return (
      <div class="message">
        {<pre>UNHANDLED: {JSON.stringify(message)}</pre>}
      </div>
    );
  });
}

function UserContent({ content }: { content: string }) {
  return (
    <div class="message">
      <span style={'margin: 0.8em'}>
        <FaUserInjured />
      </span>
      {content}
    </div>
  );
}

export function AssistantContent({ content }: { content: string }) {
  return (
    <div class="message assistant writing-regular">
      {content}
      <img class={'dc-icon'} src={dcIcon} />
    </div>
  );
}

export function AssistantLoaderContent({ content }: { content: string }) {
  return (
    <div class="message assistant writing-regular">
      {content || <span className="loader"></span>}
      <img class={'dc-icon'} src={dcIcon} />
    </div>
  );
}
