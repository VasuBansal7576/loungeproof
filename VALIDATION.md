# Validation receipt — 3 October 2026

- Production frontend build: pass.
- Automated deterministic tests: 45/45 pass.
- Source-reviewed live Sanity evaluations: 38/38 pass (`reports/evaluation.json`).
- Live agent scenarios: 4/4 pass (`reports/agent-evaluation.json`). Each observed completed `initial_context` and `knowledge_base_read` events and retained the expected deterministic verdict. A direct SDK probe also listed the three expected Context read tools successfully.
- Source fingerprints: downloaded original bytes match stored SHA-256.
- Browser checks: HDFC current rule, ICICI zero-spend balance route, Axis precise DEL T3 match, and unreviewed Visa scope. Mobile viewport 375×812 has document/body width 375 without horizontal overflow.
- Sanity Knowledge Base initially built ten entries from the 24 source dataset documents. A full rebuild with the reviewed purpose now has seven entries focused on the three pilot cards. Both the Axis quota summary and body were verified as 2 domestic visits per quarter. The correction is a standing instruction. The Axis first-day monthly carry-over boundary was added to the evaluator and regression cases. A further generated directory count conflict was resolved against original Table 3: eight airports with listed international lounges, rather than four. Directory listings do not extend this pilot's reviewed domestic benefit scope.
- Live answers exposed generated content that overstated HDFC's possible new-card exemption and treated Axis card-issuance information as a separate lounge account requirement. Standing rewrite instructions corrected these entries. HDFC was rerun in the four-case batch; Axis was rechecked after the scope correction (`reports/agent-axis-after-scope-review.json`). The earlier batch is retained in `reports/agent-evaluation-before-content-review.json`.
- Human answer review: ICICI preserves the deposits/balance OR route with zero spending; HDFC uses current July 2026 terms over legacy annual marketing and leaves the September issuance exemption conditional; Axis uses July–September for an October trip, retains 2 quarterly visits, and cites DEL T3 domestic Encalm at Table 3, page 4, row 23. Pilot directory gaps are not presented as bank exclusions. These checks cover these examples, not arbitrary model questions.
- Additional browser agent run: ICICI zero-spend / ₹12 lakh balance answer displayed successfully with completed Context calls (`reports/app-live-agent.jpg`).
- Original video, version 1: HyperFrames runtime, layout, and contrast checks: pass with zero errors and zero browser audit warnings. Motion analysis was disabled in the final check. Lint has 29 reviewed warnings: numeric frame IDs require CSS escaping; repeated source images are intentional distinct crops. Seven scene/cut snapshots were captured for visual inspection.
- Original video, version 1 narration: local Kokoro am_michael, 119.68 seconds, no music. Real bank documents and actual app/Knowledge Base screenshots, including the completed live evidence-agent answer; example traveller facts are invented.
- Original video, version 1 MP4: rendered and validated, 119.70 seconds, 1920×1080 at 30 fps, H.264 video and stereo AAC audio. Axis, closing, Knowledge Base, and completed live-agent frames were inspected from the actual MP4. The final render includes the actual browser agent response.
- Runtime dependency audit: zero advisories. Development Sanity/CLI chain: ten high advisories remain in the published braces chain; recorded separately.

## Local credential status

The user approved Context Viewer access until 2 November 2026 and storage in the ignored server .env. The user subsequently chose to retain that read-only local credential. No replacement is awaiting approval. It remains server-only and owner-readable (0600), excluded from browser assets, source archive and video. Its one-time value appeared in an earlier tool log; the user was informed.

## Design revision

Pip-led interface and video revision: see reports/redesign/QA.md, AUDIT.md and ASSETS.md. The original walkthrough remains available as version1; new rendering evidence is recorded in the delivery report.

The delivered version 2 is 88.366667 seconds at 1920×1080 and 30 fps, with local Kokoro af_heart narration and six quiet sound cues. Runtime, layout, contrast and enabled motion checks pass. The one lint warning concerns intentional crops of the same source screenshot. Full MP4 decode succeeds; six encoded frames were visually reviewed. Desktop and phone chapter navigation, keyboard activation and modal focus return pass. All 45 automated rules/source tests pass after the redesign. See reports/delivery.json for the final file fingerprint.

## Pip voice and performance revision

Video v3 uses a rewritten conversational script, local synthetic voice, articulated SVG joints, actual-audio mouth amplitude and varied scene gestures. The website is silent and interactive. Compact empty-state/form layouts and guide answer invalidation are covered in reports/pip-v3/QA.md. Final video, source archive and playback receipts are in reports/delivery.json. The underlying policy checks remain 38/38 live cases, 45/45 automated tests and 4/4 saved live agent cases.

## Problem-first narration revision

Video v4 adds a 32-second problem/solution opening, followed by a slower guide introduction and retimed examples. The complete narration averages roughly 149 words per minute. The underlying policy evaluator and bank sources are unchanged. Final check and playback evidence is in reports/pip-v4 and reports/delivery.json.
