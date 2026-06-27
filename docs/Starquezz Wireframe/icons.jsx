// icons.jsx — shared SVG icon set + constellation renderer for Starquezz hi-fi directions.
// Friendly single-stroke icons (placeholders for future custom illustration).
// Exported to window for use across direction files.

const ICON_PATHS = {
  tooth: "M12 3.4c-2.6 0-4.2 1-5.1 2.1C5.7 6.9 5.6 8.4 6 10c.4 1.7.6 3 .9 4.6.3 1.9.6 4 1.8 4 .9 0 1-1.4 1.4-2.6.3-.8.5-1.3.9-1.3s.6.5.9 1.3c.4 1.2.5 2.6 1.4 2.6 1.2 0 1.5-2.1 1.8-4 .3-1.6.5-2.9.9-4.6.4-1.6.3-3.1-.9-4.5C16.2 4.4 14.6 3.4 12 3.4z",
  shirt: "M9 3.5 4.5 6.2 3 10l3 1.4L7 10v10.5h10V10l1 1.4 3-1.4-1.5-3.8L15 3.5l-3 2-3-2z",
  bowl: "M3.2 11.5h17.6a8.8 8.8 0 0 1-17.6 0z",
  bowlSteam: "M8.5 8c-.8-.8.4-1.6 0-2.7 M12 8c-.8-.8.4-1.6 0-2.7 M15.5 8c-.8-.8.4-1.6 0-2.7",
  book: "M12 6.2C10 5 7.7 4.2 4.5 4.2v12.6c3.2 0 5.5.8 7.5 2 2-1.2 4.3-2 7.5-2V4.2c-3.2 0-5.5.8-7.5 2zM12 6.2v12.6",
  backpack: "M7 8.5a5 5 0 0 1 10 0v10.2a1.3 1.3 0 0 1-1.3 1.3H8.3A1.3 1.3 0 0 1 7 18.7zM9.2 8.5a2.8 2.8 0 0 1 5.6 0M9 13.2h6",
  sun: "M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z",
  sunRays: "M12 2.6v2.2 M12 19.2v2.2 M21.4 12h-2.2 M4.8 12H2.6 M18.7 5.3l-1.6 1.6 M6.9 17.1l-1.6 1.6 M18.7 18.7l-1.6-1.6 M6.9 6.9 5.3 5.3",
  lock: "M6.3 11h11.4v8.7H6.3zM8.3 11V8a3.7 3.7 0 0 1 7.4 0v3",
  check: "M5 12.3l4.2 4.2L19 6.7",
  tent: "M3 19 12 5l9 14M12 5v14M8.4 19 12 13.6 15.6 19",
  moon: "M16.5 14.8A6.3 6.3 0 0 1 9.2 6.1a6.3 6.3 0 1 0 7.3 8.7z",
  flame: "M12 3c2.2 2.4 3.6 4.6 3.6 7.2a3.6 3.6 0 0 1-7.2 0c0-1.2.5-2.2 1.2-3 .1 1.2 1 1.7 1.6 1.4C10.4 7.8 10.6 5.6 12 3z",
  teeth: "tooth",
};

