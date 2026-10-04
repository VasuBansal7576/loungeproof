import { useContext, useState, type CSSProperties } from "react";
import { PipRig } from "./PipRig";
import { PipContext } from "./PipGuide";
export type PipMood = "welcome" | "reading" | "qualified" | "caution";
const messages: Record<PipMood, string> = {
  welcome: "Before you join that queue, let's check one thing.",
  reading: "Hang on. I'm checking the dates.",
  qualified: "Good. Now let's check the lounge itself.",
  caution: "There's a catch here. Let's take a look.",
};
export function Pip({
  mood = "welcome",
  size = "hero",
  message,
}: {
  mood?: PipMood;
  size?: "hero" | "small";
  message?: string;
}) {
  const guide = useContext(PipContext);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const style: CSSProperties & Record<"--look-x" | "--look-y", string> = {
    "--look-x": `${look.x}px`,
    "--look-y": `${look.y}px`,
  };
  return (
    <button
      className={`pip pip-${size} pip-${mood}`}
      style={style}
      aria-label="Open Pip trip guide"
      aria-expanded={guide?.open ?? false}
      onClick={(e) => guide?.meet(e.currentTarget)}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        setLook({
          x: ((e.clientX - r.left) / r.width - 0.5) * 10,
          y: ((e.clientY - r.top) / r.height - 0.5) * 7,
        });
      }}
      onPointerLeave={() => setLook({ x: 0, y: 0 })}
    >
      <span className="pip-bubble">{message ?? messages[mood]}</span>
      <span className="pip-stage">
        <PipRig />
      </span>
      {size === "hero" && (
        <span className="pip-label">
          <span /> PIP · YOUR TRIP GUIDE{" "}
          <span className="pip-hint">Show me how ↗</span>
        </span>
      )}
    </button>
  );
}
