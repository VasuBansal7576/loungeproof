# LoungeProof

[Sanity Challenge, Path One](https://dev.to/challenges/sanity-2026-09-16) submission. Public source: https://github.com/VasuBansal7576/loungeproof

An India lounge-benefit evidence assistant built for the [Sanity Challenge, Path One](https://dev.to/challenges/sanity-2026-09-16). Select an exact card, a travel date, and example facts. Get a dated eligibility check, original bank citations, remaining visit calculation, and an explicit distinction between benefit qualification and actual admission.

## Run

```sh
npm ci
cp .env.example .env
npm run dev
```

Open http://127.0.0.1:4317. Public Sanity policy reads work without a token. The optional evidence agent needs an organization token with **Context Viewer only**, the Knowledge Base MCP endpoint above, and a signed-in local Codex CLI. The token belongs only in the ignored server `.env`; never in Vite variables or the browser. This application binds to localhost and runs one agent request at a time. It is a local demonstration, not a public multi-user service.

```sh
npm run build
npm test
npm run eval
npm start
```

Do not run dev and start on the same port simultaneously. `npm start` serves the production build. Tests use local source snapshots; evaluation reads the live public Sanity dataset when configured and fails if that service is unavailable.

## What Sanity contributes

Project ID: **204x480o**. Public dataset: **production**. Organization: **o92nj83s9**. Knowledge Base: **kbSZiSrOJAf4**. [Open Context](https://www.sanity.io/@o92nj83s9/context/knowledge-bases/kbSZiSrOJAf4).

- Nine source documents retain official URL, retrieval date, SHA-256 fingerprint, and extracted evidence text.
- Five reviewed policy documents encode exact variant, account type, effective dates, qualification alternatives, spending windows, exceptions, and visit quotas.
- Nine precise Axis directory entries keep airport, terminal, flight section, and original table locator.
- One persisted review decision reconciles HDFC's older annual marketing language with its July 2026 detailed terms.

The deterministic evaluator reads those structured Sanity documents. The evidence agent separately connects to **Sanity Context MCP**, calls `initial_context`, then `knowledge_base_read` using the provided entry outline. It explains the deterministic verdict and cites only allowed source IDs. The server verifies actual completed MCP tool events before returning a model answer; a self-reported retrieval claim is insufficient. Failed context/model calls produce an explicit error, without a fabricated answer or silent fallback. Its isolated CLI session exposes only `initial_context`, `knowledge_base_read`, and `knowledge_base_search`, with the owner's approved read-only access encoded through per-tool `approval_mode`. User config and shell tools are disabled. See the [official configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) for these MCP settings.

With the local server running, `npm run verify:agent` runs four live model/Context scenarios and saves `reports/agent-evaluation.json`. The report checks actual retrieval calls and expected policy statuses; review the saved answers separately for meaning and scope.

## Real-data verification

`reports/evaluation.json` records **38/38** reviewed scenarios against the live Sanity dataset. **45/45** automated tests cover threshold boundaries, quarter and rolling-month dates, variant/account scope, unknown facts, conditional exceptions, quotas, guest entitlement, conflicts, source fingerprints, evidence references, and input validation. These are deterministic policy tests. **4/4 live agent scenarios** verify completed `initial_context` and `knowledge_base_read` calls. Their saved answers were also reviewed for qualification alternatives, source precedence, conditional exceptions, spending dates, quotas, and exact lounge scope. A separate browser run displays the ICICI zero-spend answer. See `VALIDATION.md` for evidence and local credential status.

The source documents are real public bank material retrieved on 3 October 2026. Traveller dates, balances, spending, and usage in the tests and screenshots are **invented examples**. No bank account integration, actual customer records, live bank entitlement checks, or physical lounge admission tests were performed.

## Policy scope

- ICICI Wealth World / Mastercard debit: reviewed individual savings FAQ scope for accounts opened from 1 August 2025; distinct salary and family routes. Spending, qualifying deposits/balance, and relationship are alternatives where the savings FAQ explicitly permits them. Visa Signature remains unreviewed.
- HDFC Regalia Gold: domestic India benefit terms effective 1 July 2026; ₹60,000 preceding-quarter settled non-EMI retail spend; 3 visits/quarter. The last-month issuance exception says “may” and remains subject to bank confirmation.
- Axis Priority debit: September 2026 spend revision; ₹10,000 billed spending in the preceding three full calendar months; current product quota of 2 domestic visits/quarter; precise Table 3 entries at DEL, BLR, BOM. October exclusions are retained.

Exact HDFC and ICICI terminal listings have not been curated in this pilot. Their qualification results therefore retain “exact lounge unverified.” Review horizon is 31 October 2026; later trips require policy refresh. No approval guarantees, invented directory matches, or inferred scope from a similarly named card.

## Problem evidence

September discussions included a [reported ICICI relationship-manager disagreement about spending versus balance](https://www.reddit.com/r/CreditCardsIndia/comments/1wa0y44/icici_wealth_management_rm_misinformation/). That is qualitative motivation, not a prevalence estimate or proof about a specific customer's entitlement. Public bank documents supply the actual rules. Lounge directories already exist; this pilot's focus is dated policy reasoning and source review.

## Source refresh and Studio

Raw evidence is in `data/sources/`, with a byte-level manifest. `scripts/fetch_sources.py` downloads the named official sources (Python 3 plus `pypdf` for PDF extraction). Scanned PDFs require review/OCR; the script never invents missing text. `scripts/curate.py` creates the explicitly reviewed pilot corpus. A refresh does **not** imply new policies are reviewed: inspect source changes, update dated rules and review decisions, run tests, then import/build Context.

```sh
npm run sources
npm run curate
npx sanity login
npx sanity schema deploy
npx sanity exec scripts/import-corpus.ts --with-user-token
npx sanity dev
```

The importer is idempotent (`createOrReplace`). Rebuilding the Knowledge Base is a separate Sanity Context operation. API tokens do not belong in the public dataset or repository.

## Interface and Pip

The redesigned interface uses ink, cobalt and yellow, with an original boarding-pass creature called Pip. Four example trips run a check in one click; the result scrolls into view and offers separate decision, source and live-agent views. Pip reacts to the result and supports keyboard activation. The tour has seven chapter buttons that seek and play the narrated example or Sanity explanation. The footer exposes the tour on mobile. Reduced-motion preferences disable decorative animation.

## Walkthrough video

`videos/loungeproof/` contains the HyperFrames composition, captured real UI assets, locked narration, storyboard, and rendering metadata. Its package pins HyperFrames 0.8.114. Run its render command from that folder after dependencies are available. Narration is local Kokoro; on-screen counts are backed by the saved report. The revised problem-first Pip walkthrough, about 2 minutes 24 seconds, is `videos/loungeproof/loungeproof-walkthrough-v4.mp4`. The in-app tour plays `public/walkthrough.mp4`, included in the source archive. Revision sources are `SCRIPT-v4.md`, `STORYBOARD-v4.md` and `frame.md`; the original walkthrough MP4 is preserved.

## Dependency review

The runtime dependency audit reports zero known advisories. Compatible overrides patch ZIP, FTP, UUID, and esbuild issues in development dependencies. Ten high advisories remain in the Sanity development/CLI chain through the currently published braces package; they are recorded in `reports/dependency-audit.json`. Do not expose the development Studio/server publicly or process untrusted glob patterns with this toolchain. A public deployment needs a separate production server build and hardening review.

Rebuild the source archive with `python3 scripts/package-source.py`. It includes the in-app tour, checks ZIP integrity and excludes local credentials and runtime folders.

Pip speaks only in the video. The website uses a silent interactive trip guide, pointing/focus cues, example trips and animated character joints. Video v3 uses local Kokoro bf_emma narration with a slight pitch lift, speech-amplitude mouth motion, independent blinks, gaze, wings and feet, and different gestures for each scene. Current app captures are in `videos/loungeproof/assets/v3/`. Final HTML fragments are the render source of truth; the migration script is archival.

Video v4 opens with the lounge eligibility problem and the source-backed solution before the demo. Narration averages about 149 words per minute; the opening and guide introduction are about 139. The tour now includes a dedicated problem chapter and seven chapters in total.
