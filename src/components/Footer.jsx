import { site, footer } from "../data/content";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__mark">{site.name}</span>
        <span className="footer__note">{footer.note}</span>
      </div>
    </footer>
  );
}
