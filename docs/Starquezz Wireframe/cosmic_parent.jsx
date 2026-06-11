// cosmic_parent.jsx — parent-facing screens. Exports ScoutSetup, Digest.

function ScoutSetup({ onHandoff }) {
  const [accepted, setAccepted] = React.useState({});
  const drafts = [
    { id: "teeth", icon: "tooth", name: "Brush teeth" },
    { id: "dress", icon: "shirt", name: "Get dressed" },
    { id: "breakfast", icon: "bowl", name: "Eat breakfast" },
  ];
  const allDone = drafts.every((d) => accepted[d.id]);
  return (
    <div className="view" style={{ overflowY: "auto" }}>
      <div className="parent-head">
        <Zee size={38} mood="awake" />
        <span className="pt grow">Scout</span>
        <span className="muted" style={{ fontSize: 13 }}>skip — I'll do it</span>
      </div>

      <div className="chat" style={{ marginBottom: 14 }}>
        <div className="bubble bot">Hi! Let's build Zen's morning. What does it usually look like?</div>
        <div className="bubble me">Teeth, get dressed, breakfast, then packs his bag.</div>
        <div className="bubble bot">Great — here are three to start. Accept, edit, or skip each.</div>
      </div>

      <div className="col gap10">
        {drafts.map((d, i) => (
          <div className="draftcard" key={d.id} style={{ animationDelay: (i * 0.09) + "s" }}>
            <div className="dc-top">
              <span className="dc-ic"><SqzIcon name={d.icon} size={20} /></span>
              <span className="dc-name grow">{d.name}</span>
              <span className="muted" style={{ fontSize: 13 }}>+1 ✦</span>
            </div>
            <div className="draftacts">
              <button className={"chip " + (accepted[d.id] ? "accepted" : "accept")}
                onClick={() => setAccepted((a) => ({ ...a, [d.id]: !a[d.id] }))}>
                {accepted[d.id] ? "✓ added" : "accept"}
              </button>
              <button className="chip edit">edit</button>
              <button className="chip skip">skip</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 18 }}>
        <button className={"btn full" + (allDone ? "" : " ghost")} disabled={!allDone} onClick={onHandoff}>
          {allDone ? "Board's ready — hand it over →" : "Accept the habits to continue"}
        </button>
        {allDone && <div className="muted tac" style={{ fontSize: 12.5, marginTop: 10 }}>Now give the device to Zen ✦</div>}
      </div>
    </div>
  );
}

function Digest() {
  const [advDone, setAdvDone] = React.useState(false);
  const kids = [
    { name: "Zen", stars: 23, streak: 5, week: [1, 1, 1, 1, 1, 0, 0] },
    { name: "Zia", stars: 11, streak: 2, week: [1, 0, 1, 1, 0, 0, 0] },
  ];
  return (
    <div className="view" style={{ overflowY: "auto" }}>
      <div className="parent-head">
        <span className="pt grow">This week</span>
        <span className="muted" style={{ fontSize: 13 }}>PIN ••••</span>
      </div>

      <div className="col gap12">
        {kids.map((k) => (
          <div className="dchild" key={k.name}>
            <div className="dc-h">
              <span className="dname2">{k.name}</span>
              <span className="dstat">
                <StarToken size={14} color="#FFD66B" /> {k.stars}
                <SqzIcon name="flame" size={14} color="#FFC196" fill="#FF9A5A" /> {k.streak}
              </span>
            </div>
            <div className="dgrid">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div className="d" key={i}>
                  <div className={"cell" + (k.week[i] ? " on" : "")}></div>
                  <div className="dl">{d}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="advstatus">
          <div className="col">
            <span className="muted" style={{ fontSize: 12 }}>Planned adventure</span>
            <span className="dname2" style={{ fontSize: 16 }}>Playground · Sat</span>
          </div>
          <button className={"done" + (advDone ? " is-done" : "")} onClick={() => setAdvDone((v) => !v)}>
            {advDone ? "done ✓" : "mark done"}
          </button>
        </div>

        <div className="row gap8">
          {["Habits", "Adventures", "Scout"].map((t) => (
            <div key={t} className="grow tac" style={{ padding: "12px 0", borderRadius: 14, background: "#142146", boxShadow: "inset 0 0 0 1.5px var(--line)", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>{t}</div>
          ))}
        </div>
      </div>

      <div className="muted tac" style={{ fontSize: 12.5, marginTop: 16 }}>The whole week in one glance — in and out in two minutes.</div>
    </div>
  );
}

Object.assign(window, { ScoutSetup, Digest });
