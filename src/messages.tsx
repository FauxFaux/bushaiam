import type { Message } from 'ollama';
import { FaUserInjured } from 'react-icons/fa6';
import dcIcon from './assets/dc.webp';

export function Messages({ messages }: { messages: Message[] }) {
  return messages.map((message) => {
    switch (message.role) {
      case 'user':
        return <UserContent content={message.content} />;
      case 'assistant':
        if (message.content) {
          return <AssistantContent content={message.content} />;
        } else {
          return <AssistantCall calls={message.tool_calls!} />;
        }
        break;
      case 'tool':
        return <UserTool content={message.content} />;
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

function UserTool({ content }: { content: string }) {
  return (
    <div class="message mono">
      <span style={'margin: 0.8em'}>
        <FaUserInjured />
      </span>
      SKREEEEEE! BZZZT! OPERATION COMPLETE! {content}
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

export function AssistantCall({
  calls,
}: {
  calls: Required<Message>['tool_calls'];
}) {
  return (
    <div class="message assistant mono">
      BEEP! BOOP!{' '}
      {calls.map(
        (call) =>
          call.function.name +
          '(' +
          JSON.stringify(call.function.arguments) +
          ')',
      )}
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
