import { useRef, useState } from "react";

import chapters from "./tour-chapters.json";

export function TourPlayer() {
  const video = useRef<HTMLVideoElement>(null);
  const [position, setPosition] = useState(0);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const active = chapters.reduce(
    (selected, chapter, i) => (position >= chapter.start ? i : selected),
    0,
  );

  function jump(start: number) {
    const player = video.current;
    if (!player || !ready) return;
    player.currentTime = start;
    setPosition(start);
    setNotice("");
    void player
      .play()
      .catch(() => setNotice("Use the player’s Play control to continue."));
  }

  return (
    <>
      <video
        ref={video}
        controls
        autoPlay
        playsInline
        src="/walkthrough.mp4"
        aria-label="LoungeProof narrated project walkthrough"
        onLoadedMetadata={() => setReady(true)}
        onTimeUpdate={() => setPosition(video.current?.currentTime ?? 0)}
        onError={() =>
          setNotice("The tour could not load. Reload the page to try again.")
        }
      />
      <nav className="tour-chapters" aria-label="Tour chapters">
        <span>JUMP TO A CHAPTER</span>
        <div>
          {chapters.map((chapter, i) => (
            <button
              key={chapter.title}
              disabled={!ready}
              aria-current={active === i ? "step" : undefined}
              onClick={() => jump(chapter.start)}
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              {chapter.title}
            </button>
          ))}
        </div>
      </nav>
      {notice && (
        <p className="tour-notice" role="status">
          {notice}
        </p>
      )}
    </>
  );
}
