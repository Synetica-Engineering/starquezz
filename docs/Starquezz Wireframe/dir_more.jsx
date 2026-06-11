// dir_more.jsx — generic Board + Dream factory for directions D/E/F.
// Colors are driven by CSS custom properties (var(--starc), var(--accent)) per scope,
// so one component renders all three. Constellation palettes passed explicitly (SVG fills).
// Exports: PapercraftBoard/Dream, SketchbookBoard/Dream, AuroraBoard/Dream.

const MORE_DIRS = {
  pc: {
    block: "sun", blockFill: false,
    avatar: { bg: "#F2A93B", skin: "#E6AE82", hair: "#3A2A1A" },
    constel: { line: "#C9BFAD", filled: "#E5533B", faint: "#C9BFAD", glow: false },
    galaxy: ["#E5533B", "#2E9B8F", "#C9BFAD"],
    iconStroke: 2.3,
  },
  sk: {
    block: "sun", blockFill: false,
    avatar: { bg: "#E8B53A", skin: "#E6AE82", hair: "#3A2A1A" },
    constel: { line: "#BDB4A6", filled: "#E8B53A", faint: "#BDB4A6", glow: false },
    galaxy: ["#D6493B", "#3F6FB5", "#BDB4A6"],
    iconStroke: 2.1,
  },
  au: {
    block: "moon", blockFill: true,
    avatar: { bg: "#1C4763", skin: "#E6AE82", hair: "#22384A" },
    constel: { line: "#5B8FB0", filled: "#FFD66B", faint: "#7FA8C8", glow: true },
    galaxy: ["#FFD66B", "#5BE5B0", "#7FA8C8"],
    iconStroke: 2.1,
  },
};

function MoreStatus() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="dots"><b></b></span>
    </div>
  );
}

function MoreHabit({ icon, name, sub, state, stroke }) {
  return (
    <div className={"habit " + (state || "")}>
      {state === "locked" && <span className="lockpill"><SqzIcon name="lock" size={11} stroke={2.5} /> finish cores</span>}
      <span className="hicon"><SqzIcon name={icon} size={23} stroke={stroke} /></span>
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

function makeBoard(key) {
  const d = MORE_DIRS[key];
  return function Board() {
    return (
      <div className={"scr dir-" + key}>
        <MoreStatus />
        <div className="scr-body">
          <div className="topbar">
            <KidAvatar size={46} bg={d.avatar.bg} skin={d.avatar.skin} hair={d.avatar.hair} />
            <div className="greet grow">
              <span className="hi">Good morning,</span>
              <span className="nm">Zen</span>
            </div>
            <span className="pill"><StarToken size={15} color="var(--starc)" glow={key === "au"} /> 23</span>
            <span className="pill flame"><SqzIcon name="flame" size={15} color="currentColor" fill="currentColor" /> 5</span>
          </div>

          <div className="blockbar">
            <span className="bname">
              <SqzIcon name={d.block} size={19} color="var(--accent)" fill={d.blockFill ? "var(--accent)" : "none"} stroke={d.iconStroke} /> Morning
            </span>
            <span className="nav"><span>‹</span><span>›</span></span>
          </div>

          <div className="habits">
            <MoreHabit icon="tooth" name="Brush teeth" sub="+1 ✦ earned" state="done" stroke={d.iconStroke} />
            <MoreHabit icon="shirt" name="Get dressed" sub="tap when you're done" state="now" stroke={d.iconStroke} />
            <MoreHabit icon="bowl" name="Eat breakfast" sub="+1 ✦" state="" stroke={d.iconStroke} />
            <MoreHabit icon="book" name="Read a story" sub="bonus · +2 ✦" state="locked" stroke={d.iconStroke} />
          </div>
        </div>
      </div>
    );
  };
}

function makeDream(key) {
  const d = MORE_DIRS[key];
  return function Dream() {
    return (
      <div className={"scr dir-" + key}>
        <MoreStatus />
        <div className="scr-body">
          <div className="dreamhead">
            <div className="eyebrow">Big Dream</div>
            <div className="dname"><SqzIcon name="tent" size={24} color="var(--accent)" stroke={d.iconStroke} /> Garden camp-out</div>
          </div>

          <div className="constel-wrap">
            <Constellation palette={d.constel} width={258} height={186} />
          </div>

          <div className="progress-line" style={{ marginBottom: 14 }}>
            <span className="num">6</span>
            <div className="progress-track"><div className="progress-fill" style={{ width: "50%" }}></div></div>
            <span className="of">of 12 starry weeks</span>
          </div>

          <div className="pledge" style={{ marginBottom: 12 }}>
            <b>The pledge —</b> when every star is lit, we pitch the tent in the garden and camp out under the real night sky. <span className="date">Sat 12 Jul</span>
          </div>

          <div className="galaxy-foot" style={{ marginTop: "auto" }}>
            <span className="glabel">Your galaxy</span>
            <span className="gdots" style={{ marginLeft: "auto" }}>
              <StarToken size={15} color={d.galaxy[0]} glow={key === "au"} />
              <StarToken size={15} color={d.galaxy[1]} glow={key === "au"} />
              <StarToken size={13} color={d.galaxy[2]} />
            </span>
            <span>2 dreams come true</span>
          </div>
        </div>
      </div>
    );
  };
}

const PapercraftBoard = makeBoard("pc"), PapercraftDream = makeDream("pc");
const SketchbookBoard = makeBoard("sk"), SketchbookDream = makeDream("sk");
const AuroraBoard = makeBoard("au"), AuroraDream = makeDream("au");

Object.assign(window, {
  PapercraftBoard, PapercraftDream,
  SketchbookBoard, SketchbookDream,
  AuroraBoard, AuroraDream,
});
