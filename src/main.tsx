import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Plane,
  ShieldCheck,
  BookOpen,
  Check,
  X,
  HelpCircle,
  Clock,
  ChevronDown,
  Database,
  FileText,
  Route,
  LoaderCircle,
  Play,
  Ticket,
  Search,
  ChevronRight,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import {
  factsSchema,
  answerSchema,
  metaSchema,
  errorSchema,
  type Facts,
  type Verdict,
} from "./domain";
import { Pip, type PipMood } from "./Pip";
import "./style.css";
import { TourPlayer } from "./TourPlayer";
import { PipGuide, type GuideStop } from "./PipGuide";
const initial = factsSchema.parse({
  card: "hdfc-regalia-gold",
  travelDate: "2026-10-10",
  accountType: "unknown",
  openedOn: "2025-02-10",
  eligibleSpend: 65000,
  visitsUsed: 1,
});
type Answer = z.infer<typeof answerSchema>;
type Meta = z.infer<typeof metaSchema>;
type Page = "check" | "evidence" | "about";
type View = "decision" | "sources" | "agent";
type RequestState =
  { kind: "idle" } | { kind: "checking" } | { kind: "explaining" };
type Example = "balance" | "hdfc" | "axis" | "variant";
const examples: {
  id: Example;
  bank: string;
  title: string;
  detail: string;
  number: string;
}[] = [
  {
    id: "balance",
    bank: "ICICI WORLD DEBIT",
    title: "Zero spend. Still eligible?",
    detail: "A balance route changes the answer.",
    number: "01",
  },
  {
    id: "hdfc",
    bank: "HDFC REGALIA GOLD",
    title: "12 visits. Or 3 a quarter?",
    detail: "Dates settle the contradiction.",
    number: "02",
  },
  {
    id: "axis",
    bank: "AXIS PRIORITY DEBIT",
    title: "The right lounge. The right rule.",
    detail: "Match the window and exact terminal.",
    number: "03",
  },
  {
    id: "variant",
    bank: "ICICI VISA SIGNATURE",
    title: "Same name. Different card.",
    detail: "An unknown stays an unknown.",
    number: "04",
  },
];
function exampleFacts(id: Example): Facts {
  switch (id) {
    case "balance":
      return factsSchema.parse({
        ...initial,
        card: "icici-wealth-world",
        accountType: "savings",
        openedOn: "2025-09-01",
        programMaintained: true,
        eligibleSpend: 0,
        balance: 1200000,
        relationship: 0,
        question:
          "I have zero eligible spend but ₹12 lakh in qualifying deposits and balance. Is spending mandatory for this individual savings card?",
      });
    case "axis":
      return factsSchema.parse({
        ...initial,
        card: "axis-priority",
        openedOn: "2025-01-15",
        eligibleSpend: 12000,
        visitsUsed: 0,
        question:
          "Which months count, how many visits remain, and is Encalm at Delhi T3 domestic listed for my card?",
      });
    case "hdfc":
      return {
        ...initial,
        eligibleSpend: 0,
        question:
          "An older article says 12 annual lounge visits. Does that give me free domestic access with zero spending for this October trip?",
      };
    case "variant":
      return {
        ...initial,
        card: "icici-wealth-visa",
        question:
          "Does the reviewed World Mastercard rule apply to this Visa Signature card?",
      };
  }
}
function cardName(card: Facts["card"]) {
  switch (card) {
    case "hdfc-regalia-gold":
      return "Regalia Gold";
    case "axis-priority":
      return "Priority Debit";
    case "icici-wealth-world":
      return "Wealth World";
    case "icici-wealth-visa":
      return "Wealth Visa Signature";
    case "unknown":
      return "Exact card unknown";
  }
}
function moodFor(v: Verdict | null): PipMood {
  return !v ? "welcome" : v.status === "qualified" ? "qualified" : "caution";
}
function OriginalSources({ verdict }: { verdict: Verdict }) {
  return (
    <div className="source-links">
      <div className="subheading">
        <h3>The original bank evidence</h3>
        <span>{verdict.sources.length} SOURCES</span>
      </div>
      {verdict.sources.map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
          <span className="source-symbol">
            <FileText size={20} />
          </span>
          <span>
            <small className={`source-role role-${s.role}`}>{s.role}</small>
            <strong>{s.title}</strong>
            <small>{s.locator}</small>
          </span>
          <ArrowUpRight size={20} />
        </a>
      ))}
      {verdict.sources.length === 0 && (
        <p className="empty-note">
          This card's rule has not been reviewed in the pilot.
        </p>
      )}
      {verdict.conflicts.map((c) => (
        <article className="decision" key={c._id}>
          <BookOpen size={22} />
          <div>
            <h4>{c.title}</h4>
            <p>{c.decision}</p>
            <small>REVIEW DECISION · {c.decidedAt}</small>
          </div>
        </article>
      ))}
    </div>
  );
}
function App() {
  const [facts, setFacts] = useState<Facts>(initial),
    [result, setResult] = useState<Answer | null>(null),
    [request, setRequest] = useState<RequestState>({ kind: "idle" }),
    [error, setError] = useState(""),
    [meta, setMeta] = useState<Meta | null>(null),
    [page, setPage] = useState<Page>("check"),
    [view, setView] = useState<View>("decision"),
    [selectedExample, setSelectedExample] = useState<Example | null>(null),
    [tourOpen, setTourOpen] = useState(false),
    [guideTarget, setGuideTarget] = useState<{ stop: GuideStop } | null>(null);
  const checker = useRef<HTMLElement>(null),
    answer = useRef<HTMLElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    activeRequest = useRef<AbortController | null>(null),
    requestId = useRef(0);
  const working = request.kind !== "idle";
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollTo = (element: HTMLElement | null) =>
    element?.scrollIntoView({
      behavior: reducedMotion() ? "instant" : "smooth",
      block: "start",
    });
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/meta", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Evidence unavailable");
        const raw: unknown = await r.json();
        return metaSchema.parse(raw);
      })
      .then(setMeta)
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error
              ? e.message
              : "The evidence service is unavailable.",
          );
      });
    return () => {
      controller.abort();
      activeRequest.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (tourOpen) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [tourOpen]);
  useEffect(() => {
    if (!guideTarget || page !== "check") return;
    const target = document.querySelector(`[data-guide="${guideTarget.stop}"]`);
    if (!(target instanceof HTMLElement)) return;
    if (target instanceof HTMLDetailsElement) target.open = true;
    target.dataset.pipTarget = "true";
    scrollTo(target);
    const field = target.querySelector("select,input,button");
    if (field instanceof HTMLElement) field.focus({ preventScroll: true });
    return () => {
      delete target.dataset.pipTarget;
    };
  }, [guideTarget, page]);
  const update = <K extends keyof Facts>(key: K, value: Facts[K]) => {
    activeRequest.current?.abort();
    requestId.current += 1;
    setRequest({ kind: "idle" });
    setFacts((f) => ({ ...f, [key]: value }));
    setResult(null);
    setError("");
    setSelectedExample(null);
  };
  async function run(input: Facts = facts, withAgent = false) {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const id = ++requestId.current;
    setRequest({ kind: withAgent ? "explaining" : "checking" });
    setError("");
    if (withAgent) setView("agent");
    try {
      const response = await fetch(withAgent ? "/api/agent" : "/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      const raw: unknown = await response.json();
      if (!response.ok) {
        const parsed = errorSchema.safeParse(raw);
        throw new Error(
          parsed.success ? parsed.data.error : "The check could not complete.",
        );
      }
      const next = answerSchema.parse(raw);
      if (id !== requestId.current) return;
      setResult(next);
      if (!withAgent) {
        setView("decision");
        window.requestAnimationFrame(() => scrollTo(answer.current));
      }
    } catch (e) {
      if (!controller.signal.aborted && id === requestId.current)
        setError(
          e instanceof Error ? e.message : "The check could not complete.",
        );
    } finally {
      if (id === requestId.current) setRequest({ kind: "idle" });
    }
  }
  function preset(id: Example) {
    const next = exampleFacts(id);
    setFacts(next);
    setResult(null);
    setSelectedExample(id);
    setPage("check");
    void run(next);
  }
  const policy = meta?.corpus.policies.find(
    (p) =>
      p.card === facts.card &&
      (facts.accountType === "unknown" ||
        p.accountTypes.includes(facts.accountType)),
  );
  const period =
    policy?.window === "previous-three-months"
      ? "Previous 3 full calendar months"
      : "Previous calendar quarter";
  const number = (
    key: "eligibleSpend" | "balance" | "relationship" | "visitsUsed" | "guests",
    label: string,
    help?: string,
  ) => (
    <label className="field">
      {label}
      <input
        type="number"
        min="0"
        step="1"
        placeholder="Unknown"
        value={facts[key] ?? ""}
        onChange={(e) =>
          update(
            key,
            e.target.value === ""
              ? key === "guests"
                ? 0
                : null
              : Number(e.target.value),
          )
        }
      />
      {help && <small>{help}</small>}
    </label>
  );
  const verdict = result?.verdict ?? null;
  const mood: PipMood = working ? "reading" : moodFor(verdict);
  function navigate(next: Page) {
    setPage(next);
    window.scrollTo({
      top: 0,
      behavior: reducedMotion() ? "instant" : "smooth",
    });
  }
  return (
    <PipGuide
      verdict={verdict}
      working={working}
      suspended={tourOpen}
      onVisit={(stop) => {
        setPage("check");
        setGuideTarget({ stop });
      }}
      onExample={() => preset("balance")}
      onCheck={() => void run()}
      onEvidence={() => {
        setPage("check");
        setView("sources");
        setGuideTarget({ stop: "proof" });
      }}
    >
      <header className="site-header">
        <a className="brand" href="/" aria-label="LoungeProof home">
          <span className="brand-icon">
            <Ticket size={23} />
          </span>
          Lounge<span>Proof</span>
          <span className="brand-dot" />
        </a>
        <nav aria-label="Main navigation">
          <button
            className={page === "check" ? "active" : ""}
            onClick={() => navigate("check")}
          >
            Trip check
          </button>
          <button
            className={page === "evidence" ? "active" : ""}
            onClick={() => navigate("evidence")}
          >
            Evidence desk
          </button>
          <button
            className={page === "about" ? "active" : ""}
            onClick={() => navigate("about")}
          >
            How it works
          </button>
        </nav>
        <button className="watch-button" onClick={() => setTourOpen(true)}>
          <Play size={14} fill="currentColor" /> Watch the tour
        </button>
      </header>
      <main>
        {page === "check" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span className="status-dot" /> INDIA PILOT · EVIDENCE BEFORE
                  ENTRY
                </div>
                <h1>
                  Your card says
                  <br />
                  lounge access.
                  <br />
                  <span>
                    Does your trip
                    <br className="mobile-break" /> qualify?
                  </span>
                </h1>
                <p>
                  Skip the guesswork at the gate. Check the dated bank rule for
                  your exact card, then see what actually backs the answer.
                </p>
                <div className="hero-actions">
                  <button
                    className="primary hero-cta"
                    onClick={() => scrollTo(checker.current)}
                  >
                    Check my trip <ArrowRight size={20} />
                  </button>
                  <button
                    className="text-button"
                    onClick={() => preset("balance")}
                  >
                    Show me an example <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="hero-caption">
                  <ShieldCheck size={15} /> Original bank sources. Every
                  condition traceable.
                </div>
              </div>
              <div className="hero-world">
                <div className="world-flight">
                  <span>DEL</span>
                  <div className="flight-rule">
                    <Plane size={19} />
                  </div>
                  <span>PROOF</span>
                </div>
                <div className="departure-label">BOARDING WITH EVIDENCE</div>
                <Pip mood="welcome" />
                <div className="world-ticket">
                  <span>
                    <span className="ticket-dot" /> EXAMPLE TRIP
                  </span>
                  <strong>
                    DEL <ArrowRight size={18} /> Lounge
                  </strong>
                  <small>10 OCT 2026 · T3 · DOMESTIC</small>
                  <div className="ticket-rule">
                    <span>Card name alone</span>
                    <strong>isn't proof.</strong>
                  </div>
                </div>
              </div>
            </section>
            <section className="example-strip" aria-label="Try example trips">
              <div className="example-intro">
                <span>TRY THE FINE PRINT</span>
                <p>
                  Four trips.
                  <br />
                  Different answers.
                </p>
                <small>
                  Invented traveller facts.
                  <br />
                  Real bank documents.
                </small>
              </div>
              <div className="example-list">
                {examples.map((e) => (
                  <button
                    key={e.id}
                    className={`example ${selectedExample === e.id ? "selected" : ""}`}
                    disabled={working}
                    onClick={() => preset(e.id)}
                  >
                    <span className="example-bank">
                      {e.bank}
                      <span>{e.number}</span>
                    </span>
                    <strong>{e.title}</strong>
                    <span className="example-bottom">
                      <small>{e.detail}</small>
                      <ArrowUpRight size={22} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <section className="checker-section" ref={checker} id="trip-check">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">01 / YOUR TRIP</div>
                  <h2>Let's check your access.</h2>
                </div>
                <div className="live-status">
                  <span className="status-dot" />
                  {meta?.dataMode === "sanity-live"
                    ? "Policies live from Sanity"
                    : "Loading bank evidence"}
                </div>
              </div>
              <div className="workspace">
                <section className="trip-panel" aria-label="Trip facts">
                  <div className="trip-panel-heading">
                    <Ticket size={20} />
                    <span>THE DETAILS THAT MATTER</span>
                    <button
                      className="icon-button"
                      title="Reset trip"
                      aria-label="Reset trip"
                      disabled={working}
                      onClick={() => {
                        setFacts(initial);
                        setResult(null);
                        setError("");
                        setSelectedExample(null);
                      }}
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void run();
                    }}
                  >
                    <fieldset disabled={working}>
                      <label className="field" data-guide="card">
                        Exact card variant
                        <select
                          aria-label="Exact card variant"
                          value={facts.card}
                          onChange={(e) =>
                            update(
                              "card",
                              factsSchema.shape.card.parse(e.target.value),
                            )
                          }
                        >
                          <option value="hdfc-regalia-gold">
                            HDFC Regalia Gold Credit
                          </option>
                          <option value="icici-wealth-world">
                            ICICI Wealth World / Mastercard Debit
                          </option>
                          <option value="icici-wealth-visa">
                            ICICI Wealth Visa Signature (unreviewed)
                          </option>
                          <option value="axis-priority">
                            Axis Priority Debit
                          </option>
                          <option value="unknown">
                            I'm not sure of the exact card
                          </option>
                        </select>
                      </label>
                      <div className="selected-card">
                        <span>
                          {facts.card.startsWith("icici")
                            ? "ICICI"
                            : facts.card === "axis-priority"
                              ? "AXIS"
                              : facts.card === "unknown"
                                ? "CARD"
                                : "HDFC"}
                        </span>
                        <strong>{cardName(facts.card)}</strong>
                        <Ticket size={26} />
                        <small>EXAMPLE CARD · NO CARD NUMBER</small>
                      </div>
                      <div className="fields2">
                        <label className="field" data-guide="dates">
                          Travel date
                          <input
                            type="date"
                            value={facts.travelDate}
                            onChange={(e) =>
                              update("travelDate", e.target.value)
                            }
                            required
                          />
                        </label>
                        <label className="field">
                          Airport
                          <select
                            value={facts.airport}
                            onChange={(e) => update("airport", e.target.value)}
                          >
                            <option value="DEL">DEL · New Delhi</option>
                            <option value="BLR">BLR · Bengaluru</option>
                            <option value="BOM">BOM · Mumbai</option>
                            <option value="other">Another airport</option>
                          </select>
                        </label>
                      </div>
                      <div className="fields2">
                        <label className="field">
                          Terminal
                          <select
                            value={facts.terminal}
                            onChange={(e) => update("terminal", e.target.value)}
                          >
                            {["T1", "T1B", "T1C", "T2", "T3", "unknown"].map(
                              (t) => (
                                <option key={t} value={t}>
                                  {t === "unknown" ? "Not sure" : t}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <label className="field">
                          Flight section
                          <select
                            value={facts.flightType}
                            onChange={(e) =>
                              update(
                                "flightType",
                                factsSchema.shape.flightType.parse(
                                  e.target.value,
                                ),
                              )
                            }
                          >
                            <option value="domestic">Domestic</option>
                            <option value="international">International</option>
                          </select>
                        </label>
                      </div>
                      <details className="form-section" open data-guide="spend">
                        <summary>
                          <span>Eligibility facts</span>
                          <ChevronDown size={17} />
                        </summary>
                        <div className="form-section-body">
                          <label className="field">
                            {facts.card === "icici-wealth-world"
                              ? "Savings account opening date"
                              : "Card issue date"}
                            <input
                              type="date"
                              value={facts.openedOn ?? ""}
                              onChange={(e) =>
                                update("openedOn", e.target.value || null)
                              }
                            />
                          </label>
                          {facts.card === "icici-wealth-world" && (
                            <>
                              <label className="field">
                                Account type
                                <select
                                  value={facts.accountType}
                                  onChange={(e) =>
                                    update(
                                      "accountType",
                                      factsSchema.shape.accountType.parse(
                                        e.target.value,
                                      ),
                                    )
                                  }
                                >
                                  <option value="unknown">Not sure</option>
                                  <option value="savings">
                                    Individual savings
                                  </option>
                                  <option value="salary">Salary</option>
                                  <option value="family-savings">
                                    Family savings
                                  </option>
                                </select>
                              </label>
                              <label className="field">
                                Wealth programme enrolment
                                <select
                                  value={
                                    facts.programMaintained === null
                                      ? "unknown"
                                      : String(facts.programMaintained)
                                  }
                                  onChange={(e) =>
                                    update(
                                      "programMaintained",
                                      e.target.value === "unknown"
                                        ? null
                                        : e.target.value === "true",
                                    )
                                  }
                                >
                                  <option value="unknown">Not sure</option>
                                  <option value="true">Enrolled</option>
                                  <option value="false">Not enrolled</option>
                                </select>
                              </label>
                              {facts.accountType === "family-savings" ? (
                                <label className="field">
                                  1.5× programme criteria at family ID
                                  <select
                                    value={
                                      facts.familyEligibilityMaintained === null
                                        ? "unknown"
                                        : String(
                                            facts.familyEligibilityMaintained,
                                          )
                                    }
                                    onChange={(e) =>
                                      update(
                                        "familyEligibilityMaintained",
                                        e.target.value === "unknown"
                                          ? null
                                          : e.target.value === "true",
                                      )
                                    }
                                  >
                                    <option value="unknown">
                                      Not verified
                                    </option>
                                    <option value="true">Maintained</option>
                                    <option value="false">
                                      Not maintained
                                    </option>
                                  </select>
                                </label>
                              ) : (
                                facts.accountType === "savings" && (
                                  <div className="fields2">
                                    {number(
                                      "balance",
                                      "Deposits + balance (₹)",
                                    )}
                                    {number(
                                      "relationship",
                                      "Total relationship (₹)",
                                    )}
                                  </div>
                                )
                              )}
                            </>
                          )}
                          <div className="fields2">
                            {number("eligibleSpend", "Eligible spend (₹)")}
                            {number("visitsUsed", "Visits already used")}
                          </div>
                          <p className="field-note">
                            <Clock size={14} />
                            {period}
                          </p>
                          {policy && (
                            <p className="spend-note">{policy.spendNotes}</p>
                          )}
                        </div>
                      </details>
                      <details className="form-section">
                        <summary>
                          <span>Guests & location</span>
                          <ChevronDown size={17} />
                        </summary>
                        <div className="form-section-body fields2">
                          {number("guests", "Accompanying guests")}
                          <label className="field">
                            Lounge country
                            <select
                              value={facts.country}
                              onChange={(e) =>
                                update(
                                  "country",
                                  factsSchema.shape.country.parse(
                                    e.target.value,
                                  ),
                                )
                              }
                            >
                              <option value="India">India</option>
                              <option value="other">Outside India</option>
                            </select>
                          </label>
                        </div>
                      </details>
                    </fieldset>
                    <button
                      className="primary check-cta"
                      type="submit"
                      disabled={working}
                    >
                      {request.kind === "checking" ? (
                        <LoaderCircle className="spin" size={18} />
                      ) : (
                        <Search size={18} />
                      )}{" "}
                      {request.kind === "checking"
                        ? "Checking published rules…"
                        : "Check published eligibility"}
                      <ArrowRight size={19} />
                    </button>
                    <p className="form-footnote">
                      No card numbers. No banking login. Example values are
                      welcome.
                    </p>
                  </form>
                </section>
                <section
                  className={`answer-panel ${result ? "has-result" : ""}`}
                  ref={answer}
                  data-guide="proof"
                  id="answer"
                  aria-label="Eligibility result"
                  aria-busy={working}
                >
                  <div className="answer-heading">
                    <span className="eyebrow">02 / THE ANSWER</span>
                    <span className="answer-code">
                      {facts.airport} · {facts.terminal} ·{" "}
                      {facts.flightType.toUpperCase()}
                    </span>
                  </div>
                  {error && (
                    <div className="error" role="alert">
                      <HelpCircle size={20} />
                      {error}
                    </div>
                  )}
                  {!verdict ? (
                    <div className="empty-answer">
                      <Pip
                        mood={mood}
                        size="small"
                        message={
                          working
                            ? "Checking the dates, conditions and visit allowance."
                            : "Tell me where you’re headed. We’ll start with your card."
                        }
                      />
                      <span className="empty-kicker">
                        CARD + DATE + EVIDENCE
                      </span>
                      <h3>
                        {working
                          ? "Following the rule."
                          : "Ready when you are."}
                      </h3>
                      <p>
                        Choose your exact card and trip details on the left.
                        Unsure of a value? Leave it unknown. Then check the
                        published conditions.
                      </p>
                      <div className="empty-process">
                        <span>
                          <Ticket size={17} /> Exact card
                        </span>
                        <ChevronRight size={15} />
                        <span>
                          <Clock size={17} /> Dated rule
                        </span>
                        <ChevronRight size={15} />
                        <span>
                          <FileText size={17} /> Proof
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`verdict verdict-${verdict.status}`}
                        key={`${facts.card}-${verdict.status}`}
                      >
                        <div className="verdict-main">
                          <span className="verdict-label">
                            {verdict.status === "qualified" ? (
                              <Check size={17} />
                            ) : verdict.status === "not-qualified" ? (
                              <X size={17} />
                            ) : (
                              <HelpCircle size={17} />
                            )}{" "}
                            {verdict.status === "qualified"
                              ? "PUBLISHED CONDITIONS MET"
                              : verdict.status
                                  .replaceAll("-", " ")
                                  .toUpperCase()}
                          </span>
                          <h3>{verdict.title}</h3>
                          <p>{verdict.summary}</p>
                          {verdict.remaining !== null && (
                            <div className="allowance">
                              <strong>{verdict.remaining}</strong>
                              <span>
                                of {verdict.policy?.quota} visits left
                                <span>this calendar quarter</span>
                              </span>
                              <div className="quota-dots" aria-hidden="true">
                                {Array.from(
                                  { length: verdict.policy?.quota ?? 0 },
                                  (_, i) => (
                                    <span
                                      className={
                                        i < (verdict.remaining ?? 0)
                                          ? "available"
                                          : ""
                                      }
                                      key={i}
                                    />
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <Pip mood={mood} size="small" />
                      </div>
                      <nav className="result-tabs" aria-label="Result views">
                        <button
                          aria-pressed={view === "decision"}
                          onClick={() => setView("decision")}
                        >
                          <Route size={16} /> Decision trail
                        </button>
                        <button
                          aria-pressed={view === "sources"}
                          onClick={() => setView("sources")}
                        >
                          <FileText size={16} /> Bank evidence
                        </button>
                        <button
                          aria-pressed={view === "agent"}
                          onClick={() => setView("agent")}
                        >
                          <Search size={16} /> Ask Pip{" "}
                          <span className="tiny-dot" />
                        </button>
                      </nav>
                      <div className="result-content" key={view}>
                        {view === "decision" ? (
                          <>
                            {verdict.questions.length > 0 && (
                              <div className="questions">
                                <h4>What we still need</h4>
                                {verdict.questions.map((q) => (
                                  <p key={q}>
                                    <HelpCircle size={16} />
                                    {q}
                                  </p>
                                ))}
                              </div>
                            )}
                            <div className="subheading">
                              <h3>Here's how the rule applies</h3>
                              <span>
                                {result?.dataMode === "sanity-live"
                                  ? "SANITY LIVE"
                                  : "SNAPSHOT"}
                              </span>
                            </div>
                            <div className="trace">
                              {verdict.trace.map((t, i) => (
                                <article
                                  className={`trace-row trace-${t.state}`}
                                  key={`${t.label}-${i}`}
                                  style={{
                                    animationDelay: `${Math.min(i * 0.065, 0.4)}s`,
                                  }}
                                >
                                  <span className={`trace-icon ${t.state}`}>
                                    {t.state === "pass" ? (
                                      <Check size={15} />
                                    ) : t.state === "fail" ? (
                                      <X size={15} />
                                    ) : t.state === "unknown" ? (
                                      <HelpCircle size={15} />
                                    ) : (
                                      <FileText size={15} />
                                    )}
                                  </span>
                                  <div>
                                    <h4>{t.label}</h4>
                                    <p>{t.detail}</p>
                                  </div>
                                  <span className="trace-state">
                                    {t.state === "pass"
                                      ? "MET"
                                      : t.state === "fail"
                                        ? "NOT MET"
                                        : t.state === "unknown"
                                          ? "UNREVIEWED"
                                          : "RULE"}
                                  </span>
                                </article>
                              ))}
                            </div>
                            {verdict.conflicts.length > 0 && (
                              <button
                                className="conflict-notice"
                                onClick={() => setView("sources")}
                              >
                                <BookOpen size={19} />
                                <span>
                                  A newer rule takes precedence.
                                  <small>See the stored source decision.</small>
                                </span>
                                <ArrowUpRight size={18} />
                              </button>
                            )}
                            <div className="admission-note">
                              <HelpCircle size={18} />
                              <p>
                                {verdict.loungeStatus === "listed"
                                  ? "Your exact terminal has a reviewed listing. Bank validation and lounge admission still apply."
                                  : "Exact lounge unverified in this pilot. Check the bank directory before travelling."}
                              </p>
                            </div>
                          </>
                        ) : view === "sources" ? (
                          <OriginalSources verdict={verdict} />
                        ) : (
                          <div className="agent-box">
                            <div className="agent-title">
                              <img
                                src="/brand/pip-scan.png"
                                width="74"
                                height="74"
                                alt=""
                              />
                              <div>
                                <h3>Ask Pip to show the evidence.</h3>
                                <p>
                                  A live agent reads the Sanity Knowledge Base.
                                </p>
                              </div>
                            </div>
                            <label className="field agent-field">
                              Your question
                              <textarea
                                aria-label="Question for the evidence agent"
                                disabled={working}
                                value={facts.question}
                                onChange={(e) =>
                                  setFacts((f) => ({
                                    ...f,
                                    question: e.target.value,
                                  }))
                                }
                                placeholder="Why does this policy apply to my trip?"
                              />
                            </label>
                            <button
                              className="primary"
                              disabled={working}
                              onClick={() => void run(facts, true)}
                            >
                              {request.kind === "explaining" ? (
                                <LoaderCircle size={18} className="spin" />
                              ) : (
                                <Search size={18} />
                              )}{" "}
                              {request.kind === "explaining"
                                ? "Reading live evidence…"
                                : "Explain with the live agent"}
                              <ArrowRight size={18} />
                            </button>
                            {request.kind === "explaining" && (
                              <div className="agent-reading">
                                <Pip mood="reading" size="small" />
                                <p>
                                  Reading relevant Knowledge Base entries.
                                  <span>This can take about a minute.</span>
                                </p>
                              </div>
                            )}
                            {result?.agent && (
                              <div className="agent-response">
                                <div className="retrieval-badge">
                                  <Check size={16} />
                                  <span>LIVE CONTEXT READ VERIFIED</span>
                                </div>
                                <div className="tool-trace">
                                  {result.agent.toolCalls?.join(" → ")}
                                </div>
                                <p>
                                  {result.agent.answer ||
                                    "The agent could not finish. The published rule check remains available."}
                                </p>
                                <button
                                  className="text-button"
                                  onClick={() => setView("sources")}
                                >
                                  Inspect the bank sources{" "}
                                  <ArrowUpRight size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <details className="limits">
                        <summary>
                          What this result can and can't tell you{" "}
                          <ChevronDown size={15} />
                        </summary>
                        {verdict.caveats.map((c) => (
                          <p key={c}>{c}</p>
                        ))}
                      </details>
                    </>
                  )}
                </section>
              </div>
            </section>
            <section className="closing-strip">
              <div>
                <span className="eyebrow">BEFORE YOU HEAD TO THE GATE</span>
                <h2>
                  Know the rule.
                  <br />
                  <span>Keep the proof.</span>
                </h2>
              </div>
              <button
                className="round-link"
                onClick={() => navigate("evidence")}
                aria-label="Explore the evidence desk"
              >
                <ArrowUpRight size={34} />
              </button>
              <p>
                Real bank documents.
                <br />
                Dated rules.
                <br />
                No promises of admission.
              </p>
            </section>
          </>
        ) : page === "evidence" ? (
          <section className="desk page-enter">
            <div className="eyebrow">THE EVIDENCE DESK</div>
            <div className="desk-heading">
              <h1>
                Receipts.
                <br />
                <span>Not rumours.</span>
              </h1>
              <p>
                Original bank documents, dated conditions and the decisions
                behind each answer. Sources reviewed 3 October 2026.
              </p>
            </div>
            <div className="metrics">
              {[
                [meta?.corpus.sources.length ?? "—", "bank sources"],
                [meta?.corpus.policies.length ?? "—", "reviewed rules"],
                [meta?.corpus.lounges.length ?? "—", "exact lounge entries"],
                [
                  meta?.tests
                    ? `${meta.tests.passed}/${meta.tests.total}`
                    : "—",
                  "source-based cases",
                ],
              ].map(([n, t]) => (
                <div key={t}>
                  <strong>{n}</strong>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div className="source-grid">
              {meta?.corpus.sources.map((s, i) => (
                <article key={s.id}>
                  <div className="source-card-top">
                    <span className={`source-role role-${s.role}`}>
                      {s.role}
                    </span>
                    <span>/{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <FileText size={31} />
                  <h3>{s.title}</h3>
                  <p>{s.locator}</p>
                  <small>
                    {s.publisher} · {s.retrievedAt.slice(0, 10)}
                  </small>
                  <details>
                    <summary>
                      Verify source fingerprint <ChevronDown size={15} />
                    </summary>
                    <code>{s.sha256}</code>
                  </details>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    Read the original <ArrowUpRight size={20} />
                  </a>
                </article>
              ))}
            </div>
            {meta?.corpus.conflicts.map((c) => (
              <article className="decision wide" key={c._id}>
                <BookOpen size={26} />
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.decision}</p>
                  <small>
                    {c.status.toUpperCase()} · {c.decidedAt} · STORED IN SANITY
                  </small>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="desk about page-enter">
            <div className="eyebrow">FROM RULE TO REASON</div>
            <div className="desk-heading">
              <h1>
                Follow
                <br />
                <span>the evidence.</span>
              </h1>
              <Pip size="small" mood="reading" />
            </div>
            <div className="how-flow">
              {[
                [
                  "01",
                  "Collect",
                  "Public bank PDFs and pages, with retrieval dates and SHA-256 hashes.",
                ],
                [
                  "02",
                  "Structure",
                  "Sanity stores exact card scope, dates, qualifying routes, quotas and source decisions.",
                ],
                [
                  "03",
                  "Check",
                  "The evaluator applies reviewed rules. Unknown facts stay unknown.",
                ],
                [
                  "04",
                  "Explain",
                  "The agent reads Sanity Context and explains the result with bank citations.",
                ],
              ].map(([n, t, b]) => (
                <article key={n}>
                  <span>{n}</span>
                  <h3>{t}</h3>
                  <p>{b}</p>
                  <ArrowRight size={24} />
                </article>
              ))}
            </div>
            <div className="scope-grid">
              <article>
                <span className="eyebrow">THE PILOT</span>
                <h3>Three exact card families.</h3>
                <p>
                  ICICI Wealth World / Mastercard debit, HDFC Regalia Gold in
                  India, and Axis Priority debit. Exact lounge entries cover
                  Axis at DEL, BLR and BOM. Other terminal matches remain
                  unreviewed.
                </p>
              </article>
              <article>
                <span className="eyebrow">THE BOUNDARY</span>
                <h3>Published rules, example facts.</h3>
                <p>
                  Bank documents are real; traveller spending and dates are
                  examples. No account integration or guaranteed admission.
                  Review horizon: 31 October 2026. Later trips need a source
                  refresh.
                </p>
              </article>
            </div>
            <a
              className="external"
              href="https://www.sanity.io/@o92nj83s9/context/knowledge-bases/kbSZiSrOJAf4"
              target="_blank"
              rel="noreferrer"
            >
              Open the Sanity Knowledge Base <ExternalLink size={17} />
            </a>
          </section>
        )}
        <footer>
          <a className="brand" href="/">
            Lounge<span>Proof</span>
            <span className="brand-dot" />
          </a>
          <div className="footer-actions">
            <button onClick={() => setTourOpen(true)}>
              <Play size={14} /> Watch the tour
            </button>
            <button onClick={() => navigate("about")}>
              How it works <ArrowUpRight size={14} />
            </button>
          </div>
          <span>Built for Sanity Challenge · Path One</span>
          <span>India pilot / October 2026</span>
        </footer>
      </main>
      <dialog
        ref={dialog}
        className="tour-dialog"
        onCancel={() => setTourOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setTourOpen(false);
        }}
      >
        <div className="tour-top">
          <strong>LoungeProof · Meet the fine print</strong>
          <button
            className="icon-button"
            aria-label="Close tour"
            onClick={() => setTourOpen(false)}
          >
            <X size={22} />
          </button>
        </div>
        {tourOpen && <TourPlayer />}
        <p>
          Real bank documents. Invented traveller facts. Live Sanity Context.
        </p>
      </dialog>
    </PipGuide>
  );
}
const root = document.getElementById("root");
if (!root) throw new Error("The application root is missing.");
createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
