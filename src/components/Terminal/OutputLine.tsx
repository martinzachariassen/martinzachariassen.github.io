import { linkifyToParts } from "../../terminal/text.js";
import "./OutputLine.css";
import type { OutputLine as OutputLineType } from "../../terminal/commands.js";

interface Props {
  line: OutputLineType & { id: string };
}

// Parses "  Label    → https://..." into a labelled anchor
function parseLabelledLink(text: string): { prefix: string; label: string; url: string } | null {
  const match = text.match(/^(\s*)(.*?)\s+→\s+(https?:\/\/\S+)$/);
  if (!match) return null;
  return { prefix: match[1], label: match[2].trim(), url: match[3] };
}

export default function OutputLine({ line }: Props) {
  // Inline mixed-tone segments (e.g. whoami: "guest" accent + rest dim)
  if (line.parts?.length) {
    return (
      <div className="line">
        {line.parts.map((p, idx) => (
          <span key={idx} className={p.tone ?? ""}>{p.text}</span>
        ))}
      </div>
    );
  }

  if (!line.text) {
    return <div className="line spacer">&nbsp;</div>;
  }

  // Render labelled link lines as a proper anchor
  const labelled = parseLabelledLink(line.text);
  if (labelled) {
    return (
      <div className={`line ${line.tone ?? ""}`.trim()}>
        <span style={{ whiteSpace: "pre" }}>{labelled.prefix}</span>
        <a href={labelled.url} target="_blank" rel="noreferrer noopener">
          {labelled.label}
        </a>
        <span className="link-arrow"> → </span>
        <a href={labelled.url} target="_blank" rel="noreferrer noopener" className="link-url">
          {labelled.url}
        </a>
      </div>
    );
  }

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
        return <span key={idx} dangerouslySetInnerHTML={{ __html: p.value }} />;
      })}
    </div>
  );
}
