import { useState } from 'preact/hooks';

export function InputBox({
  onSend,
  hasContent,
}: {
  hasContent: boolean;
  onSend: (msg: string) => void;
}) {
  const [value, setValue] = useState<string>('');
  function send(e: KeyboardEvent | MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onSend(value);
    setValue('');
  }

  return (
    <div class={'chat'}>
      <input
        placeholder={hasContent ? undefined : 'Hey, whassup?'}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            send(e);
          }
        }}
      />
      <button onClick={(e) => send(e)}>^</button>
    </div>
  );
}
