// cosmic_onbart.jsx — Finch-style SVG illustration scenes for onboarding.
// Cohesive with the app: stars Zee + the habit/adventure visual language.
// Exports: OnbScene1, OnbScene2, OnbScene3.

function _zee(cx, cy, r, mood) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 4} fill="#FFD66B" opacity="0.30" style={{ filter: "blur(5px)" }} />
      <path d={czStarPath(cx, cy, r)} fill="#FFE49C" stroke="#FFC94D" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx={cx - r * 0.30} cy={cy + r * 0.20} rx={r * 0.15} ry={r * 0.10} fill="#FF9ECB" opacity="0.55" />
      <ellipse cx={cx + r * 0.30} cy={cy + r * 0.20} rx={r * 0.15} ry={r * 0.10} fill="#FF9ECB" opacity="0.55" />
      <circle cx={cx - r * 0.22} cy={cy - r * 0.02} r={r * 0.10} fill="#3A2E5E" />
      <circle cx={cx + r * 0.22} cy={cy - r * 0.02} r={r * 0.10} fill="#3A2E5E" />
      <circle cx={cx - r * 0.19} cy={cy - r * 0.06} r={r * 0.035} fill="#fff" />
      <circle cx={cx + r * 0.25} cy={cy - r * 0.06} r={r * 0.035} fill="#fff" />
      <path d={mood === "cheer"
        ? `M${cx - r * 0.22},${cy + r * 0.22} q${r * 0.22},${r * 0.34} ${r * 0.44},0`
        : `M${cx - r * 0.20},${cy + r * 0.24} q${r * 0.20},${r * 0.22} ${r * 0.40},0`}
        stroke="#3A2E5E" strokeWidth={r * 0.10} fill="none" strokeLinecap="round" />
    </g>
  );
}

function _spark(cx, cy, r, c = "#CFE3FF", o = 0.9) {
  return <path d={sparkPath(cx, cy, r)} fill={c} opacity={o} />;
}

function _frame(children) {
  return (
    <svg viewBox="0 0 280 196" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
      {children}
    </svg>
  );
}

/* Scene 1 — pick the adventures (the rewards worth earning) */
function OnbScene1() {
  const tok = (x, y, kind) => (
    <g>
      <rect x={x - 23} y={y - 23} width="46" height="46" rx="14" fill="#16224A" stroke="rgba(255,214,107,.45)" strokeWidth="1.6" />
      {kind === "tent" && <g stroke="#9FF0D0" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={`M${x},${y - 11} L${x + 12},${y + 10} L${x - 12},${y + 10} Z`} /><path d={`M${x},${y - 11} L${x},${y + 10}`} /></g>}
      {kind === "sun" && <g stroke="#FFD66B" strokeWidth="2" fill="none" strokeLinecap="round">
        <circle cx={x} cy={y} r="6.5" fill="rgba(255,214,107,.25)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
          const rad = a * Math.PI / 180; return <line key={i} x1={x + Math.cos(rad) * 9.5} y1={y + Math.sin(rad) * 9.5} x2={x + Math.cos(rad) * 12.5} y2={y + Math.sin(rad) * 12.5} />;
        })}</g>}
      {kind === "book" && <g stroke="#8DEBFF" strokeWidth="2" fill="none" strokeLinejoin="round">
        <path d={`M${x},${y - 8} C${x - 4},${y - 10} ${x - 9},${y - 10} ${x - 12},${y - 8} L${x - 12},${y + 9} C${x - 9},${y + 7} ${x - 4},${y + 7} ${x},${y + 9}`} />
        <path d={`M${x},${y - 8} C${x + 4},${y - 10} ${x + 9},${y - 10} ${x + 12},${y - 8} L${x + 12},${y + 9} C${x + 9},${y + 7} ${x + 4},${y + 7} ${x},${y + 9}`} /></g>}
    </g>
  );
  return _frame(
    <g>
      <path d="M40,116 Q140,34 240,116" stroke="rgba(180,196,255,.35)" strokeWidth="1.6" fill="none" strokeDasharray="3 6" />
      {_spark(60, 60, 4)}{_spark(220, 54, 5, "#FFE49C")}{_spark(140, 30, 3)}{_spark(248, 150, 3)}{_spark(34, 150, 4, "#9FF0D0")}
      {tok(64, 96, "sun")}{tok(140, 60, "tent")}{tok(216, 96, "book")}
      {_zee(140, 150, 26, "cheer")}
    </g>
  );
}

