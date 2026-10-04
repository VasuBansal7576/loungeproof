*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16).*

## What I built

Your card advertises complimentary lounge access. That still leaves a few questions. Did you meet the spending requirement in the right period? Have you used this quarter's visits? Does the rule apply to your exact card and terminal? And which bank page should you trust when two pages disagree?

LoungeProof checks those conditions before you join the queue. It is a small India pilot covering HDFC Regalia Gold, ICICI Wealth World debit and Axis Priority debit. You choose your exact card and trip details, get a dated eligibility check, and see the original bank evidence behind each condition.

I started with recent cardholder discussions, including [an ICICI spending-versus-balance disagreement](https://www.reddit.com/r/CreditCardsIndia/comments/1wa0y44/icici_wealth_management_rm_misinformation/). That discussion motivated the problem. The rules themselves come from official bank documents.

Pip, an original boarding-pass creature, guides the examples. The website uses silent interactions and motion; Pip narrates the walkthrough below.

## Demo

{% youtube MUojVsBu7jo %}

[Watch on YouTube](https://www.youtube.com/watch?v=MUojVsBu7jo)

The walkthrough starts with the problem, then shows three trips and the Sanity Context agent. The source includes the same 1080p video and an in-app player with seven selectable chapters.

There is no public server deployment. Run the project locally with `npm ci`, copy `.env.example` to `.env`, then run `npm run dev`. The structured policy checks read the public Sanity dataset without a token. Live agent explanations additionally need your own Context Viewer token and a signed-in Codex CLI. Full instructions are in the README. No banking login or card number is needed.

## Code

[Source code, setup and verification reports](https://github.com/VasuBansal7576/loungeproof)

The React interface and Express server share a deterministic policy evaluator. TypeScript schemas define sources, dated policies, precise lounge records and review decisions. Codex helped research, implement, test and revise the project. The narrated video uses HyperFrames, local Kokoro speech and original Pip artwork.

## How I used Sanity

The public Content Lake stores nine official bank source documents, five reviewed policy rules, nine precise lounge records and a persisted source-precedence decision. Each source keeps its URL, retrieval date and fingerprint. Policies record effective dates, exact variants, account scope, qualifying alternatives, spending windows and visit quotas.

Sanity Context built a Knowledge Base from the curated pilot content. A dedicated MCP endpoint exposes it to the evidence agent. The agent calls `initial_context`, reads the relevant entry outline, then calls `knowledge_base_read`. It uses the retrieved rules and citations to explain the evaluator's result. The server checks that both MCP reads actually completed before accepting an answer. Failed retrieval produces an explicit error.

Three details made structured content useful:

- **ICICI alternatives.** In the reviewed individual-savings scope, qualifying balance and spending are alternatives. Zero spending does not automatically mean failure. Similarly named, unreviewed card variants stay unknown.
- **HDFC conflicting pages.** Older annual marketing language and newer July 2026 detailed terms are both retained. A review decision gives the dated detailed terms precedence for the applicable trip.
- **Axis dates and location.** The evaluator calculates the preceding three full calendar months, checks the spend and quarterly visits, and matches the exact airport, terminal and flight section against reviewed directory rows.

The agent does not turn a benefit check into a promise of admission. Unverified terminal entries and conditional exceptions remain visible.

## Sanity project details

- Project ID: `204x480o`
- Public dataset: `production`
- Knowledge Base: `kbSZiSrOJAf4`
- Context endpoint: `loungeproof-evidence`
- [Schemas](https://github.com/VasuBansal7576/loungeproof/blob/main/sanity.config.ts) and [curated corpus](https://github.com/VasuBansal7576/loungeproof/blob/main/data/corpus.json)

## Testing and limits

The saved reports record 45 passing automated tests, 38 passing policy scenarios against the live Sanity dataset, and four live agent scenarios with completed Context reads. The model answers were also reviewed against the rules. Desktop and mobile checks cover the example flows, evidence views and chaptered tour.

Bank documents are real. Traveller spending, balances, dates and usage are invented examples. I did not connect bank accounts or test physical lounge admission. Exact HDFC and ICICI terminal entries remain unverified. The pilot's reviewed policy horizon ends on 31 October 2026; later trips need a refresh.

These limits are part of the answer users see. A useful guide should tell you what still needs checking.
