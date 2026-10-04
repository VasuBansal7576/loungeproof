# Pip performance and layout audit

The website is silent. The voice and expressive guide performance belong in the video, following the user's clarification.

## Website checks

- Production build passes. Existing 45 rules/source tests pass.
- The empty answer panel no longer has a 700px minimum height. Desktop gives the form a wider two-column layout and a compact 360px answer placeholder. Issue date, eligible spending and visits share one row where applicable. A completed verdict switches to the wide evidence panel.
- Browser checks at 360, 390, 768, 1470 and 1920px found no horizontal document overflow. Mobile trip form, guide and evidence desk were visually inspected.
- Current real Sanity preset results were checked: ICICI zero spend plus qualifying balance passes with one visit remaining, HDFC passes with two remaining, Axis passes with the exact Encalm listing and two remaining, Visa Signature remains unreviewed.
- The guide opens, focuses and highlights card/date fields, supports direct step selection, minimizes/expands/closes, and gives a pre-result explanation before checking. Editing a fact clears the verdict and restores pre-result guidance. Escape returns focus. No website audio players remain.
- Evidence desk and explanation page navigation and responsive layouts were inspected.

## Video changes

A roughly 90-second six-scene performance uses local Kokoro bf_emma, speed 1.10, a 4% pitch lift and light EQ/compression. Processed voices target -17 LUFS and -1.5dB true peak. This is a synthetic character voice, not a clone of a real person.

Pip's mouth follows the actual WAV amplitude at 15Hz, with neutral closure during silence. Eyelids, brows, gaze, torso, paper wings and feet move independently. The greeting, stop gesture, HDFC hesitation, Axis point and closing wave/wink differ by scene. The independent wing trajectory was captured in snapshots/pip-v3-wave.png. There are no invented word-level captions: local transcription returned no timestamps.

All six mounted scenes were inspected. Updated real app captures replaced the earlier UI captures. The Axis lounge crop was aligned to its actual row; HDFC Pip was moved away from the source caption and remains visible after the comparison clears. Earlier bank, Sanity Knowledge Base and completed live agent screenshots remain valid evidence. Traveller facts are invented.

Final machine checks and encoded-video/browser-playback receipts are in reports/delivery.json. The delivered HTML fragments are the render source of truth. The one-off migration script is archival and predates final manual framing and gestures.