/* Scene 2 — habits that fit (a small, tailored board) */
function OnbScene2() {
  const row = (y, on, kind) => (
    <g>
      <rect x="92" y={y - 13} width="26" height="26" rx="8" fill="rgba(141,235,255,.16)" />
      {kind === "tooth" && <path d={`M105,${y - 7} c-3,0 -5,1.4 -5,4 0,2.4 1.4,7 2.4,7 .7,0 .7,-2 1.3,-2 .6,0 .6,2 1.3,2 1,0 2.4,-4.6 2.4,-7 0,-2.6 -2,-4 -2.4,-4z`} fill="none" stroke="#9FECFF" strokeWidth="1.5" />}
      {kind === "shirt" && <path d={`M99,${y - 7} l-3,2 1.6,2.4 1.4,-1 V${y + 7} h10 V${y - 3.6} l1.4,1 1.6,-2.4 -3,-2 -2,1.4 -2,-1.4z`} fill="none" stroke="#9FECFF" strokeWidth="1.5" strokeLinejoin="round" />}
      {kind === "book" && <path d={`M105,${y - 6} c-2,-1.2 -4,-1.6 -6.5,-1.6 V${y + 6} c2.5,0 4.5,.5 6.5,1.6 2,-1.1 4,-1.6 6.5,-1.6 V${y - 7.6} c-2.5,0 -4.5,.4 -6.5,1.6z`} fill="none" stroke="#9FECFF" strokeWidth="1.5" strokeLinejoin="round" />}
      <rect x="126" y={y - 3.5} width={on ? 44 : 52} height="7" rx="3.5" fill="rgba(255,255,255,.12)" />
      {on
        ? <g><circle cx="182" cy={y} r="9" fill="#FFD66B" /><path d={`M178,${y} l3,3 5,-5`} stroke="#241A03" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
        : <circle cx="182" cy={y} r="9" fill="none" stroke="rgba(170,195,225,.6)" strokeWidth="2" />}
    </g>
  );
  return _frame(
    <g>
      {_spark(54, 50, 5, "#FFE49C")}{_spark(240, 46, 4)}{_spark(246, 150, 4, "#9FF0D0")}{_spark(40, 132, 3)}
      <rect x="74" y="44" width="132" height="108" rx="18" fill="#0F1E3C" stroke="rgba(180,196,255,.3)" strokeWidth="1.6" />
      {row(70, true, "tooth")}{row(98, true, "shirt")}{row(126, false, "book")}
      {/* Zee tailoring with a pencil */}
      {_zee(228, 138, 22, "awake")}
      <g stroke="#FF87C4" strokeWidth="3" strokeLinecap="round"><line x1="214" y1="120" x2="206" y2="110" /></g>
      <circle cx="204" cy="108" r="2.4" fill="#FFE49C" />
    </g>
  );
}

/* Scene 3 — kid runs the morning → stars → time together */
function OnbScene3() {
  return _frame(
    <g>
      {_spark(140, 30, 4, "#FFE49C")}{_spark(44, 40, 3)}{_spark(244, 60, 4)}
      {/* kid (agency) */}
      <g>
        <circle cx="50" cy="104" r="24" fill="#3A4790" />
        <circle cx="50" cy="112" r="16" fill="#E6AE82" />
        <circle cx="50" cy="100" r="13" fill="#E6AE82" />
        <path d="M38,99 c0-9 6-13 12-13 s12,4 12,13 c0-2-3-3-4-4 -2,2 -12,2 -14,0 -1,1 -4,2 -6,4z" fill="#2A2240" />
        <circle cx="46" cy="100" r="1.6" fill="#3a2a1a" /><circle cx="54" cy="100" r="1.6" fill="#3a2a1a" />
        <path d="M46,104 c1.6,1.4 4.4,1.4 6,0" stroke="#a86b4a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <g><circle cx="66" cy="118" r="8" fill="#5BE5C0" /><path d="M62,118 l3,3 5,-5" stroke="#072a22" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
      </g>
      {/* star travelling to the jar */}
      <path d="M74,92 Q104,64 132,84" stroke="rgba(255,214,107,.5)" strokeWidth="1.6" fill="none" strokeDasharray="3 5" />
      {_spark(104, 70, 6, "#FFE49C")}
      {/* jar */}
      <g>
        <rect x="120" y="86" width="48" height="54" rx="12" fill="rgba(141,235,255,.07)" stroke="rgba(141,235,255,.4)" strokeWidth="2" />
        <rect x="130" y="80" width="28" height="7" rx="3.5" fill="rgba(141,235,255,.35)" />
        {_spark(133, 124, 5, "#FFD66B")}{_spark(146, 116, 5, "#FFD66B")}{_spark(156, 126, 4, "#FFD66B")}{_spark(140, 130, 4, "#FFD66B")}
      </g>
      {/* arrow → together */}
      <path d="M172,114 H198" stroke="rgba(180,196,255,.45)" strokeWidth="1.6" fill="none" strokeDasharray="3 5" />
      <path d="M194,109 l5,5 -5,5" stroke="rgba(180,196,255,.6)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* together: parent + kid under a heart */}
      <g>
        <path d="M236,86 c-3,-6 -12,-4 -12,3 0,5 7,9 12,13 5,-4 12,-8 12,-13 0,-7 -9,-9 -12,-3z" fill="#FF87C4" opacity="0.9" />
        <circle cx="228" cy="120" r="12" fill="#34428A" /><circle cx="228" cy="126" r="8" fill="#E6AE82" /><circle cx="228" cy="116" r="6.5" fill="#E6AE82" />
        <path d="M222,115 c0-5 3-7 6-7 s6,2 6,7 c0-1-1.5-1.5-2-2 -1,1 -7,1 -8,0 -.5,.5 -2,1 -2,2z" fill="#2A2240" />
        <circle cx="248" cy="124" r="9" fill="#7A3A6A" /><circle cx="248" cy="129" r="6" fill="#F0C49A" /><circle cx="248" cy="121" r="5" fill="#F0C49A" />
        <path d="M243,121 c0-4 2.5-5 5-5 s5,1 5,5 c0-1-1-1-1.5-1.5 -1,.7 -6,.7 -7,0 -.4,.4 -1.5,.7 -1.5,1.5z" fill="#3A2030" />
      </g>
    </g>
  );
}

Object.assign(window, { OnbScene1, OnbScene2, OnbScene3 });
