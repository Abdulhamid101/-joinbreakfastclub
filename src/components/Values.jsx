import { values } from "../data/content";
import "./Values.css";

export default function Values() {
  return (
    <section className="values section">
      <div className="section__inner">
        <p className="eyebrow">What we hold onto</p>
        <h2 className="values__heading">Our values.</h2>
        <ul className="values__grid">
          {values.map((value) => (
            <li className="values__item" key={value.title}>
              <h3 className="values__title">{value.title}</h3>
              <p className="values__body">{value.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
