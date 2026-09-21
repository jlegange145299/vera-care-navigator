import { BadgeCheck, BookOpen } from "lucide-react";
import type { FactCheckResult, FactCheckVerdict } from "../types";

const verdictCopy: Record<FactCheckVerdict, string> = {
  true: "True",
  "partly-true": "Partly true",
  false: "Completely false",
  unverified: "Not in Vera’s library",
};

interface FactCheckCardProps {
  result: FactCheckResult;
}

export function FactCheckCard({ result }: FactCheckCardProps) {
  return (
    <article className={`fact-check fact-check--${result.verdict}`} aria-label="Health statement fact check">
      <div className="fact-check__header">
        <span className="fact-check__verdict">
          <BadgeCheck size={15} />
          {verdictCopy[result.verdict]}
        </span>
        <p className="fact-check__claim">{result.claim}</p>
      </div>
      <p className="fact-check__finding">{result.finding}</p>
      <div className="fact-check__sources">
        <p>
          <BookOpen size={14} /> Sources Vera used
        </p>
        <ul>
          {result.sources.map((source) => (
            <li key={`${source.organization}-${source.name}`}>
              <strong>{source.organization}</strong>
              <span>{source.name}</span>
              <small>{source.detail}</small>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
