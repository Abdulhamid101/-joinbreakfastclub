import { menuSection, menuItems } from "../data/content";
import "./Menu.css";

export default function Menu() {
  return (
    <section id="menu" className="menu section">
      <div className="section__inner">
        <p className="eyebrow">{menuSection.eyebrow}</p>
        <h2 className="menu__heading">{menuSection.heading}</h2>
        <p className="menu__intro measure">{menuSection.intro}</p>
        <ul className="menu__grid">
          {menuItems.map((item) => (
            <li className="menu__item" key={item.title}>
              <h3 className="menu__item-title">{item.title}</h3>
              <p className="menu__item-body">{item.body}</p>
            </li>
          ))}
        </ul>
        <div className="menu__order">
          <a className="btn" href="/drinks">
            {menuSection.orderCta} →
          </a>
        </div>
        <p className="menu__closing script">{menuSection.closing}</p>
      </div>
    </section>
  );
}
