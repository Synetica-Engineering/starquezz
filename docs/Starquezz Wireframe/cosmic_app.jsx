// cosmic_app.jsx — Starquezz Cosmic prototype: state machine, nav, persistence, fx wiring.

const LS = "sqz_cosmic_v1";
function loadState() {
  try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; }
}

function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="sb-r"><b></b></span>
    </div>
  );
}

function ParentNav({ screen, go }) {
  const items = [
    { id: "scout", label: "Scout setup", icon: <Zee size={20} mood="awake" /> },
    { id: "digest", label: "Weekly digest", icon: <SqzIcon name="check" size={20} stroke={2.6} /> },
  ];
  return (
    <div className="bottomnav">
      {items.map((it) => (
        <button key={it.id} className={"navitem" + (screen === it.id ? " active" : "")} onClick={() => go(it.id)}>
          <span className="ni" style={{ height: 22, display: "flex", alignItems: "center" }}>{it.icon}</span>
          {it.label}
        </button>
      ))}
    </div>
  );
}

function App() {
  const saved = loadState();
  const [mode, setMode] = React.useState(saved.mode || "kid");
  const [kidScreen, setKidScreen] = React.useState(saved.kidScreen || "splash");
  const [parentScreen, setParentScreen] = React.useState(saved.parentScreen || "scout");
  const [name, setName] = React.useState(saved.name || "Zen");
  const [stars, setStars] = React.useState(saved.stars != null ? saved.stars : 21);
  const [checked, setChecked] = React.useState(new Set(saved.checked || []));
  const [litExtra, setLitExtra] = React.useState(saved.litExtra || 0);
  const [bump, setBump] = React.useState(0);
  const [zeeMood, setZeeMood] = React.useState("awake");
  const [ceremony, setCeremony] = React.useState(false);

  const streak = 5;
  const starRef = React.useRef(null);
  const fxRef = React.useRef(null);
  const stageRef = React.useRef(null);

  React.useEffect(() => { StarFx.setLayer(fxRef.current); });

  // persist
  React.useEffect(() => {
    localStorage.setItem(LS, JSON.stringify({
      mode, kidScreen, parentScreen, name, stars, checked: [...checked], litExtra,
    }));
  }, [mode, kidScreen, parentScreen, name, stars, checked, litExtra]);

  // responsive scale-to-fit
  React.useEffect(() => {
    const fit = () => {
      const el = stageRef.current; if (!el) return;
      const s = Math.min(1, (window.innerHeight - 40) / 880, (window.innerWidth - 24) / 380);
      el.style.transform = `scale(${s})`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const onCheck = (habit, el) => {
    if (checked.has(habit.id)) return;
    const ns = new Set(checked); ns.add(habit.id); setChecked(ns);
    setZeeMood("cheer"); setTimeout(() => setZeeMood("awake"), 850);
    StarFx.fly(el, starRef.current, () => {
      setStars((s) => s + habit.reward);
      setBump((b) => b + 1);
    });
  };

  const resetDemo = () => {
    setChecked(new Set()); setStars(21); setLitExtra(0);
    setMode("kid"); setKidScreen("splash"); setCeremony(false);
  };

  const isBoard = mode === "kid" && kidScreen === "board";
  const isKidHome = mode === "kid" && ["board", "jar", "adventure"].includes(kidScreen);

  let view = null;
  if (mode === "kid") {
    if (kidScreen === "splash") view = <Splash onDone={() => setKidScreen("login")} />;
    else if (kidScreen === "login") view = <Login onPick={(n) => { setName(n); setKidScreen(n === "Zia" ? "code" : "board"); }} />;
    else if (kidScreen === "code") view = <SecretCode name={name} onDone={() => setKidScreen("board")} />;
    else if (kidScreen === "board") view = <Board checked={checked} onCheck={onCheck} zeeMood={zeeMood} />;
    else if (kidScreen === "jar") view = <StarJar stars={stars} streak={streak} litExtra={litExtra} onCeremony={() => setCeremony(true)} />;
    else if (kidScreen === "adventure") view = <Adventure stars={stars} />;
  } else {
    if (parentScreen === "manifesto") view = <Manifesto onProceed={() => setParentScreen("onboarding")} />;
    else if (parentScreen === "onboarding") view = <Onboarding onDone={() => setParentScreen("scout")} />;
    else if (parentScreen === "scout") view = <ScoutSetup onHandoff={() => { setMode("kid"); setKidScreen("splash"); }} />;
    else view = <Digest />;
  }
  const showParentNav = mode === "parent" && ["scout", "digest"].includes(parentScreen);

  return (
    <div className="stage" ref={stageRef}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div className="phone">
          <div className={"screen" + (mode === "parent" ? " parent" : "")}>
            <StatusBar />
            {isBoard && (
              <div style={{ padding: "0 20px" }}>
                <TopBar name={name} stars={stars} streak={streak} starRef={starRef} bump={bump % 2 === 1} />
              </div>
            )}
            <div key={mode + kidScreen + parentScreen} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {view}
            </div>
            {isKidHome && <BottomNav screen={kidScreen} go={setKidScreen} />}
            {showParentNav && <ParentNav screen={parentScreen} go={setParentScreen} />}
            <div className="fxlayer" ref={fxRef}></div>
            {ceremony && (
              <Ceremony
                onChoose={() => {}}
                onClose={() => { setCeremony(false); setLitExtra(1); }}
              />
            )}
          </div>
        </div>

        {/* demo controls (outside the device) */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 999, background: "rgba(255,255,255,.06)", boxShadow: "inset 0 0 0 1px rgba(180,196,255,.2)" }}>
            <button onClick={() => setMode("kid")} style={ctrlBtn(mode === "kid")}>Kid</button>
            <button onClick={() => setMode("parent")} style={ctrlBtn(mode === "parent")}>Parent</button>
          </div>
          <button onClick={() => { setMode("parent"); setParentScreen("manifesto"); }}
            style={{ border: "none", cursor: "pointer", background: "rgba(255,255,255,.06)", color: "#AEBCE6", fontFamily: "var(--disp)", fontWeight: 600, fontSize: 13, padding: "9px 14px", borderRadius: 999, boxShadow: "inset 0 0 0 1px rgba(180,196,255,.2)" }}>▸ Intro</button>
          <button onClick={resetDemo} title="Restart demo"
            style={{ border: "none", cursor: "pointer", background: "rgba(255,255,255,.06)", color: "#AEBCE6", fontFamily: "var(--disp)", fontWeight: 600, fontSize: 13, padding: "9px 14px", borderRadius: 999, boxShadow: "inset 0 0 0 1px rgba(180,196,255,.2)" }}>↺ Restart</button>
        </div>
      </div>
    </div>
  );
}

function ctrlBtn(on) {
  return {
    border: "none", cursor: "pointer", fontFamily: "var(--disp)", fontWeight: 600, fontSize: 13,
    padding: "8px 18px", borderRadius: 999,
    background: on ? "#FFD66B" : "transparent", color: on ? "#0b1030" : "#AEBCE6",
  };
}

ReactDOM.createRoot(document.getElementById("app-root")).render(<App />);
