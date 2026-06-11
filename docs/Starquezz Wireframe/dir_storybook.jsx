// dir_storybook.jsx — Direction A: hand-painted storybook warmth. No mascot.
// Exports StorybookBoard, StorybookDream to window.

const SB_CONSTEL = { line: "#C9A86A", filled: "#E29B33", faint: "#C9A86A", glow: false };

function SbStatus() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="dots"><span>✦ StarqueZZ</span></span>
      <span className="dots"><b></b></span>
    </div>
  );
}

function SbHabit({ icon, name, sub, state }) {
  return (
    <div className={"habit " + (state || "")}>
      {state === "locked" && <span className="lockpill"><SqzIcon name="lock" size={11} stroke={2.4} /> finish cores</span>}
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

function StorybookBoard() {
  return (
    <div className="scr dir-sb">
      <SbStatus />
      <div className="scr-body">
        <div className="topbar">
          <KidAvatar size={46} bg="#EBC88B" skin="#E6AE82" hair="#6B4326" />
          <div className="greet grow">
            <span className="hi">Good morning,</span>
            <span className="nm">Zen</span>
          </div>
          <span className="pill"><StarToken size={15} color="#E29B33" /> 23</span>
          <span className="pill flame"><SqzIcon name="flame" size={15} color="#C56038" fill="#F2C078" /> 5</span>
        </div>

        <div className="blockbar">
          <span className="bname"><SqzIcon name="sun" size={19} color="#E29B33" /> Morning</span>
          <span className="nav"><span>‹</span><span>›</span></span>
        </div>

        <div className="habits">
          <SbHabit icon="tooth" name="Brush teeth" sub="+1 ✦ earned" state="done" />
          <SbHabit icon="shirt" name="Get dressed" sub="tap when you're done" state="now" />
          <SbHabit icon="bowl" name="Eat breakfast" sub="+1 ✦" state="" />
          <SbHabit icon="book" name="Read a story" sub="bonus · +2 ✦" state="locked" />
        </div>
      </div>
    </div>
  );
}

function StorybookDream() {
  return (
    <div className="scr dir-sb">
      <SbStatus />
      <div className="scr-body">
        <div className="dreamhead">
          <div className="eyebrow">Big Dream</div>
          <div className="dname"><SqzIcon name="tent" size={24} color="#C56038" /> Garden camp-out</div>
        </div>

        <div className="constel-wrap">
          <Constellation palette={SB_CONSTEL} width={258} height={186} />
        </div>

        <div className="progress-line" style={{ marginBottom: 14 }}>
          <span className="disp" style={{ fontWeight: 700, color: "#3C2F22" }}>6</span>
          <div className="progress-track"><div className="progress-fill" style={{ width: "50%" }}></div></div>
          <span style={{ color: "#8C7355" }}>of 12 starry weeks</span>
        </div>

        <div className="pledge" style={{ marginBottom: 12 }}>
          <b style={{ color: "#46382A" }}>The pledge —</b> when every star is lit, we pitch the tent in the garden and camp out under the real sky. <span style={{ color: "#B27636", fontWeight: 700 }}>Sat 12 Jul</span>
        </div>

        <div className="galaxy-foot" style={{ marginTop: "auto" }}>
          <span className="disp" style={{ fontWeight: 700, color: "#B27636" }}>Your galaxy</span>
          <span className="gdots" style={{ marginLeft: "auto" }}>
            <StarToken size={15} color="#E29B33" />
            <StarToken size={15} color="#E29B33" />
            <StarToken size={13} color="#D9C49A" />
          </span>
          <span>2 dreams come true</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StorybookBoard, StorybookDream });
