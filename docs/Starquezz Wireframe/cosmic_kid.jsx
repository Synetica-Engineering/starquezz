// cosmic_kid.jsx — kid-facing screens for the Starquezz Cosmic prototype.
// Exports: HABITS, CONSTEL, Splash, Login, Board, StarJar, Adventure, Ceremony.

const CONSTEL = { line: "#7FA0FF", filled: "#FFD66B", faint: "#9FB0E8", glow: true };

const HABITS = [
  { id: "teeth", icon: "tooth", name: "Brush teeth", sub: "+1 ✦", reward: 1, core: true },
  { id: "dress", icon: "shirt", name: "Get dressed", sub: "+1 ✦", reward: 1, core: true },
  { id: "breakfast", icon: "bowl", name: "Eat breakfast", sub: "+1 ✦", reward: 1, core: true },
  { id: "book", icon: "book", name: "Read a story", sub: "bonus · +2 ✦", reward: 2, core: false },
];

function habitStates(checked) {
  const cores = HABITS.filter((h) => h.core);
  const coresDone = cores.every((h) => checked.has(h.id));
  let nowAssigned = false;
  return HABITS.map((h) => {
    if (checked.has(h.id)) return { ...h, state: "done" };
    if (!h.core && !coresDone) return { ...h, state: "locked" };
    if (!nowAssigned) { nowAssigned = true; return { ...h, state: "now", unlockable: !h.core }; }
    return { ...h, state: "", unlockable: !h.core };
  });
}

/* ---------------- splash ---------------- */
function Splash({ onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="view full" onClick={onDone} style={{ cursor: "pointer" }}>
      <div className="splash-mark">
        <Zee size={86} mood="awake" />
        <div className="wordmark">Starque<span className="zz">zz</span></div>
        <div className="muted" style={{ fontSize: 15 }}>a playful morning, together</div>
      </div>
    </div>
  );
}

/* ---------------- login ---------------- */
function Login({ onPick }) {
  return (
    <div className="view full" style={{ gap: 26 }}>
      <div className="disp" style={{ fontSize: 24, color: "#fff" }}>Who's playing?</div>
      <div className="login-faces">
        <div className="face-pick" onClick={() => onPick("Zen")}>
          <div className="ring"><KidAvatar size={108} bg="#34428A" skin="#E6AE82" hair="#2A2240" /></div>
          <div className="pn">Zen</div>
        </div>
        <div className="face-pick" onClick={() => onPick("Zia")}>
          <div className="ring"><KidAvatar size={108} bg="#7A3A6A" skin="#F0C49A" hair="#3A2030" /></div>
          <div className="pn">Zia</div>
        </div>
      </div>
      <div className="muted" style={{ fontSize: 15 }}>tap your face to start ✦</div>
    </div>
  );
}

