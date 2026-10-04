import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowRight, Play, ChevronDown, X } from "lucide-react";
import { PipRig } from "./PipRig";
import dialogue from "./pip-dialogue.json";
import type { Verdict } from "./domain";

type Line = keyof typeof dialogue;
export type GuideStop = "card" | "dates" | "spend" | "proof";
const stops: GuideStop[] = ["card", "dates", "spend", "proof"];
const labels: Record<GuideStop, string> = {
  card: "Your exact card",
  dates: "Your flight",
  spend: "The qualifying window",
  proof: "Your result",
};
export const PipContext = createContext<{
  open: boolean;
  meet: (opener: HTMLButtonElement) => void;
} | null>(null);

export function PipGuide({
  children,
  verdict,
  working,
  onVisit,
  onExample,
  onEvidence,
  onCheck,
  suspended,
}: {
  children: ReactNode;
  verdict: Verdict | null;
  working: boolean;
  onVisit: (stop: GuideStop) => void;
  onExample: () => void;
  onEvidence: () => void;
  onCheck: () => void;
  suspended: boolean;
}) {
  const [open, setOpen] = useState(false),
    [minimized, setMinimized] = useState(false),
    [line, setLine] = useState<Line>("welcome"),
    [step, setStep] = useState<GuideStop | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null),
    opener = useRef<HTMLButtonElement | null>(null),
    lastVerdict = useRef<Verdict | null>(null);
  function say(next: Line) {
    setLine(next);
  }
  function meet(button: HTMLButtonElement) {
    opener.current = button;
    setOpen(true);
    setMinimized(false);
    setStep(null);
    say("welcome");
  }
  function close() {
    setOpen(false);
    opener.current?.focus({ preventScroll: true });
  }
  function visit(next: GuideStop) {
    setMinimized(next === "proof" && !!verdict);
    setStep(next);
    say(next === "proof" && !verdict ? "before-result" : next);
    onVisit(next);
  }
  useEffect(() => {
    if (open) closeButton.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (e.target instanceof HTMLElement && e.target.closest("input,select"))
          return;
        setOpen(false);
        opener.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  useEffect(() => {
    if (verdict === lastVerdict.current) return;
    lastVerdict.current = verdict;
    if (!open) return;
    if (!verdict) {
      if (step === "proof") {
        say("before-result");
        setMinimized(false);
      }
      return;
    }
    setStep("proof");
    setMinimized(true);
    say(
      verdict.status === "qualified"
        ? "qualified"
        : verdict.status === "not-qualified"
          ? "not-qualified"
          : "unknown",
    );
  }, [verdict]);
  const currentIndex = step ? stops.indexOf(step) : -1;
  const pose = working
    ? "reading"
    : step === "card" || line === "exact"
      ? "pointing"
      : line === "qualified"
        ? "qualified"
        : line === "unknown" || line === "not-qualified"
          ? "caution"
          : "welcome";
  return (
    <PipContext.Provider value={{ open, meet }}>
      {children}
      {!suspended && (
        <button
          className="guide-launcher"
          onClick={(e) => (open ? close() : meet(e.currentTarget))}
          aria-expanded={open}
          aria-controls="pip-guide"
        >
          <span className="guide-launcher-face">
            <PipRig />
          </span>
          {open ? "Close Pip" : "Need a hand?"}
          <span className="guide-live-dot" />
        </button>
      )}
      {open && !suspended && (
        <aside
          className="pip-guide"
          data-minimized={minimized}
          id="pip-guide"
          aria-label="Pip trip guide"
        >
          <div className="guide-top">
            <span>
              <i /> PIP’S DEPARTURE DESK
            </span>
            <button
              className="guide-minimize icon-button"
              aria-label={minimized ? "Expand Pip guide" : "Minimize Pip guide"}
              onClick={() => setMinimized((v) => !v)}
            >
              <ChevronDown size={18} />
            </button>
            <button
              ref={closeButton}
              className="icon-button"
              onClick={close}
              aria-label="Close Pip guide"
            >
              <X size={19} />
            </button>
          </div>
          <div className="guide-intro">
            <div className={`guide-character rig-pose-${pose}`}>
              <PipRig />
            </div>
            <div>
              <small>
                {working
                  ? "Checking the bank rules"
                  : step
                    ? labels[step]
                    : "Your little travel companion"}
              </small>
              <h3>
                {line === "welcome"
                  ? "Got a minute before boarding?"
                  : line === "qualified"
                    ? "Good. One more check."
                    : line === "unknown"
                      ? "Let’s answer that first."
                      : line === "not-qualified"
                        ? "There’s a catch."
                        : step
                          ? labels[step]
                          : "The name matters."}
              </h3>
            </div>
          </div>
          {minimized && (
            <p className="guide-summary">{dialogue[line].split(". ")[0]}.</p>
          )}
          <p className="guide-dialogue" aria-live="polite">
            {dialogue[line]}
          </p>
          {step && (
            <div className="guide-progress" aria-label="Trip guide steps">
              {stops.map((s, i) => (
                <button
                  key={s}
                  disabled={working}
                  aria-current={step === s ? "step" : undefined}
                  onClick={() => visit(s)}
                >
                  <span>{i + 1}</span>
                  {labels[s]}
                </button>
              ))}
            </div>
          )}
          {!step ? (
            <div className="guide-choices">
              <button onClick={() => visit("card")}>
                Walk me through my trip <ArrowRight size={16} />
              </button>
              <button
                disabled={working}
                onClick={() => {
                  say("balance");
                  onExample();
                }}
              >
                Show me the zero-spend example <Play size={15} />
              </button>
              <button onClick={() => say("exact")}>
                Why does the exact card matter? <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="guide-actions">
              {step === "proof" ? (
                <>
                  <button
                    disabled={!verdict || working}
                    onClick={() => {
                      say("proof");
                      onEvidence();
                    }}
                  >
                    Show the bank evidence <ArrowRight size={16} />
                  </button>
                  <button disabled={working} onClick={onCheck}>
                    {verdict ? "Check again" : "Check my trip"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <button
                  disabled={working}
                  onClick={() => {
                    const next = stops[currentIndex + 1];
                    if (next) visit(next);
                  }}
                >
                  {step === "spend" ? "See where the result goes" : "Next stop"}{" "}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
          <span className="guide-footnote">
            Example values are fine. Leave uncertain facts unknown.
          </span>
        </aside>
      )}
    </PipContext.Provider>
  );
}
