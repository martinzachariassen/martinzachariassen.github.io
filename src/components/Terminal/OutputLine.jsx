import { linkifyToParts } from "../../terminal/text.js";

export default function OutputLine({ line }) {
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

        // parts are already escaped
        return <span key={idx} dangerouslySetInnerHTML={{ __html: p.value }} />;
      })}
    </div>
  );
}