/* ---------------- routine board ---------------- */
function Board({ checked, onCheck, zeeMood }) {
  const states = habitStates(checked);
  const cores = HABITS.filter((h) => h.core);
  const coresDone = cores.every((h) => checked.has(h.id));
  const checkedCount = HABITS.filter((h) => checked.has(h.id)).length;
  const allDone = HABITS.every((h) => checked.has(h.id));

  let msg;
  if (allDone) msg = <span><b>Whole morning done!</b> You're a star. ⭐</span>;
  else if (coresDone) msg = <span><b>Cores done!</b> Your bonus star is unlocked.</span>;
  else msg = <span><b>{checkedCount} star{checkedCount === 1 ? "" : "s"} so far!</b> Tap the ring when you finish a job.</span>;

  return (
    <div className="view">
      <div className="blockbar">
        <span className="bname"><SqzIcon name="moon" size={19} color="#9FECFF" fill="#9FECFF" /> Morning</span>
        <span className="nav"><span>‹</span><span>›</span></span>
      </div>

      <div className="row gap10" style={{ marginBottom: 14 }}>
        <Zee size={42} mood={zeeMood} />
        <div className="zbubble grow">{msg}</div>
      </div>

      <div className="habits">
        {states.map((h) => (
          <HabitCard key={h.id} habit={h} state={h.state} onCheck={onCheck} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- star jar ---------------- */
function StarJar({ stars, streak, onCeremony, litExtra }) {
  const week = [true, true, true, true, true, false, false];
  const jarStars = Math.min(stars, 30);
  return (
    <div className="view" style={{ overflowY: "auto" }}>
      <div className="tac" style={{ padding: "2px 0 4px" }}>
        <div className="eyebrow">Your stars</div>
      </div>
      <div className="jar">
        <div className="lid"></div>
        <div className="glass"></div>
        <div className="stars">
          {Array.from({ length: jarStars }).map((_, i) => (
            <StarToken key={i} size={16} color="#FFD66B" glow={i % 4 === 0} />
          ))}
        </div>
      </div>
      <div className="jar-count">{stars} <span style={{ fontSize: 16, color: "var(--muted)" }}>stars</span></div>

      <div className="weekstrip" style={{ marginTop: 10 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div className="d" key={i}>
            <div className={"cell" + (week[i] ? " on" : "")}></div>
            <div className="dl">{d}</div>
          </div>
        ))}
      </div>
      <div className="row center gap8" style={{ margin: "10px 0 14px", color: "var(--muted)", fontSize: 13.5 }}>
        <SqzIcon name="flame" size={16} color="#FFC196" fill="#FF9A5A" />
        <span><b style={{ color: "#FFE49C" }}>{streak}-day streak</b> — best yet!</span>
      </div>

      <div className="eyebrow" style={{ marginBottom: 6 }}>Big Dream</div>
      <div className="constel-wrap"><Constellation palette={CONSTEL} width={250} height={172} extraLit={litExtra || 0} /></div>
      <div className="progress-line" style={{ marginBottom: 14 }}>
        <span className="num">{6 + (litExtra || 0)}</span>
        <div className="progress-track"><div className="progress-fill" style={{ width: ((6 + (litExtra || 0)) / 12 * 100) + "%" }}></div></div>
        <span className="of">of 12 weeks → camp-out</span>
      </div>

      <button className="btn full aqua" onClick={onCeremony}>It's Sunday — start the ceremony ✦</button>
    </div>
  );
}

/* ---------------- adventure menu ---------------- */
function Adventure({ stars }) {
  const advs = [
    { name: "Bookshop trip", price: 20, art: "illustration — bookshop" },
    { name: "Treasure hunt", price: 30, art: "illustration — treasure hunt" },
    { name: "Pancake morning", price: 0, art: "illustration — pancakes", fallback: true },
  ];
  return (
    <div className="view" style={{ overflowY: "auto" }}>
      <div className="row between" style={{ padding: "2px 0 12px" }}>
        <span className="dname" style={{ fontSize: 21 }}>Adventures</span>
        <span className="pill"><StarToken size={15} color="#FFD66B" glow /> {stars}</span>
      </div>
      <div className="col gap12">
        {advs.map((a) => {
          const unlocked = stars >= a.price;
          const cls = "adv " + (a.fallback ? "fallback" : unlocked ? "unlocked" : "locked");
          return (
            <div className={cls} key={a.name}>
              <div className="art">{a.art}</div>
              <div className="meta">
                <div className="col">
                  <div className="an">{a.name}</div>
                  <div className="as">
                    {a.fallback ? "0 ✦ · any week, together"
                      : unlocked ? "unlocked ✓"
                        : <span style={{ color: "#FF9CC6" }}>{a.price - stars} more ✦ to unlock</span>}
                  </div>
                </div>
                <span className="ap">{a.fallback ? "★ free" : <span><StarToken size={13} color="#FFD66B" /> {a.price}</span>}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

/* ---------------- Sunday ceremony ---------------- */
function Ceremony({ onClose, onChoose }) {
  const [step, setStep] = React.useState(0);
  const [pick, setPick] = React.useState(null);
  const next = () => setStep((s) => s + 1);

  const Dots = () => (
    <div className="dots">{[0, 1, 2, 3].map((i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
  );

  return (
    <div className="cer">
      {step === 0 && (
        <React.Fragment>
          <div className="kicker">Sunday ceremony</div>
          <h2>Let's look at your week</h2>
          <div className="weekstrip" style={{ gap: 10, width: 250 }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div className="d" key={i}>
                <div className={"cell" + (i < 5 ? " on" : "")}></div>
                <div className="dl">{d}</div>
              </div>
            ))}
          </div>
          <p>You lit <b style={{ color: "#FFE49C" }}>5 star-days</b> this week — that's a perfect week!</p>
          <button className="btn" onClick={next}>Count my stars ✦</button>
          <Dots />
        </React.Fragment>
      )}

      {step === 1 && (
        <React.Fragment>
          <div className="kicker">Perfect week</div>
          <Zee size={78} mood="cheer" />
          <h2>A new star joins<br />your sky ✦</h2>
          <div className="constel-wrap" style={{ width: 250 }}>
            <Constellation palette={CONSTEL} width={236} height={166} extraLit={1} flashNew={true} />
          </div>
          <p>Seven of twelve. The tent is almost full of light.</p>
          <button className="btn" onClick={next}>Pick this week's adventure →</button>
          <Dots />
        </React.Fragment>
      )}

      {step === 2 && (
        <React.Fragment>
          <div className="kicker">Your reward</div>
          <h2>Where to next?</h2>
          <div className="col gap10" style={{ width: 250 }}>
            {["Bookshop trip", "Playground picnic", "Treasure hunt"].map((a) => (
              <button key={a} className={"adv " + (pick === a ? "unlocked" : "")}
                style={{ border: "none", cursor: "pointer", textAlign: "left", padding: 0, background: "#152150", width: "100%" }}
                onClick={() => setPick(a)}>
                <div className="meta" style={{ padding: "15px 16px" }}>
                  <span className="an">{a}</span>
                  {pick === a && <SqzIcon name="check" size={20} color="#86F2C8" stroke={3} />}
                </div>
              </button>
            ))}
          </div>
          <button className="btn" disabled={!pick} style={{ opacity: pick ? 1 : .5 }}
            onClick={() => { onChoose && onChoose(pick); next(); }}>Seal it ✦</button>
          <Dots />
        </React.Fragment>
      )}

      {step === 3 && (
        <React.Fragment>
          <div className="kicker">Sealed!</div>
          <div className="ticket">
            <div className="tart">{pick || "Adventure"}</div>
            <div className="tbody">
              <div className="ttitle">{pick || "Adventure"}</div>
              <div className="tmeta">Sat 14 June · with Dad</div>
            </div>
            <div className="tstub"><SqzIcon name="tent" size={15} color="#8a93b0" /> TICKET — keep me!</div>
          </div>
          <p>Look forward to it all week — it'll wait on your board.</p>
          <button className="btn" onClick={onClose}>Back to my stars</button>
          <Dots />
        </React.Fragment>
      )}
    </div>
  );
}

Object.assign(window, { HABITS, CONSTEL, habitStates, Splash, Login, Board, StarJar, Adventure, Ceremony });
