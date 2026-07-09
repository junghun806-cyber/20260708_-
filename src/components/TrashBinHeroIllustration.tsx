// Small hand-drawn-style SVG standing in for a real product photo — the lid
// swings open and a couple of "escaping" scraps drift up, playing off the
// "버리고 가자고" headline the same way the imweb reference's inset photo
// animates into its bold display type.
export default function TrashBinHeroIllustration() {
  return (
    <svg
      viewBox="0 0 200 240"
      className="h-full w-full"
      role="img"
      aria-label="열리는 쓰레기통 일러스트"
    >
      {/* escaping scraps */}
      <g className="hero-scrap hero-scrap-1">
        <circle cx="60" cy="118" r="7" fill="#ff385c" />
      </g>
      <g className="hero-scrap hero-scrap-2">
        <rect x="132" y="100" width="12" height="12" rx="3" fill="#222222" />
      </g>
      <g className="hero-scrap hero-scrap-3">
        <circle cx="118" cy="86" r="5" fill="#e00b41" />
      </g>

      {/* bin body */}
      <path
        d="M62 118 L138 118 L128 210 Q128 218 120 218 L80 218 Q72 218 72 210 Z"
        fill="#222222"
      />
      <rect x="62" y="112" width="76" height="12" rx="6" fill="#3f3f3f" />

      {/* lid, hinged at the back-left corner of the rim */}
      <g className="hero-lid" style={{ transformOrigin: "66px 108px" }}>
        <rect x="58" y="100" width="84" height="14" rx="7" fill="#ff385c" />
      </g>
    </svg>
  );
}
