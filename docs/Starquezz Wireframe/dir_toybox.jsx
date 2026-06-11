// dir_toybox.jsx — Direction C: chunky Saturday-morning cartoon + tactile claymation softness. No mascot.
// Exports ToyboxBoard, ToyboxDream to window.

const TB_CONSTEL = { line: "#7C8AB8", filled: "#FFC23D", faint: "#8A93B8", glow: true };

function TbStatus() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="dots"><b></b></span>
    </div>
  );
}

function TbHabit({ icon, name, sub, state }) {
  return (
    <div className={"habit " + (state || "")}>
      {state === "locked" && <span className="lockpill"><SqzIcon name="lock" size={11} stroke={2.6} /> finish cores</span>}
      <span className="hicon"><SqzIcon name={icon} size={23} stroke={2.4} /></span>
      <div className="hbody">
        <div className="hname">{name}</div>
        <div className="hsub">{sub}</div>
      </div>
      <span className="hcheck">
        {state === "done" && <SqzIcon name="check" size={18} stroke={3.2} />}
      </span>
    </div>
  );
}

function ToyboxBoard() {
  return (
    <div className="scr dir-tb">
      <TbStatus />
      <div className="scr-body">
        <div className="topbar">
          <KidAvatar size={46} bg="#FFD86B" skin="#E6AE82" hair="#3A2A1A" />
          <div className="greet grow">
            <span className="hi">Good morning,</span>
            <span className="nm">Zen</span>
          </div>
          <span className="pill"><StarToken size={15} color="#FFB327" /> 23</span>
          <span className="pill flame"><SqzIcon name="flame" size={15} color="#FF6B5E" fill="#FF9A8F" /> 5</span>
        </div>

        <div className="blockbar">
          <span className="bname"><SqzIcon name="sun" size={20} color="#FFB327" stroke={2.4} /> Morning</span>
          <span className="nav"><span>‹</span><span>›</span></span>
        </div>

        <div className="habits">
          <TbHabit icon="tooth" name="Brush teeth" sub="+1 ✦ earned" state="done" />
          <TbHabit icon="shirt" name="Get dressed" sub="tap when you're done" state="now" />
          <TbHabit icon="bowl" name="Eat breakfast" sub="+1 ✦" state="" />
          <TbHabit icon="book" name="Read a story" sub="bonus · +2 ✦" state="locked" />
        </div>
      </div>
    </div>
  );
}

function ToyboxDream() {
  return (
    <div className="scr dir-tb">
      <TbStatus />
      <div className="scr-body">
        <div className="dreamhead">
          <div className="eyebrow">Big Dream</div>
          <div className="dname"><SqzIcon name="tent" size={24} color="#37A7F0" stroke={2.4} /> Garden camp-out</div>
        </div>

        <div className="constel-wrap">
          <Constellation palette={TB_CONSTEL} width={258} height={186} />
        </div>

        <div className="progress-line" style={{ marginBottom: 14 }}>
          <span className="disp" style={{ fontWeight: 700, color: "#26273E", fontSize: 16 }}>6</span>
          <div className="progress-track"><div className="progress-fill" style={{ width: "50%" }}></div></div>
          <span style={{ color: "#82839C", fontWeight: 700 }}>of 12 weeks</span>
        </div>

        <div className="pledge" style={{ marginBottom: 12 }}>
          <b style={{ color: "#26273E" }}>The pledge —</b> when every star is lit, we pitch the tent in the garden and camp out for real. <span style={{ color: "#37A7F0", fontWeight: 800 }}>Sat 12 Jul</span>
        </div>

        <div className="galaxy-foot" style={{ marginTop: "auto" }}>
          <span className="disp" style={{ fontWeight: 700 }}>Your galaxy</span>
          <span className="gdots" style={{ marginLeft: "auto" }}>
            <StarToken size={15} color="#FFC23D" />
            <StarToken size={15} color="#FF6B5E" />
            <StarToken size={13} color="#0A3A2A" />
          </span>
          <span>2 dreams done</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ToyboxBoard, ToyboxDream });
