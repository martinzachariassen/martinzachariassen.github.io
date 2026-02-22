import { linkifyToParts } from "../../terminal/text.js";
import "./OutputLine.css";
import type { OutputLine as OutputLineType } from "../../terminal/commands.js";

interface Props {
  line: OutputLineType & { id: string };
}

export default function OutputLine({ line }: Props) {
  const parts = linkifyToParts(line.text);

  return (
    <div className={`line ${line.tone ?? ""}`.trim()}>
      {parts.map((p, idx) => {
        if (p.type === "link") {
          return (
            <a key={idx} href={p.value} target="_blank" rel="noreferrer noopener">
              {p.value}
            </a>
          );
        }
        // parts are already HTML-escaped
        return <span key={idx} dangerouslySetInnerHTML={{ __html: p.value }} />;
      })}
    </div>
  );
}

