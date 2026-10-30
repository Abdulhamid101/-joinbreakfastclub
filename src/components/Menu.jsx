import { menuSection, menuItems } from "../data/content";
import "./Menu.css";

export default function Menu() {
  return (
    <section id="menu" className="menu section">
      <div className="section__inner menu__grid">
        <div className="menu__copy">
          <p className="eyebrow" data-reveal>{menuSection.eyebrow}</p>
          <h2 className="menu__heading" data-reveal style={{ "--d": 1 }}>
            {menuSection.heading}
          </h2>
          <p className="menu__intro" data-reveal style={{ "--d": 2 }}>
            {menuSection.intro}
          </p>
          <a className="btn btn--dark" href="/drinks" data-reveal style={{ "--d": 3 }}>
            {menuSection.orderCta} <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
        </div>

        <div className="menu__board" data-reveal style={{ "--d": 1 }}>
          <p className="menu__board-title">
            <span>Menu</span>
            <span className="menu__board-sat">Sat · AM</span>
          </p>
          <ul className="menu__list">
            {menuItems.map((item, i) => (
              <li className="menu__item" key={`${i}-${item.title}`}>
                <span className="menu__idx">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <h3 className="menu__item-title">{item.title}</h3>
                  <p className="menu__item-body">{item.body}</p>
                </span>
              </li>
            ))}
          </ul>
          <p className="menu__closing script">{menuSection.closing}</p>
        </div>
      </div>
    </section>
  );
}
