// Illustrated iced drink in a clear cup, tinted per drink. Used whenever a
// drink has no photo set in data/drinks.js.
export default function DrinkCup({ colors, className = "" }) {
  const { liquid, top, accent } = colors;
  const id = `cup-${liquid.replace("#", "")}`;
  return (
    <svg className={className} viewBox="0 0 160 200" aria-hidden="true">
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d="M34 52 L126 52 L114 186 Q113 192 107 192 L53 192 Q47 192 46 186 Z" />
        </clipPath>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.35" stopColor={liquid} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
      </defs>

      {/* straw */}
      <path d="M92 8 L104 4 L88 120" stroke={accent} strokeWidth="7" strokeLinecap="round" fill="none" />

      {/* liquid */}
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="20" y="66" width="120" height="140" fill={`url(#${id}-fill)`} />
        {/* ice */}
        <rect x="52" y="74" width="22" height="22" rx="5" fill="#fff" opacity="0.45" transform="rotate(-12 63 85)" />
        <rect x="84" y="90" width="20" height="20" rx="5" fill="#fff" opacity="0.38" transform="rotate(14 94 100)" />
        <rect x="60" y="112" width="18" height="18" rx="5" fill="#fff" opacity="0.3" transform="rotate(8 69 121)" />
      </g>

      {/* cup body + rim */}
      <path
        d="M34 52 L126 52 L114 186 Q113 192 107 192 L53 192 Q47 192 46 186 Z"
        fill="#fff"
        fillOpacity="0.14"
        stroke="#0e301f"
        strokeOpacity="0.18"
        strokeWidth="2"
      />
      <rect x="28" y="44" width="104" height="10" rx="5" fill="#fff" stroke="#0e301f" strokeOpacity="0.18" strokeWidth="2" />
      {/* shine */}
      <path d="M44 62 L52 176" stroke="#fff" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
      {/* label band */}
      <ellipse cx="80" cy="150" rx="17" ry="11" fill="#fcf0da" opacity="0.92" />
      <path d="M71 151 a9 6 0 0 1 18 0" stroke="#fca10c" strokeWidth="2.4" fill="none" />
      <path d="M75 153 a8 5 0 0 1 14 0" stroke="#84b82f" strokeWidth="2" fill="none" />
    </svg>
  );
}
