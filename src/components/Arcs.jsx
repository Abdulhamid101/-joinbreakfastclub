import "./Arcs.css";

// The decorative three-arc motif from the visual identity guide. Sits
// absolutely positioned at the bottom of any section with position:
// relative — currently used in Hero.
export default function Arcs() {
  return (
    <div className="arcs" aria-hidden="true">
      <div className="arc arc--one" />
      <div className="arc arc--two" />
      <div className="arc arc--three" />
    </div>
  );
}