function SqzIcon({ name, size = 24, stroke = 2.1, color = "currentColor", fill = "none", style = {} }) {
  const extra = [];
  if (name === "bowl") extra.push(ICON_PATHS.bowlSteam);
  if (name === "sun") extra.push(ICON_PATHS.sunRays);
  const main = ICON_PATHS[name] || ICON_PATHS.check;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={main} />
      {extra.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

// 4-point sparkle star path at (cx,cy) radius r
function sparkPath(cx, cy, r) {
  const t = r * 0.30;
  return `M${cx},${cy - r} L${cx + t},${cy - t} L${cx + r},${cy} L${cx + t},${cy + t} L${cx},${cy + r} L${cx - t},${cy + t} L${cx - r},${cy} L${cx - t},${cy - t} Z`;
}

function StarToken({ size = 18, color = "#E8A33D", glow = false, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible", ...style }}>
      {glow && <circle cx="12" cy="12" r="9" fill={color} opacity="0.28" style={{ filter: "blur(3px)" }} />}
      <path d={sparkPath(12, 12, 10)} fill={color} />
    </svg>
  );
}

// Constellation forming a tent (the camp-out Big Dream). 6 of 12 stars earned.
// palette: { line, filled, faint, glow (bool), pulse (color) }
const CONSTELLATION_PTS = [
  // earned (the tent skeleton) — 6
  { x: 130, y: 22, r: 9, on: true },   // apex
  { x: 86, y: 86, r: 7, on: true },    // left mid
  { x: 174, y: 86, r: 7, on: true },   // right mid
  { x: 42, y: 150, r: 8, on: true },   // left base
  { x: 130, y: 150, r: 7, on: true },  // center base
  { x: 218, y: 150, r: 8, on: true },  // right base
  // to earn — 6 faint
  { x: 108, y: 52, r: 6, on: false },
  { x: 152, y: 52, r: 6, on: false },
  { x: 64, y: 118, r: 6, on: false },
  { x: 196, y: 118, r: 6, on: false },
  { x: 130, y: 96, r: 5, on: false },
  { x: 130, y: 122, r: 5, on: false },
];
const CONSTELLATION_EDGES = [
  [0, 1], [1, 3], [0, 2], [2, 5], [3, 4], [4, 5], [0, 4], // tent skeleton (earned)
];

function Constellation({ palette, width = 260, height = 188, extraLit = 0, flashNew = false }) {
  const p = palette;
  const faintOrder = CONSTELLATION_PTS.map((pt, i) => ({ pt, i })).filter((o) => !o.pt.on);
  const lit = new Set();
  CONSTELLATION_PTS.forEach((pt, i) => { if (pt.on) lit.add(i); });
  for (let k = 0; k < extraLit && k < faintOrder.length; k++) lit.add(faintOrder[k].i);
  const newlyIdx = extraLit > 0 ? faintOrder[Math.min(extraLit, faintOrder.length) - 1].i : -1;
  return (
    <svg viewBox="0 0 260 188" width={width} height={height} style={{ overflow: "visible" }}>
      {CONSTELLATION_EDGES.map(([a, b], i) => {
        const A = CONSTELLATION_PTS[a], B = CONSTELLATION_PTS[b];
        const on = lit.has(a) && lit.has(b);
        return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
          stroke={on ? p.filled : p.line} strokeWidth={on ? 2 : 1.4}
          strokeLinecap="round" opacity={on ? 0.55 : 0.28}
          strokeDasharray={on ? "0" : "3 5"} />;
      })}
      {CONSTELLATION_PTS.map((pt, i) => lit.has(i) ? (
        <g key={i} className={flashNew && i === newlyIdx ? "land-flash" : ""}>
          {p.glow && <circle cx={pt.x} cy={pt.y} r={pt.r + 5} fill={p.filled} opacity="0.25" style={{ filter: "blur(3px)" }} />}
          <path d={sparkPath(pt.x, pt.y, pt.r)} fill={p.filled} />
        </g>
      ) : (
        <path key={i} d={sparkPath(pt.x, pt.y, pt.r)} fill="none" stroke={p.faint} strokeWidth="1.4" opacity="0.6" />
      ))}
    </svg>
  );
}

Object.assign(window, { SqzIcon, StarToken, Constellation, sparkPath, KidAvatar });

// Friendly illustrated kid avatar (placeholder for the uploaded photo).
function KidAvatar({ size = 46, bg = "#F4C56B", skin = "#F0B98C", hair = "#5A3A22", style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ borderRadius: "50%", ...style }}>
      <rect width="48" height="48" fill={bg} />
      <circle cx="24" cy="44" r="15" fill={skin} />
      <circle cx="24" cy="22" r="11" fill={skin} />
      <path d="M13 21c0-8 5-12 11-12s11 4 11 12c0-2-3-3-4-4-2 2-12 2-14 0-1 1-4 2-4 4z" fill={hair} />
      <circle cx="20" cy="22" r="1.5" fill="#3a2a1a" />
      <circle cx="28" cy="22" r="1.5" fill="#3a2a1a" />
      <path d="M21 26c1.6 1.4 4.4 1.4 6 0" stroke="#a86b4a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
