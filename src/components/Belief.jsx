import { belief } from "../data/content";
import "./Belief.css";

export default function Belief() {
  return (
    <section className="belief">
      <div className="belief__inner">
        {belief.lines.map((line) => (
          <p className="belief__line" key={line}>
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
