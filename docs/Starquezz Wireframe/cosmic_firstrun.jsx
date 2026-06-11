// cosmic_firstrun.jsx — first-run + optional kid lock screens.
// Exports: Manifesto, Onboarding, SecretCode.

/* ---------------- parent manifesto ---------------- */
function Manifesto({ onProceed }) {
  const lines = [
    "Mornings are a scramble — brush, dress, eat, then go.",
    "And the bit we miss most? Just being together, slow.",
    "What if the morning could run itself?",
  ];
  const [step, setStep] = React.useState(0);
  const last = step >= lines.length;
  const advance = () => setStep((s) => s + 1);

  return (
    <div className="manifesto" onClick={!last ? advance : undefined}>
      {!last ? (
        <div key={step} className="mline reveal">{lines[step]}</div>
      ) : (
        <div className="mfinal-wrap">
          <Zee size={74} mood="cheer" />
          <div className="mfinal">Turn the daily scramble<br />into time together.</div>
          <div className="wordmark" style={{ fontSize: 26 }}>Starque<span className="zz">ZZ</span></div>
          <button className="btn" onClick={onProceed}>See how it works →</button>
        </div>
      )}
      {!last && <div className="mhint">tap to continue · {step + 1} / {lines.length}</div>}
    </div>
  );
}

/* ---------------- parent onboarding 1–3 ---------------- */
function Onboarding({ onDone }) {
  const slides = [
    { Art: OnbScene1, h: "First, the fun part.", p: "Tell us what your family loves — the park, the bookshop, slow-Sunday pancakes. Those become the rewards." },
    { Art: OnbScene2, h: "A few habits, their size.", p: "Not sure which ones matter? We’ll help you pick a small, doable handful that fits your kid — no giant chore chart." },
    { Art: OnbScene3, h: "They run the morning.", p: "Your kid taps their own board, collects stars, and trades them for adventure time — with you." },
  ];
  const [i, setI] = React.useState(0);
  const last = i === slides.length - 1;
  const Art = slides[i].Art;
  return (
    <div className="onb">
      <div className="onb-art" key={i}><Art /></div>
      <div className="onb-body">
        <h3>{slides[i].h}</h3>
        <p>{slides[i].p}</p>
      </div>
      <div className="onb-foot">
        <div className="onb-dots">
          {slides.map((_, k) => <i key={k} className={k === i ? "on" : ""} />)}
        </div>
        {last ? (
          <button className="btn" onClick={onDone}>Get started</button>
        ) : (
          <button className="btn ghost" onClick={() => setI(i + 1)}>Next</button>
        )}
      </div>
    </div>
  );
}

/* ---------------- optional kid secret code ---------------- */
function SecretCode({ name, onDone }) {
  const [code, setCode] = React.useState([]);
  React.useEffect(() => {
    if (code.length === 4) {
      const t = setTimeout(onDone, 380);
      return () => clearTimeout(t);
    }
  }, [code]);
  const press = (n) => setCode((prev) => (prev.length >= 4 ? prev : [...prev, n]));
  const back = () => setCode((prev) => prev.slice(0, -1));
  return (
    <div className="view full" style={{ gap: 18, justifyContent: "flex-start", paddingTop: 30 }}>
      <div className="col center gap10">
        <div className="ring" style={{ width: 92, height: 92, borderRadius: "50%", padding: 4, background: "linear-gradient(150deg,rgba(141,235,255,.6),rgba(255,135,196,.5))" }}>
          <KidAvatar size={84} bg="#7A3A6A" skin="#F0C49A" hair="#3A2030" />
        </div>
        <div className="disp" style={{ fontSize: 20, color: "#fff", whiteSpace: "nowrap" }}>{name}'s secret code</div>
      </div>
      <div className={"codedots"}>
        {[0, 1, 2, 3].map((k) => <i key={k} className={code.length > k ? "on" : ""} />)}
      </div>
      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} className="key" onClick={() => press(n)}>{n}</button>
        ))}
        <span></span>
        <button className="key" onClick={() => press(0)}>0</button>
        <button className="key ghostkey" onClick={back}>⌫</button>
      </div>
      <div className="muted" style={{ fontSize: 13 }}>tap your secret stars ✦</div>
    </div>
  );
}

Object.assign(window, { Manifesto, Onboarding, SecretCode });
