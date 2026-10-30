import { belief } from "../data/content";
import "./Belief.css";

export default function Belief() {
  const lines = belief.lines;
  const last = lines.length - 1;
  return (
    <section className="belief section">
      <div className="belief__inner">
        <span className="belief__quote" aria-hidden="true">“</span>
        {lines.map((line, i) => (
          <p
            className={i === last && lines.length > 1 ? "belief__line belief__line--accent script" : "belief__line"}
            key={`${i}-${line}`}
            data-reveal
            style={{ "--d": i }}
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
