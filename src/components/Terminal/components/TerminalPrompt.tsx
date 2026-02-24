interface TerminalPromptProps {
  hacked: boolean;
  isMobile: boolean;
  inputValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoFocus: boolean;
}

export default function TerminalPrompt({
  hacked,
  isMobile,
  inputValue,
  inputRef,
  onKeyDown,
  onFocus,
  onChange,
  autoFocus,
}: TerminalPromptProps) {
  return (
    <div className="promptRow">
      <label htmlFor="cmd" className="sr-only">Enter a command</label>
      <div className="prompt" aria-hidden="true">
        {isMobile ? (
          <span className={hacked ? "p-sym hacked" : "p-sym"}>$</span>
        ) : (
          <>
            <span className={hacked ? "p-user hacked" : "p-user"}>
              {hacked ? "agent" : "guest"}
            </span>
            <span className="p-at">@</span>
            <span className="p-host">mlz</span>
            <span className="p-colon">:</span>
            <span className="p-path">~</span>
            <span className="p-sym">$</span>
          </>
        )}
      </div>
      <input
        id="cmd"
        ref={inputRef}
        aria-label="Command input"
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        inputMode="text"
        enterKeyHint="send"
        autoFocus={autoFocus}
        value={inputValue}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
      />
    </div>
  );
}

