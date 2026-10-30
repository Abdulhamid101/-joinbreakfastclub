import { experiencesSection, experienceCategories } from "../data/content";
import "./Experiences.css";

export default function Experiences() {
  return (
    <section id="experiences" className="experiences section">
      <div className="section__inner">
        <div className="experiences__head">
          <div className="sec-head">
            <p className="eyebrow" data-reveal>{experiencesSection.eyebrow}</p>
            <h2 data-reveal style={{ "--d": 1 }}>{experiencesSection.heading}</h2>
          </div>
          <p className="experiences__intro" data-reveal style={{ "--d": 2 }}>
            {experiencesSection.intro}
          </p>
        </div>
        <div className="experiences__grid">
          {experienceCategories.map((cat, i) => (
            <article className="experiences__card" key={`${i}-${cat.title}`} data-reveal style={{ "--d": i }}>
              <div className="experiences__top">
                <span className="experiences__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="experiences__count">{cat.tags.length} ways</span>
              </div>
              <h3 className="experiences__title">{cat.title}</h3>
              <p className="experiences__body">{cat.body}</p>
              <ul className="chips experiences__tags">
                {cat.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
