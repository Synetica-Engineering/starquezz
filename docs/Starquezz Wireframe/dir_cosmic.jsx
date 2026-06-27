// dir_cosmic.jsx — Direction B: deep night sky, glowing constellations. WITH mascot "Zee".
// Zee = a little star sprite; the "zz" in Starquezz is his snooze. He wakes when you tap.
// Exports CosmicBoard, CosmicDream to window.

const CZ_CONSTEL = { line: "#7FA0FF", filled: "#FFD66B", faint: "#9FB0E8", glow: true };

function czStar(cx, cy, r) {
  const t = r * 0.42;
  return `M${cx},${cy - r} Q${cx + t * 0.5},${cy - t} ${cx + t},${cy - t} Q${cx + t},${cy - t * 0.5} ${cx + r},${cy} Q${cx + t},${cy + t * 0.5} ${cx + t},${cy + t} Q${cx + t * 0.5},${cy + t} ${cx},${cy + r} Q${cx - t * 0.5},${cy + t} ${cx - t},${cy + t} Q${cx - t},${cy + t * 0.5} ${cx - r},${cy} Q${cx - t},${cy - t * 0.5} ${cx - t},${cy - t} Q${cx - t * 0.5},${cy - t} ${cx},${cy - r} Z`;
}

function Zee({ size = 56, awake = true }) {
  return (
    <div className="zee" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: "visible" }}>
        <circle cx="32" cy="32" r="26" fill="#FFD66B" opacity="0.28" style={{ filter: "blur(6px)" }} />
        <path d={czStar(32, 32, 26)} fill="#FFE49C" stroke="#FFC94D" strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="38" cy="42" rx="5" ry="3.6" fill="#FF9ECb" opacity="0.5" />
        <ellipse cx="26" cy="42" rx="5" ry="3.6" fill="#FF9ECb" opacity="0.5" />
        {awake ? (
          <g>
            <circle cx="26" cy="33" r="2.6" fill="#3A2E5E" />
            <circle cx="38" cy="33" r="2.6" fill="#3A2E5E" />
            <circle cx="27" cy="32" r="0.9" fill="#fff" />
            <circle cx="39" cy="32" r="0.9" fill="#fff" />
            <path d="M27 40c2.4 2.4 7.6 2.4 10 0" stroke="#3A2E5E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <path d="M23 33c1.6 1.6 4.4 1.6 6 0" stroke="#3A2E5E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M35 33c1.6 1.6 4.4 1.6 6 0" stroke="#3A2E5E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M28 41c2 1.6 5 1.6 7 0" stroke="#3A2E5E" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}
      </svg>
      {!awake && <span className="zzz">z z</span>}
    </div>
  );
}

function CzStatus() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="dots"><b></b></span>
    </div>
  );
}

function CzHabit({ icon, name, sub, state }) {
  return (
    <div className={"habit " + (state || "")}>
      {state === "locked" && <span className="lockpill"><SqzIcon name="lock" size={11} stroke={2.4} /> finish first</span>}
      <span className="hicon"><SqzIcon name={icon} size={24} /></span>
      <div className="hbody">
        <div className="hname">{name}</div>
        <div className="hsub">{sub}</div>
      </div>
      <span className="hcheck">
        {state === "done" && <SqzIcon name="check" size={18} stroke={3} />}
      </span>
    </div>
  );
}

function CosmicBoard() {
  return (
    <div className="scr dir-cz">
      <CzStatus />
      <div className="scr-body">
        <div className="topbar">
          <KidAvatar size={46} bg="#3A4790" skin="#E6AE82" hair="#2A2240" />
          <div className="greet grow">
            <span className="hi">Good morning,</span>
            <span className="nm">Zen</span>
          </div>
          <span className="pill"><StarToken size={15} color="#FFD66B" glow /> 23</span>
          <span className="pill flame"><SqzIcon name="flame" size={15} color="#FFB27D" fill="#FF9A5A" /> 5</span>
        </div>

        <div className="row gap10" style={{
          background: "rgba(127,227,255,.08)", boxShadow: "inset 0 0 0 1px rgba(127,227,255,.25)",
          borderRadius: 16, padding: "8px 12px", marginBottom: 14
        }}>
          <Zee size={40} awake={true} />
          <span style={{ fontSize: 13.5, color: "#C7D2FF", lineHeight: 1.3 }}>
            <b className="disp" style={{ color: "#9FECFF" }}>Two stars so far!</b><br />Finish your morning to light another.
          </span>
        </div>

        <div className="blockbar">
          <span className="bname"><SqzIcon name="moon" size={18} color="#9FECFF" fill="#9FECFF" /> Morning</span>
          <span className="nav"><span>‹</span><span>›</span></span>
        </div>

        <div className="habits">
          <CzHabit icon="tooth" name="Brush teeth" sub="+1 ✦ earned" state="done" />
          <CzHabit icon="shirt" name="Get dressed" sub="tap when you're done" state="now" />
          <CzHabit icon="bowl" name="Eat breakfast" sub="+1 ✦" state="" />
          <CzHabit icon="book" name="Read a story" sub="bonus · +2 ✦" state="locked" />
        </div>
      </div>
    </div>
  );
}

function CosmicDream() {
  return (
    <div className="scr dir-cz">
      <CzStatus />
      <div className="scr-body">
        <div className="dreamhead">
          <div className="eyebrow">Big Dream</div>
          <div className="dname"><SqzIcon name="tent" size={24} color="#9FECFF" /> Garden camp-out</div>
        </div>

        <div className="constel-wrap">
          <Constellation palette={CZ_CONSTEL} width={258} height={186} />
          <div style={{ position: "absolute", right: -2, bottom: -4 }}><Zee size={48} awake={true} /></div>
        </div>

        <div className="progress-line" style={{ marginBottom: 14 }}>
          <span className="disp" style={{ fontWeight: 700, color: "#FFE49C" }}>6</span>
          <div className="progress-track"><div className="progress-fill" style={{ width: "50%" }}></div></div>
          <span style={{ color: "#97A2D4" }}>of 12 starry weeks</span>
        </div>

        <div className="pledge" style={{ marginBottom: 12 }}>
          <b style={{ color: "#EAF0FF" }}>The pledge —</b> when every star is lit, we pitch the tent and camp out under the real night sky. <span style={{ color: "#9FECFF", fontWeight: 700 }}>Sat 12 Jul</span>
        </div>

        <div className="galaxy-foot" style={{ marginTop: "auto" }}>
          <span className="disp" style={{ fontWeight: 700, color: "#9FECFF" }}>Your galaxy</span>
          <span className="gdots" style={{ marginLeft: "auto" }}>
            <StarToken size={15} color="#FFD66B" glow />
            <StarToken size={15} color="#FF7DBE" glow />
            <StarToken size={13} color="#7A86BC" />
          </span>
          <span>2 dreams come true</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CosmicBoard, CosmicDream, Zee });
