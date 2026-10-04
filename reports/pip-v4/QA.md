# Problem-first narration revision

The user requested slower speech and an explanation of the problem before the demo.

The first 32 seconds explain the gap between an advertised lounge perk and the actual conditions: qualifying spend, visits used, terminal and policy date. The opening identifies the question LoungeProof addresses and its source-backed approach. Pip introduces the input flow next; the three example results follow after 46 seconds.

The same synthetic character voice is retained. Existing example speech plays at 82% tempo with pitch preserved. New opening and guide narration is locally synthesized and slowed to a measured 139 words per minute. The complete narration averages about 149 words per minute. Mouth envelopes are regenerated from actual processed WAVs. Scene gestures and visual transitions are retimed with narration. The seven chapters use actual audio durations. No new website speech was added.

Prior videos are preserved. Final HTML fragments and the new problem-intro template are the render source of truth. The v4 builder can rebuild the source using the frozen v3 fragments in the local history backup; ordinary re-rendering requires only the delivered HTML/assets and npm run render.

HyperFrames usage reporting is unavailable in CLI 0.8.114; synthesis and rendering use the existing local setup. No cloud synthesis or publishing is used.

Machine check, snapshot inspection, encoded-video decode and app playback receipts are recorded with the final delivery.

Final HyperFrames gate passed with zero errors in lint, runtime, layout, motion and contrast. Motion used 300 samples; 36 contrast checks passed. The one reviewed lint warning is the intentional pair of Axis result/directory crops from the same real screenshot. Opening and all seven scene snapshots were inspected.

The final H.264/AAC export decoded completely without errors. Nine actual encoded frames were inspected, including the end hold. The MP4, public copy and production copy have identical SHA-256 hashes. Chrome played the new 143.766667-second version unmuted without media errors. New chapter seeks passed by click and keyboard. All seven chapters fit at 390 × 844 with no horizontal overflow; mobile HDFC seeking and dismissal passed. Desktop Escape returns focus to Watch the tour.
