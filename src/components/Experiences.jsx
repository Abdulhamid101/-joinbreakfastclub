import { experiencesSection, experienceCategories } from "../data/content";
import "./Experiences.css";

export default function Experiences() {
  return (
    <section className="experiences section">
      <div className="section__inner">
        <p className="eyebrow">{experiencesSection.eyebrow}</p>
        <h2 className="experiences__heading">{experiencesSection.heading}</h2>
        <p className="experiences__intro measure">
          {experiencesSection.intro}
        </p>
        <div className="experiences__grid">
          {experienceCategories.map((cat) => (
            <div className="experiences__card" key={cat.title}>
              <h3 className="experiences__title">{cat.title}</h3>
              <p className="experiences__body">{cat.body}</p>
              <ul className="experiences__tags">
                {cat.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
