import { moreThanMeetup } from "../data/content";
import "./MoreThanMeetup.css";

export default function MoreThanMeetup() {
  return (
    <section id="community" className="more section">
      <div className="section__inner more__grid">
        <div>
          <p className="eyebrow">{moreThanMeetup.eyebrow}</p>
          <h2 className="more__heading">{moreThanMeetup.heading}</h2>
          <p className="more__body measure">{moreThanMeetup.body}</p>
        </div>
        <div>
          <ul className="more__tags">
            {moreThanMeetup.initiatives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="more__closing measure">{moreThanMeetup.closing}</p>
        </div>
      </div>
    </section>
  );
}
