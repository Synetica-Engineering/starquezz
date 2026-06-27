// cosmic_ui.jsx — shared UI for the Starquezz Cosmic prototype.
// Reuses SqzIcon, StarToken, Constellation, KidAvatar, sparkPath from icons.jsx.
// Exports: Zee, TopBar, HabitCard, BottomNav, ZBubble, StarFx (window).

function czStarPath(cx, cy, r) {
  const t = r * 0.42;
  return `M${cx},${cy - r} Q${cx + t * 0.5},${cy - t} ${cx + t},${cy - t} Q${cx + t},${cy - t * 0.5} ${cx + r},${cy} Q${cx + t},${cy + t * 0.5} ${cx + t},${cy + t} Q${cx + t * 0.5},${cy + t} ${cx},${cy + r} Q${cx - t * 0.5},${cy + t} ${cx - t},${cy + t} Q${cx - t},${cy + t * 0.5} ${cx - r},${cy} Q${cx - t},${cy - t * 0.5} ${cx - t},${cy - t} Q${cx - t * 0.5},${cy - t} ${cx},${cy - r} Z`;
}

function Zee({ size = 56, mood = "awake", className = "" }) {
  const cls = "zee " + (mood === "cheer" ? "cheer " : "") + className;
  return (
    <div className={cls} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: "visible" }}>
        <circle cx="32" cy="32" r="27" fill="#FFD66B" opacity="0.3" style={{ filter: "blur(6px)" }} />
        <path d={czStarPath(32, 32, 26)} fill="#FFE49C" stroke="#FFC94D" strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="38" cy="42" rx="5" ry="3.6" fill="#FF9ECb" opacity="0.55" />
        <ellipse cx="26" cy="42" rx="5" ry="3.6" fill="#FF9ECb" opacity="0.55" />
        {mood === "idle" ? (
          <g>
            <path d="M23 33c1.6 1.6 4.4 1.6 6 0" stroke="#3A2E5E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M35 33c1.6 1.6 4.4 1.6 6 0" stroke="#3A2E5E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M28 41c2 1.6 5 1.6 7 0" stroke="#3A2E5E" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle cx="26" cy="33" r="2.7" fill="#3A2E5E" />
            <circle cx="38" cy="33" r="2.7" fill="#3A2E5E" />
            <circle cx="27" cy="31.8" r="0.9" fill="#fff" />
            <circle cx="39" cy="31.8" r="0.9" fill="#fff" />
            <path d={mood === "cheer" ? "M26 40c2.6 3.4 9.4 3.4 12 0" : "M27 40c2.4 2.4 7.6 2.4 10 0"}
              stroke="#3A2E5E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </g>
        )}
      </svg>
      {mood === "idle" && <span className="zzz">z z</span>}
    </div>
  );
}

function ZBubble({ children }) {
  return <div className="zbubble">{children}</div>;
}

function TopBar({ name, stars, streak, starRef, bump }) {
  return (
    <div className="topbar">
      <KidAvatar size={48} bg="#34428A" skin="#E6AE82" hair="#2A2240" />
      <div className="greet grow">
        <span className="hi">Good morning,</span>
        <span className="nm">{name}</span>
      </div>
      <span ref={starRef} className={"pill" + (bump ? " bump" : "")}>
        <StarToken size={16} color="#FFD66B" glow /> {stars}
      </span>
      <span className="pill flame">
        <SqzIcon name="flame" size={15} color="#FFC196" fill="#FF9A5A" /> {streak}
      </span>
    </div>
  );
}

function HabitCard({ habit, state, onCheck }) {
  const interactive = state === "now" || state === "";
  return (
    <div className={"habit " + state + (habit.unlockable ? " unlockable" : "")}>
      {state === "locked" && (
        <span className="lockpill"><SqzIcon name="lock" size={11} stroke={2.5} /> finish cores</span>
      )}
      <span className="hicon"><SqzIcon name={habit.icon} size={25} /></span>
      <div className="hbody">
        <div className="hname">{habit.name}</div>
        <div className="hsub">{habit.sub}</div>
      </div>
      <span className="hcheck"
        onClick={interactive ? (e) => onCheck(habit, e.currentTarget) : undefined}>
        {state === "done" && <SqzIcon name="check" size={19} stroke={3} />}
      </span>
    </div>
  );
}

function BottomNav({ screen, go }) {
  const items = [
    { id: "board", label: "Today", icon: <SqzIcon name="sun" size={22} /> },
    { id: "jar", label: "Stars", icon: <StarToken size={22} color="currentColor" /> },
    { id: "adventure", label: "Adventures", icon: <SqzIcon name="tent" size={22} /> },
  ];
  return (
    <div className="bottomnav">
      {items.map((it) => (
        <button key={it.id} className={"navitem" + (screen === it.id ? " active" : "")} onClick={() => go(it.id)}>
          <span className="ni">{it.icon}</span>
          {it.label}
        </button>
      ))}
    </div>
  );
}

// ---- imperative star-flight engine ----
const StarFx = {
  layer: null,
  setLayer(el) { this.layer = el; },
  fly(fromEl, toEl, onArrive) {
    if (!fromEl || !toEl || !this.layer) { if (onArrive) onArrive(); return; }
    const lr = this.layer.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const x0 = a.left - lr.left + a.width / 2, y0 = a.top - lr.top + a.height / 2;
    const x1 = b.left - lr.left + b.width / 2, y1 = b.top - lr.top + b.height / 2;
    const star = document.createElement("div");
    star.className = "fly-star";
    star.style.left = (x0 - 12) + "px";
    star.style.top = (y0 - 12) + "px";
    star.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" style="overflow:visible"><circle cx="12" cy="12" r="9" fill="#FFD66B" opacity="0.4" style="filter:blur(3px)"/><path d="${sparkPath(12, 12, 10)}" fill="#FFE49C"/></svg>`;
    this.layer.appendChild(star);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let done = false;
    const finish = () => { if (done) return; done = true; star.remove(); if (onArrive) onArrive(); };
    if (reduce) { finish(); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      star.style.transform = `translate(${x1 - x0}px, ${y1 - y0}px) scale(.45) rotate(220deg)`;
      star.style.opacity = "0.85";
    }));
    star.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, 950);
  },
};

Object.assign(window, { Zee, ZBubble, TopBar, HabitCard, BottomNav, StarFx, czStarPath });
