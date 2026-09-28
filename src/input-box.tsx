export function InputBox({
  onSend,
  hasContent,
  value,
  onChange,
}: {
  hasContent: boolean;
  value: string;
  onChange: (value: string) => void;
  onSend: (msg: string) => void;
}) {
  function send(e: KeyboardEvent | MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onSend(value);
  }

  return (
    <div class={'chat'}>
      <input
        placeholder={hasContent ? undefined : 'Hey, whassup?'}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
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
