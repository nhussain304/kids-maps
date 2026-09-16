import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Map,
  Compass,
  Flag,
  Award,
  Gamepad2,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Star,
  Check,
  X,
  Clock,
  ShieldCheck,
  Cloud,
  LogOut,
  Heart,
  BookOpen,
  ChevronRight,
  Globe,
  Home,
  RotateCcw,
} from "lucide-react";
import AdventureMap, { WorldMap, icons } from "./AdventureMap";
import {
  missions,
  questions,
  validProgress,
  mergeProgress,
  pointsFor,
} from "./data";
import { supabase } from "./supabaseClient";

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function Modal({ children, close, label }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-label={label}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button className="close" onClick={close} aria-label="Close / بند کریں">
        <X size={20} />
      </button>
      {children}
    </dialog>
  );
}
export default function App() {
  const [lang, setLang] = useState(() => read("kids-map-lang", "ur"));
  const t = useCallback((v) => v[lang === "ur" ? 1 : 0], [lang]);
  const [page, setPage] = useState("explore"),
    [mapMode, setMapMode] = useState("adventure");
  const [done, setDone] = useState(() =>
    validProgress(read("kids-map-progress", [])),
  );
  const [mission, setMission] = useState(null),
    [steps, setSteps] = useState([]),
    [modal, setModal] = useState(null),
    [celebrate, setCelebrate] = useState(null);
  const [session, setSession] = useState(null),
    [sync, setSync] = useState("local"),
    [email, setEmail] = useState(""),
    [authMessage, setAuthMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [consent, setConsent] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0),
    [answer, setAnswer] = useState(null),
    [quizFinished, setQuizFinished] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const doneRef = useRef(done);
  doneRef.current = done;
  const completed = missions.filter((m) => done.includes(m.id)).length;
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    try {
      localStorage.setItem("kids-map-lang", JSON.stringify(lang));
    } catch {}
  }, [lang]);
  useEffect(() => {
    try {
      localStorage.setItem("kids-map-progress", JSON.stringify(done));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [done]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error) setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  const syncProgress = useCallback(async (current, user) => {
    if (!supabase || !user) return;
    setSync("saving");
    try {
      const { data, error } = await supabase.rpc("sync_kids_map_progress", {
        p_completed: validProgress(current),
      });
      if (error) throw error;
      setDone((d) => mergeProgress(d, data));
      setSync("saved");
    } catch {
      setSync("error");
    }
  }, []);
  useEffect(() => {
    if (session?.user) syncProgress(doneRef.current, session.user);
    else setSync("local");
  }, [session?.user?.id, syncProgress]);
  function complete(id) {
    const next = mergeProgress(done, [id]);
    setDone(next);
    if (session?.user) syncProgress(next, session.user);
    setCelebrate(id);
    setMission(null);
    setModal(null);
  }
  const pick = useCallback((m) => {
    setSteps([]);
    setMission(m);
  }, []);
  const go = (p) => {
    setPage(p);
    setQuizFinished(false);
    setQuizIndex(0);
    setAnswer(null);
  };
  async function login(e) {
    e.preventDefault();
    if (!supabase) {
      setAuthMessage(
        t([
          "Cloud connection is not configured yet. Your progress stays on this device.",
          "کلاؤڈ رابطہ ابھی ترتیب نہیں دیا گیا۔ پیش رفت اسی آلے پر رہے گی۔",
        ]),
      );
      return;
    }
    setBusy(true);
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      setAuthMessage(
        error
          ? t([
              "Could not send the sign-in link. Please check the email and try again later.",
              "لاگ اِن لنک نہیں بھیج سکے۔ ای میل چیک کریں اور کچھ دیر بعد کوشش کریں۔",
            ])
          : t([
              "Check your email for the sign-in link. Open it on this device to save your progress.",
              "اپنی ای میل میں لاگ اِن لنک دیکھیں۔ پیش رفت محفوظ کرنے کے لیے اسے اسی آلے پر کھولیں۔",
            ]),
      );
    } catch {
      setAuthMessage(
        t([
          "Connection failed. Please try again.",
          "رابطہ نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
        ]),
      );
    } finally {
      setBusy(false);
    }
  }
  const nav = [
    ["explore", Compass, ["Explore map", "نقشہ دیکھیں"]],
    ["missions", Flag, ["My missions", "میرے مشنز"]],
    ["badges", Award, ["My badges", "میرے بیجز"]],
    ["games", Gamepad2, ["Play & learn", "کھیلیں اور سیکھیں"]],
  ];
  const Next = lang === "ur" ? ArrowLeft : ArrowRight;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            go("explore");
          }}
        >
          <span className="brand-icon">
            <Map size={26} />
          </span>
          <span dir="ltr">
            kids<span className="brand-light">map</span>
            <small>LITTLE EXPLORERS. FUTURE LEADERS.</small>
          </span>
        </a>
        <div className="side-caption">{t(["YOUR ADVENTURE", "آپ کا سفر"])}</div>
        <nav aria-label={t(["Main navigation", "مرکزی مینو"])}>
          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => go(id)}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={20} />
              <span>{t(label)}</span>
              {id === "missions" && <small>{5 - completed}</small>}
            </button>
          ))}
        </nav>
        <div className="side-invite">
          <div className="seed-icon">✦</div>
          <strong>
            {t(["A little good goes a long way.", "چھوٹی نیکی، بڑا اثر۔"])}
          </strong>
          <p>
            {t([
              "Your next adventure could make someone smile.",
              "آپ کا اگلا مشن کسی کے چہرے پر مسکراہٹ لا سکتا ہے۔",
            ])}
          </p>
          <button
            onClick={() =>
              pick(missions.find((m) => !done.includes(m.id)) || missions[0])
            }
          >
            {t(["Find a mission", "ایک مشن چنیں"])}
            <Next size={15} />
          </button>
        </div>
        <button className="grownup-link" onClick={() => setModal("parent")}>
          <ShieldCheck size={19} />
          {t(["Grown-up corner", "والدین کے لیے"])}
          <ChevronRight size={14} />
        </button>
        <div className="sidebar-foot">
          {t(["Made for curious minds", "جستجو کرنے والے بچوں کے لیے"])}
          <span>✳</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="breadcrumb">
            {t(["My adventure", "میرا سفر"])}
            <span>/</span>
            <b>{t(nav.find((n) => n[0] === page)[2])}</b>
          </span>
          <div className="top-actions">
            <button
              className="language"
              onClick={() => setLang(lang === "ur" ? "en" : "ur")}
            >
              <Globe size={15} />
              {lang === "ur" ? "English" : "اردو"}
            </button>
            <span className="top-points">
              <Star size={16} fill="currentColor" />
              {pointsFor(done)} XP
            </span>
            <button
              className="avatar"
              onClick={() => setModal("parent")}
              aria-label={t(["Your explorer profile", "آپ کا پروفائل"])}
            >
              ✿
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span />
                {t([
                  "A NEW DAY TO MAKE A DIFFERENCE",
                  "آج کچھ اچھا کرنے کا دن ہے",
                ])}
              </div>
              <h1>
                {t([
                  "Big adventures start with you.",
                  "بڑے سفر کی شروعات آپ سے۔",
                ])}
                <span className="heading-spark">✦</span>
              </h1>
              <p>
                {t([
                  "Explore, be kind, and discover the leader in you. One little mission at a time.",
                  "دریافت کریں، مہربانی کریں، اور اپنے اندر کے رہنما کو پہچانیں۔ ایک وقت میں ایک چھوٹا مشن۔",
                ])}
              </p>
            </div>
          </div>
          <section
            className="progress-strip"
            aria-label={t(["Your progress", "آپ کی پیش رفت"])}
          >
            <div className="explorer-title">
              <span className="explorer-emblem">
                <Compass size={27} />
              </span>
              <div>
                <strong>
                  {t(
                    completed >= 5
                      ? ["Amazing leader", "زبردست رہنما"]
                      : completed >= 2
                        ? ["Growing leader", "ابھرتے رہنما"]
                        : ["Little explorer", "ننھے کھوجی"],
                  )}
                </strong>
                <small>
                  {t(["Every kind action counts", "ہر اچھا کام اہم ہے"])}
                </small>
              </div>
            </div>
            <div className="journey-progress">
              <div>
                <span>
                  {t(["Your leadership journey", "آپ کا لیڈرشپ کا سفر"])}
                </span>
                <b dir="ltr">{completed} / 5</b>
              </div>
              <progress
                value={completed}
                max="5"
                aria-label={t(["Missions completed", "مکمل مشنز"])}
              />
            </div>
            <div className="stat">
              <Flag size={20} />
              <div>
                <b>{completed}</b>
                <small>{t(["Missions done", "مکمل مشنز"])}</small>
              </div>
            </div>
            <div className="stat">
              <Award size={21} />
              <div>
                <b>{done.length}</b>
                <small>{t(["Badges earned", "حاصل بیجز"])}</small>
              </div>
            </div>
          </section>
          {page === "explore" && (
            <>
              <div className="section-heading">
                <h2>
                  {t(["Where will you grow today?", "آج آپ کیا سیکھیں گے؟"])}
                </h2>
                <div className="segmented">
                  <button
                    className={mapMode === "adventure" ? "selected" : ""}
                    onClick={() => setMapMode("adventure")}
                  >
                    {t(["Adventure map", "مہم کا نقشہ"])}
                  </button>
                  <button
                    className={mapMode === "world" ? "selected" : ""}
                    onClick={() => setMapMode("world")}
                  >
                    {t(["Pakistan map", "پاکستان کا نقشہ"])}
                  </button>
                </div>
              </div>
              <section className="map-wrap">
                {mapMode === "adventure" ? (
                  <AdventureMap done={done} pick={pick} t={t} />
                ) : (
                  <WorldMap pick={pick} t={t} />
                )}
              </section>
              <div className="under-map">
                <span>
                  <span className="legend-dot" />
                  {t([
                    "Pick a place. Start a little adventure.",
                    "ایک مقام چنیں۔ ایک چھوٹی مہم شروع کریں۔",
                  ])}
                </span>
                <span>
                  {t(["5 places to discover", "دریافت کے لیے ۵ مقامات"])}
                </span>
              </div>
            </>
          )}
          {(page === "explore" || page === "missions") && (
            <>
              <div className="section-heading">
                <div>
                  <h2>
                    {t(
                      page === "missions"
                        ? ["Your little missions", "آپ کے چھوٹے مشنز"]
                        : [
                            "Little missions. Real impact.",
                            "چھوٹے مشنز۔ حقیقی اثر۔",
                          ],
                    )}
                  </h2>
                  <p>
                    {t([
                      "Simple things you can do at home, with a grown-up nearby.",
                      "آسان کام جو گھر میں کسی بڑے کی موجودگی میں کیے جا سکتے ہیں۔",
                    ])}
                  </p>
                </div>
                {page === "explore" && (
                  <button
                    className="text-button"
                    onClick={() => go("missions")}
                  >
                    {t(["View all missions", "تمام مشنز"])}
                    <Next size={16} />
                  </button>
                )}
              </div>
              <div className="mission-grid">
                {(page === "explore" ? missions.slice(0, 3) : missions).map(
                  (m) => {
                    const Icon = icons[m.icon];
                    return (
                      <button
                        className="mission-card"
                        key={m.id}
                        onClick={() => pick(m)}
                      >
                        <div className="card-top">
                          <span
                            className="mission-icon"
                            style={{
                              background: m.color + "40",
                              color: "#365e50",
                            }}
                          >
                            <Icon size={25} />
                          </span>
                          <span className="skill-tag">
                            {done.includes(m.id) ? (
                              <>
                                <Check size={13} />
                                {t(["Completed", "مکمل"])}
                              </>
                            ) : (
                              t(m.skill)
                            )}
                          </span>
                        </div>
                        <h3>{t(m.title)}</h3>
                        <p>{t(m.description)}</p>
                        <div className="card-footer">
                          <span>
                            <Clock size={14} />
                            {m.time} {t(["min", "منٹ"])}
                            <i /> <Star size={13} />
                            30 XP
                          </span>
                          <span className="circle-arrow">
                            <Next size={16} />
                          </span>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </>
          )}
          {page === "badges" && (
            <>
              <div className="section-heading">
                <div>
                  <h2>
                    {t([
                      "A collection of little victories",
                      "چھوٹی کامیابیوں کا مجموعہ",
                    ])}
                  </h2>
                  <p>
                    {t([
                      "Complete a mission to bring each badge to life.",
                      "ہر بیج حاصل کرنے کے لیے اس کا مشن مکمل کریں۔",
                    ])}
                  </p>
                </div>
              </div>
              <div className="badge-grid">
                {[
                  ...missions,
                  {
                    id: "quiz",
                    icon: "flag",
                    badge: ["Thoughtful Leader", "سمجھ دار رہنما"],
                    color: "#e4bf62",
                  },
                ].map((m) => {
                  const Icon = icons[m.icon];
                  return (
                    <button
                      key={m.id}
                      className={`badge-card ${done.includes(m.id) ? "earned" : ""}`}
                      onClick={() => (m.id === "quiz" ? go("games") : pick(m))}
                    >
                      <div style={{ "--badge": m.color }}>
                        <Icon size={37} />
                      </div>
                      <h3>{t(m.badge)}</h3>
                      <small>
                        {done.includes(m.id)
                          ? t(["Earned — well done!", "حاصل کر لیا — شاباش!"])
                          : t(["Your next possibility", "آپ کا اگلا موقع"])}
                      </small>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {page === "games" && (
            <>
              <div className="section-heading">
                <div>
                  <h2>
                    {t([
                      "What would a kind leader do?",
                      "ایک مہربان رہنما کیا کرے گا؟",
                    ])}
                  </h2>
                  <p>
                    {t([
                      "Three little choices. Practise listening, kindness and teamwork.",
                      "تین چھوٹے فیصلے۔ توجہ، مہربانی اور ٹیم ورک کی مشق کریں۔",
                    ])}
                  </p>
                </div>
                <span className="skill-tag">
                  {t([
                    "Ages 6–12 · with a grown-up",
                    "۶ تا ۱۲ سال · کسی بڑے کے ساتھ",
                  ])}
                </span>
              </div>
              <section className="quiz-card">
                {quizFinished ? (
                  <div className="quiz-complete">
                    <Award size={52} />
                    <h2>
                      {t([
                        "That’s thoughtful leadership!",
                        "یہ ہے سمجھ دار لیڈرشپ!",
                      ])}
                    </h2>
                    <p>
                      {t([
                        "You practised including others, trying again, and listening with care.",
                        "آپ نے دوسروں کو شامل کرنے، دوبارہ کوشش اور توجہ سے سننے کی مشق کی۔",
                      ])}
                    </p>
                    <button
                      className="primary"
                      onClick={() => complete("quiz")}
                    >
                      {done.includes("quiz")
                        ? t(["View my badge", "میرا بیج دیکھیں"])
                        : t(["Collect my badge", "میرا بیج حاصل کریں"])}
                      <Award size={18} />
                    </button>
                    <button
                      className="text-button"
                      onClick={() => {
                        setQuizIndex(0);
                        setAnswer(null);
                        setQuizFinished(false);
                      }}
                    >
                      <RotateCcw size={15} />
                      {t(["Play again", "دوبارہ کھیلیں"])}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="quiz-kicker">
                      <Gamepad2 size={23} />
                      {t(["LEADERSHIP LAB", "لیڈرشپ کی مشق"])}
                      <span>
                        {quizIndex + 1} / {questions.length}
                      </span>
                    </div>
                    <h2>{t(questions[quizIndex].q)}</h2>
                    <div className="quiz-options">
                      {questions[quizIndex].options.map((o, i) => (
                        <button
                          key={`${quizIndex}-${i}`}
                          className={
                            answer === i
                              ? i === questions[quizIndex].answer
                                ? "correct"
                                : "retry"
                              : ""
                          }
                          disabled={answer === questions[quizIndex].answer}
                          onClick={() => setAnswer(i)}
                        >
                          <span>{String.fromCharCode(65 + i)}</span>
                          {t(o)}
                          {answer === i &&
                            i === questions[quizIndex].answer && (
                              <Check size={20} />
                            )}
                        </button>
                      ))}
                    </div>
                    {answer !== null && (
                      <div className="quiz-feedback" role="status">
                        {answer === questions[quizIndex].answer ? (
                          <>
                            <p>{t(questions[quizIndex].why)}</p>
                            <button
                              className="primary"
                              onClick={() => {
                                if (quizIndex === questions.length - 1)
                                  setQuizFinished(true);
                                else {
                                  setQuizIndex(quizIndex + 1);
                                  setAnswer(null);
                                }
                              }}
                            >
                              {t(["Continue", "آگے بڑھیں"])}
                              <Next size={16} />
                            </button>
                          </>
                        ) : (
                          <p>
                            {t([
                              "Let’s try again. Which choice helps everyone feel included and respected?",
                              "دوبارہ کوشش کریں۔ کس فیصلے سے سب کو عزت اور شمولیت کا احساس ہوگا؟",
                            ])}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}
          <section className="quote-banner">
            <span>
              <Heart size={24} />
            </span>
            <div>
              <strong>
                {t([
                  "You don’t have to be big to make a big difference.",
                  "بڑا فرق ڈالنے کے لیے بڑا ہونا ضروری نہیں۔",
                ])}
              </strong>
              <p>
                {t([
                  "A good leader helps others shine.",
                  "اچھا رہنما دوسروں کو آگے بڑھنے کا موقع دیتا ہے۔",
                ])}
              </p>
            </div>
            <Sparkles size={30} />
          </section>
          <footer>
            <span>
              <ShieldCheck size={14} />
              {t([
                "A gentle space to learn and grow",
                "سیکھنے اور آگے بڑھنے کی پُرسکون جگہ",
              ])}
            </span>
            <button onClick={() => setModal("parent")}>
              <Cloud size={14} />
              {storageError
                ? t(["Storage unavailable", "مقامی محفوظ کرنا ممکن نہیں"])
                : sync === "saved"
                  ? t(["Saved to your account", "اکاؤنٹ میں محفوظ"])
                  : sync === "saving"
                    ? t(["Saving…", "محفوظ ہو رہا ہے…"])
                    : sync === "error"
                      ? t([
                          "Cloud unavailable · saved on device",
                          "کلاؤڈ دستیاب نہیں · آلے پر محفوظ",
                        ])
                      : t([
                          "Progress saved on this device",
                          "پیش رفت اسی آلے پر محفوظ ہے",
                        ])}
            </button>
          </footer>
        </main>
      </div>
      {mission && (
        <Modal close={() => setMission(null)} label={t(mission.title)}>
          <span
            className="modal-icon"
            style={{ background: mission.color + "45" }}
          >
            {React.createElement(icons[mission.icon], { size: 31 })}
          </span>
          <div className="eyebrow">
            {t(mission.name)} · {mission.time} {t(["minutes", "منٹ"])}
          </div>
          <h2>{t(mission.title)}</h2>
          <p>{t(mission.description)}</p>
          <div className="checklist">
            {mission.steps.map((s, i) => (
              <label key={i}>
                <input
                  type="checkbox"
                  checked={steps.includes(i)}
                  onChange={() =>
                    setSteps(
                      steps.includes(i)
                        ? steps.filter((x) => x !== i)
                        : [...steps, i],
                    )
                  }
                />
                <span>{t(s)}</span>
              </label>
            ))}
          </div>
          <div className="safety-note">
            <Home size={17} />
            {t([
              "Do this at home with a trusted grown-up. No need to travel or share photos.",
              "یہ کام گھر میں کسی قابلِ اعتماد بڑے کے ساتھ کریں۔ کہیں جانے یا تصاویر بھیجنے کی ضرورت نہیں۔",
            ])}
          </div>
          <button
            className="primary wide"
            disabled={steps.length !== 3 || done.includes(mission.id)}
            onClick={() => complete(mission.id)}
          >
            {done.includes(mission.id)
              ? t([
                  "You’ve completed this mission!",
                  "آپ یہ مشن مکمل کر چکے ہیں!",
                ])
              : t([
                  "I did it! Collect 30 XP",
                  "میں نے کر لیا! ۳۰ پوائنٹس حاصل کریں",
                ])}
            <Check size={18} />
          </button>
        </Modal>
      )}
      {celebrate && (
        <Modal
          close={() => setCelebrate(null)}
          label={t(["Badge earned", "بیج حاصل ہو گیا"])}
        >
          <div className="celebration">
            <span className="celebration-stars">✦ · ✧ · ✦</span>
            <div className="big-medal">
              <Award size={62} />
            </div>
            <div className="eyebrow">
              {t(["A LITTLE VICTORY", "ایک چھوٹی کامیابی"])}
            </div>
            <h2>
              {t(
                celebrate === "quiz"
                  ? ["Thoughtful Leader", "سمجھ دار رہنما"]
                  : missions.find((m) => m.id === celebrate).badge,
              )}
            </h2>
            <p>
              {t([
                "One small action. One more step towards being a caring leader.",
                "ایک چھوٹا سا عمل۔ ایک مہربان رہنما بننے کی طرف ایک اور قدم۔",
              ])}
            </p>
            <button
              className="primary wide"
              onClick={() => {
                setCelebrate(null);
                go("badges");
              }}
            >
              {t(["See my badges", "میرے بیجز دیکھیں"])}
              <Award size={18} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "parent" && (
        <Modal
          close={() => setModal(null)}
          label={t(["Grown-up corner", "والدین کے لیے"])}
        >
          <span className="modal-icon">
            <ShieldCheck size={31} />
          </span>
          <h2>{t(["Growing leaders, together.", "مل کر رہنما بنائیں۔"])}</h2>
          <p>
            {t([
              "For children ages 6–12, alongside a parent or teacher. Read the missions together and celebrate effort, not competition.",
              "۶ تا ۱۲ سال کے بچوں کے لیے، والدین یا استاد کے ساتھ۔ مشنز مل کر پڑھیں اور کوشش کو سراہیں۔",
            ])}
          </p>
          <div className="parent-facts">
            <p>
              <Check size={16} />
              {t([
                "No child names, photos, chat or location tracking.",
                "بچوں کے نام، تصاویر، چیٹ یا لوکیشن ٹریکنگ نہیں۔",
              ])}
            </p>
            <p>
              <Check size={16} />
              {t([
                "Guest progress is stored in this browser. Clearing browser data removes it.",
                "بغیر لاگ اِن پیش رفت اسی براؤزر میں رہتی ہے۔ براؤزر کا ڈیٹا صاف کرنے سے یہ مٹ جائے گی۔",
              ])}
            </p>
            <p>
              <Check size={16} />
              {t([
                "One shared explorer journey per grown-up account.",
                "ہر بڑے کے اکاؤنٹ میں ایک مشترکہ تعلیمی سفر۔",
              ])}
            </p>
          </div>
          {session ? (
            <div>
              <h3>{t(["Your grown-up account", "آپ کا اکاؤنٹ"])}</h3>
              <p dir="ltr">{session.user.email}</p>
              <p role="status">
                {sync === "saved"
                  ? t([
                      "Your progress is saved in Supabase.",
                      "آپ کی پیش رفت Supabase میں محفوظ ہے۔",
                    ])
                  : sync === "error"
                    ? t([
                        "Cloud save is unavailable. Your progress is on this device; the database setup may still be pending.",
                        "کلاؤڈ میں محفوظ نہیں ہو سکا۔ پیش رفت اس آلے پر ہے؛ ڈیٹابیس کا سیٹ اپ باقی ہو سکتا ہے۔",
                      ])
                    : t(["Connecting…", "رابطہ ہو رہا ہے…"])}
              </p>
              <button
                className="primary"
                disabled={sync === "saving"}
                onClick={() => syncProgress(done, session.user)}
              >
                {t(["Sync progress", "پیش رفت محفوظ کریں"])}
                <Cloud size={16} />
              </button>
              <button
                className="text-button"
                onClick={async () => {
                  const { error } = await supabase.auth.signOut();
                  if (error)
                    setAuthMessage(
                      t([
                        "Sign out failed. Please try again.",
                        "لاگ آؤٹ نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
                      ]),
                    );
                }}
              >
                <LogOut size={16} />
                {t(["Sign out", "لاگ آؤٹ"])}
              </button>
            </div>
          ) : (
            <form onSubmit={login}>
              <h3>
                {t([
                  "Save your family’s progress",
                  "اپنے خاندان کی پیش رفت محفوظ کریں",
                ])}
              </h3>
              <p>
                {t([
                  "A parent or teacher can sign in by email. Completed mission IDs are then saved to their account.",
                  "والدین یا استاد ای میل سے لاگ اِن کر سکتے ہیں۔ پھر مکمل مشنز کی فہرست ان کے اکاؤنٹ میں محفوظ ہوگی۔",
                ])}
              </p>
              <label className="email-label" htmlFor="email">
                {t(["Grown-up email", "بڑے کی ای میل"])}
              </label>
              <input
                className="email-input"
                id="email"
                type="email"
                dir="ltr"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                {t([
                  "I am a parent or teacher and want to save this device’s progress to my account.",
                  "میں والد/والدہ یا استاد ہوں اور اس آلے کی پیش رفت اپنے اکاؤنٹ میں محفوظ کرنا چاہتا/چاہتی ہوں۔",
                ])}
              </label>
              <button className="primary wide" disabled={busy || !consent}>
                {busy
                  ? t(["Sending…", "بھیجا جا رہا ہے…"])
                  : t(["Email me a sign-in link", "مجھے لاگ اِن لنک بھیجیں"])}
                <Next size={16} />
              </button>
            </form>
          )}
          {authMessage && (
            <p className="auth-message" role="status">
              {authMessage}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
