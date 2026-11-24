# Authoring guide for Twenty lessons

This is the guide for writing or editing a lesson in `content/days/dayNN.json`. Days 1 to 3
are the reference examples for tone, length and format. Read them before writing.

## The learner

An AI engineer at a Mumbai firm that does outsourced research, finance support and advisory
work for investment funds, hedge and credit funds, family offices, wealth managers,
corporates and start-ups, mostly outside India. They can build and run AI systems. They know
almost no finance. Assume they have never read a balance sheet.

By Day 30 they should be able to:

1. talk to finance clients in the clients' own language;
2. work out what is worth building for a given client;
3. explain why finance AI fails and how to design against it.

The aim is recognition and reasoning, not memorising accounting standards.

## A lesson: six pages, then a quiz

Total reading across the six pages must be **850 words or fewer** (aim for 650 to 800). The
validator counts every word on the six pages, including table labels and the terms page.

1. **why**: a real situation at a fund, family office or deal team. Two or three sentences
   (enforced).
2. **idea**: the concept in plain English, about 180 to 260 words. At most one engineering
   analogy, and only if it truly clarifies. Bold (`**term**`) each of the day's glossary terms
   at its first use.
3. **example**: a worked example with small round numbers on Brew Lane (see below), shown as a
   statement table. Put `{table}` on its own paragraph where the table should appear, then
   walk through the arithmetic after it.
4. **terms**: three to six terms, one line each, with other names the same thing goes by in
   `aka` (written as they would appear mid-sentence, e.g. `["PAT", "net income"]`). Add
   `formula` when there is one, written with `−`, `×`, `÷`.
5. **builder**: where this concept shows up in data and systems, what breaks, and one check
   worth building. About 100 to 140 words. End with a paragraph that starts
   `**Check worth building:**`.
6. **client**: `say` is one sentence to say. `ask` is the day's question, **copied word for
   word** from the curriculum notes below (the validator checks it).

## The quiz: exactly six authored questions

| Count | type | What it tests |
| --- | --- | --- |
| 2 | `concept` | The idea itself, not just the word |
| 2 | `calc` | A small calculation: numeric entry or multiple choice, unit shown |
| 1 | `client` | A client says X. Which reply or follow-up question is best? |
| 1 | `builder` | A system produced X. What went wrong, or which check would catch it? |

The app appends review questions from earlier days and the speaking prompt, so write only
these six.

Rules for every question:

- `id` is `dNN-<type><n>`, e.g. `d07-calc2`. `concept` is a short label of six words or
  fewer, shown under "Concepts to revisit" if missed.
- `explain` is one or two sentences (enforced). Say why the right answer is right, with the
  arithmetic for calculations. Then say why the most tempting wrong option is wrong, naming it.
- Multiple choice has four options and exactly one correct answer. Use plausible distractors
  built from real misconceptions. Do not use "all of the above".
- The correct option must not stand out. Keep option lengths similar; the validator warns if
  the right answer is the longest in three or more questions. Spread the correct position
  across 0 to 3.
- Calculation questions need a `check`: an expression the validator evaluates to prove the
  answer. Use Brew Lane figure names from `content/brewlane.ts` (e.g.
  `(cfo - capex) / revenue * 100`) or plain numbers for non-Brew Lane examples (e.g.
  `10 / (40 + 10) * 100`). Supported: `+ - * / ^ ( )`, `min`, `max`, `abs`, `round(x, d)`.
- Multiple-choice calculations: options are amounts with units (`"₹13 crore"`, `"23.1%"`,
  `"10.1x"`), in numeric order, all different. Include the number a common slip produces.
- Numeric entry: `answer` as a number, `tolerance` (0 for exact whole numbers, 0.1 for one
  decimal), and `unit` from `"₹ crore"`, `"%"`, `"x"`, `"days"`, `"₹"`, `"₹ per share"`,
  `"years"`, `"₹ lakh"`, `"hours"`. Prefer whole numbers or one decimal.
- Client questions: the best reply usually asks the clarifying question that changes the
  work, or ties the work to the client's decision. Distractors over-promise, refuse, show off
  jargon, or answer the wrong question.
- Builder questions: show a concrete system output or failure, then ask what went wrong or
  which check would catch it. The right answer is a specific, buildable check.

## Say it out loud

`speak.prompt` starts "In 30 seconds, ..." and names a listener (a fund manager, a client, a
new colleague). `speak.modelAnswer` is 60 to 95 words in a natural speaking voice. Brew Lane
figures are welcome.

## Writing rules

- Plain English, short sentences, second person. Define every term the first time it
  appears, inline: "a hedge fund (a fund that can also bet on prices falling)".
- India first (₹, crore, April to March), then the US or global equivalent, because the
  clients are international.
- Use standard textbook definitions. Where practice varies, say so in one line.
- Real institutions and document types may be named (SEBI, RBI, SEC, NSE, BSE, credit rating
  agencies, 10-K). **Never quote real companies' financial figures.**
- This is education, not advice. Do not tell the learner what to invest in.
- British spelling (amortisation, capitalise, organisation). Sentence case everywhere.
- Quotation marks: use single quotes, 'like this', for quoted speech and labels. Write plain
  `'`; the app turns quotes into typographic ones. Never put `"` inside a string.
- No em or en dashes as punctuation; use colons, commas and full stops.
- Only characters the font can draw: no arrows, `≈`, `≤`, `≥`, ticks or emoji. Use `−`
  (minus), `×`, `÷`, `₹`, `%`. The validator rejects anything else.
- Markup: blank line between paragraphs, `- ` at the start of a line for list items,
  `**bold**` for terms. Nothing else.

## Brew Lane Cafés Ltd (fictional): the only company in worked examples

All Brew Lane figures live in `content/brewlane.ts`. Indian fiscal year, April to March. All
figures are ₹ crore unless stated. 1 lakh = 100 thousand, 1 crore = 10 million,
100 crore = 1 billion.

Income statement, FY26 (April 2025 to March 2026):

| Line | ₹ crore |
| --- | --- |
| Revenue | 100 |
| Cost of goods sold | (40) |
| Gross profit | 60 |
| Operating expenses | (40) |
| EBITDA | 20 |
| Depreciation | (5) |
| EBIT | 15 |
| Interest | (3) |
| Profit before tax | 12 |
| Tax at 25% | (3) |
| Profit after tax | 9 |

Balance sheet:

| Line | 31 Mar 2025 | 31 Mar 2026 |
| --- | --- | --- |
| Cash | 6 | 8 |
| Receivables | 3 | 4 |
| Inventory | 5 | 6 |
| Property and equipment, net | 47 | 52 |
| Total assets | 61 | 70 |
| Payables | 4 | 5 |
| Debt (long-term bank loan, non-current) | 31 | 30 |
| Share capital | 10 | 10 |
| Reserves | 16 | 25 |
| Total liabilities and equity | 61 | 70 |

Cash flow, FY26:

- Profit after tax 9, add depreciation 5, receivables up (1), inventory up (1), payables
  up 1: **cash from operations 13**.
- Capital expenditure (10): **cash from investing (10)**.
- Debt repaid (1), no dividend: **cash from financing (1)**.
- Net change 2, opening cash 6, closing cash 8.
- Free cash flow = 13 − 10 = 3.

This is simplified: interest and tax stay inside operating cash flow. Tell the learner real
statements are messier.

History and market data:

- Revenue: FY24 64, FY25 80, FY26 100 (25% growth each year, 25% CAGR).
- Shares outstanding 1 crore; face value ₹10; share price ₹180.

Derived figures, which must match exactly:

- Margins: gross 60%, EBITDA 20%, net 9%.
- Per share and valuation: EPS ₹9, P/E 20x, market cap 180, net debt 22, enterprise
  value 202, EV/EBITDA 10.1x, EV/Sales 2.0x, P/B 5.1x.
- Returns, on closing balances: ROE 25.7%, ROCE 23.1%.
- Leverage and liquidity: net debt/EBITDA 1.1x, interest cover 5.0x, current ratio 3.6x.
- Working capital: receivable days 14.6, inventory days 54.8, payable days 45.6, cash
  conversion cycle 23.7 days.

More derived figures, all computed in `brewlane.ts` (use the names in `check` expressions):

- Equity: 26 at 2025, 35 at 2026. Book value per share ₹35.
- Capital employed 65; invested capital 57 (equity + debt − cash).
- NOPAT 11.25 (EBIT × 0.75); ROIC 19.7%.
- Cost of debt 10% (interest ÷ closing debt); 7.5% after tax.
- Asset turnover 1.43x; equity multiplier 2.0x; debt to equity 0.86x.
- Working capital 10 → 13; trade working capital 4 → 5.
- FCF margin 3%; FCF yield 1.67%; earnings yield 5%.
- CFO ÷ EBITDA 65%.

Rules:

- **Do not invent figures for Brew Lane.** Statement tables may only show Brew Lane's
  figures for FY24 to FY26 (columns labelled `FY26`, or `2025` and `2026` for balance-sheet
  dates). The validator checks every recognised line against these figures and errors on a
  figure that does not exist, such as FY25 EBITDA.
- When an idea needs numbers Brew Lane does not have (quarterly figures, forecasts, a loan's
  covenant level, a discount rate, peers, a fund, a bond), choose one of two routes:
  - state a clearly labelled assumption ("Suppose lenders set a covenant of 3.0x...", "Assume
    a 12% discount rate...") and never present it as a reported figure; or
  - use a separate, clearly hypothetical example ("a fund with ₹100 crore of commitments",
    "a peer café chain") with small round numbers.
- Tables for hypothetical numbers must not use Brew Lane line names with FY24 to FY26 or
  2025/2026 columns. Use headers like `Year 1`, `FY27`, `Fund`, `Peer A`.
- Compute every number with code. Every calculation answer has a `check`; for worked
  examples, check your arithmetic with the `check` names before writing it down.

## Format

- One file per day: `content/days/dayNN.json`, following the `Day` type in
  `src/content/types.ts`.
- Two-space indent. Short arrays and table rows go on one line, as in Days 1 to 3.
- Table `caption` states unit and period: `"₹ crore, year ended 31 March 2026"`,
  `"₹ crore, as at 31 March 2025 and 2026"`, `"₹ crore, Year 1 to Year 5"`, `"Score out of 5"`.
- Row `rule: "subtotal"` draws a single line above the figure; `rule: "total"` draws a line
  above and a double line below. `highlight: true` shades a row being discussed. Negatives
  are written as negative numbers and shown in brackets.

Validate with `npm run validate -- --only=7-11` (your days). Fix every error and warning in
your days.

## Glossary plan

Each term may be defined on exactly one day, across the whole course. Use these names
exactly; `aka` and definitions are yours to write. An `aka` must not equal another day's term
name.

| Day | Terms |
| --- | --- |
| 1 | Revenue, Expenses, Profit, Financial statements, Crore, Buy side |
| 2 | Income statement, Gross profit, EBITDA, EBIT, Profit after tax, Earnings per share |
| 3 | Balance sheet, Equity, Receivables, Inventory, Payables, Debt |
| 4 | Cash flow statement, Cash from operations, Capital expenditure, Free cash flow, Cash from investing, Cash from financing |
| 5 | Accrual accounting, Depreciation, Amortisation, Working capital, Reserves |
| 6 | Annual report, Notes to accounts, Audit, Consolidated statements, Fiscal year, Restatement |
| 7 | Margin, Return on equity, Return on capital employed, Return on invested capital, Asset turnover, DuPont analysis |
| 8 | Current ratio, Net debt, Debt to equity, Net debt to EBITDA, Interest cover, Cash conversion cycle |
| 9 | Year on year, Quarter on quarter, CAGR, Last twelve months, Seasonality, Organic growth |
| 10 | Adjusted earnings, Exceptional item, Capitalisation, Related-party transaction, Contingent liability, Promoter pledge |
| 11 | Unit economics, Operating leverage, Pricing power, Net interest margin, Annual recurring revenue, Same-store sales growth |
| 12 | Time value of money, Compounding, Present value, Discount rate, Net present value, Internal rate of return |
| 13 | Cost of debt, Cost of equity, Risk-free rate, Equity risk premium, Beta, WACC |
| 14 | Market capitalisation, Enterprise value, Diluted shares, Non-controlling interest, Bonus issue |
| 15 | Valuation multiple, Price to earnings, EV/EBITDA, Price to book, Comparable companies, Control premium |
| 16 | Discounted cash flow, Unlevered free cash flow, Forecast period, Terminal value, Exit multiple, Sensitivity table |
| 17 | Financial model, Driver, Scenario, Hard-coded number, Balance check, Circular reference |
| 18 | Initial public offering, Bond, Coupon, Yield, Credit rating, Consensus estimate |
| 19 | Limited partner, General partner, Carried interest, Net asset value, Capital call, TVPI |
| 20 | Long/short, Investment thesis, Guidance, Alpha, Sharpe ratio, Drawdown |
| 21 | Due diligence, Data room, Term sheet, Pre-money valuation, Leveraged buyout, MOIC |
| 22 | Credit spread, Secured debt, Seniority, Covenant, Default, Recovery rate |
| 23 | Family office, Asset allocation, Investment policy statement, Custodian, Time-weighted return, Money-weighted return |
| 24 | Back office, Fund administrator, Reconciliation, Month-end close, Journal entry, Maker-checker |
| 25 | Use case, Workflow, Human in the loop, Straight-through processing, Checkable output |
| 26 | Point-in-time data, Look-ahead bias, Entity resolution, Corporate action, Data vendor |
| 27 | Source citation, Tie-out, Golden set, Field-level accuracy, Audit trail, Review queue |
| 28 | Material non-public information, Insider trading, Information barrier, Non-disclosure agreement, Know your customer, Data residency |
| 29 | Discovery, Pilot, Success metric, Statement of work, Build versus buy |
| 30 | Solution brief, Business case, Rollout |

Concepts not in this table (for example management fee, hurdle rate, DPI, receivable days,
standalone statements) are still defined inline where they first appear.

## Curriculum notes

For each day: what the lesson covers, the builder's lens (*Builder*), and the client
question (*Ask*). Write the full lesson and quiz from these notes.

### Phase 1: Read a business (Days 1 to 6)

**Day 4. The cash flow statement.** Operating, investing, financing. Starting from profit and adjusting to cash. Capital expenditure. Free cash flow. Why profitable companies run out of cash. *Builder:* closing cash must equal balance sheet cash, a second free check. Free cash flow has several definitions, so keep the definition with the value. *Ask:* "Which free cash flow definition does your team use?"

**Day 5. How the three statements connect.** Accrual versus cash. Depreciation. Working capital. Trace three events through all three statements: a sale on credit, buying an oven, repaying a loan. *Builder:* the links form a constraint system, which is the basis of automated model checking. One wrong number makes something else stop tying. *Ask:* "When a model does not balance, how long does it take your team to find the error?"

**Day 6. Filings, periods and units.** Annual report, quarterly results, notes to accounts, management commentary, investor presentation, earnings call transcript. Audited versus unaudited. Ind AS, IFRS, US GAAP by name only. US 10-K and 10-Q, Indian exchange filings. Fiscal versus calendar year, quarter naming. Lakh, crore, million, billion. Consolidated versus standalone. Restated figures. *Builder:* most wrong numbers from AI are unit, period or entity mismatches, not reading errors. Every stored figure needs value, scale, currency, period, period type, entity scope, source document and page. *Ask:* "Where do your analysts lose the most time: finding the document, pulling the numbers, or checking them?"

### Phase 2: Judge a business (Days 7 to 11)

**Day 7. Profitability and returns.** Margins, ROE, ROCE, ROIC. DuPont in words: margin, asset turnover, leverage. Why return on capital matters more than size. *Builder:* definitions differ by firm (average or closing balances, before or after tax), so build a per-client definitions registry rather than hard-coding. *Ask:* "Is there a house definition sheet for ratios, or does each analyst calculate their own way?"

**Day 8. Liquidity, leverage and efficiency.** Current ratio, net debt, debt to equity, net debt to EBITDA, interest cover, receivable, inventory and payable days, cash conversion cycle. *Builder:* these mix balance sheet dates with income statement periods, so period alignment matters. Zero or negative denominators should return "not meaningful", never a number. *Ask:* "Which two or three ratios would make you reject a company immediately?"

**Day 9. Growth and comparability.** Year on year, quarter on quarter, CAGR. Last twelve months. Seasonality. Organic versus acquired growth. Aligning companies with different year ends. *Builder:* last twelve months = latest full year + current year to date − prior year to date, a classic calculation to automate. *Ask:* "When you compare companies with different year ends, do you align them to a calendar year?"

**Day 10. Quality of earnings and red flags.** Reported versus adjusted. One-off items. Aggressive revenue recognition. Capitalised costs. Profit rising while operating cash falls. Receivables growing faster than sales. Auditor qualifications, related-party transactions, contingent liabilities, pledged promoter shares. *Builder:* a strong use case because the evidence sits in notes and text. Output must be a flag with a quoted source and page, never a verdict. *Ask:* "Which red flags do you check on every company, and is that checklist written down?"

**Day 11. Business quality and sector language.** Unit economics. Fixed and variable costs, operating leverage. Pricing power. Each sector has its own metrics: lenders (net interest margin, bad loans, capital adequacy), software (ARR, net revenue retention, churn, CAC, LTV), retail (same-store sales growth), manufacturing (capacity utilisation), real estate (pre-sales, collections). Recognise them, do not master them. *Builder:* one generic template fails across sectors (a bank has no EBITDA), so schemas and metric dictionaries must be sector-aware. *Ask:* "Which sectors do you cover, and which ones do your templates fit badly?"

### Phase 3: Value a business (Days 12 to 17)

**Day 12. Time value of money.** Compounding and discounting. Present value, NPV, IRR. The discount rate as a required return. *Builder:* NPV and IRR must be computed in code or spreadsheet functions, never written by a language model. Irregular dates need date-aware functions. *Ask:* "What return hurdle do you underwrite to?"

**Day 13. Risk, return and cost of capital.** Debt versus equity: who is paid first, who keeps the upside. Cost of debt, cost of equity, risk-free rate, risk premium, beta, WACC, all in words. Higher risk means a higher discount rate and a lower value. *Builder:* these inputs are judgement calls from outside the filing. Surface each input with its source and let a human override it. *Ask:* "Where do your discount rate inputs come from, and who approves them?"

**Day 14. Enterprise value and equity value.** Market cap. Enterprise value = market cap + debt − cash. Which metric pairs with which: enterprise value with revenue and EBITDA, equity value with profit and book value. Basic versus diluted shares by name. *Builder:* enterprise value joins a live price to a dated balance sheet, so record both timestamps. Share count errors after splits and bonus issues are a leading cause of wrong market caps. *Ask:* "What goes into your net debt: leases, pensions, minority interests?"

**Day 15. Multiples and comparable companies.** P/E, EV/EBITDA, EV/Sales, P/B. Trailing versus forward. Choosing peers. Mean versus median and outliers. Past transactions and the control premium, briefly. *Builder:* comps are highly automatable (data pull plus standard maths), but peer choice is judgement. Build human-approved peer sets with automatic refresh. *Ask:* "How long does it take to refresh a comp set today, and how often do you do it?"

**Day 16. Discounted cash flow.** Forecast free cash flows, terminal value by growth rate or exit multiple, discount, sum to enterprise value, bridge to value per share. Sensitivity tables. Why the terminal value dominates. *Builder:* a DCF is a deterministic calculation over assumptions. The model proposes and documents assumptions with sources. The arithmetic lives in live spreadsheet formulas the client can audit. *Ask:* "When you receive a model, do you need live formulas, or are pasted values enough?"

**Day 17. Anatomy of a financial model.** Inputs, calculations, outputs. Historical versus projected. Drivers. Bull, base and bear scenarios. Balance and cash checks. Conventions: blue inputs, black formulas, one formula per row, no typed numbers inside formulas. *Builder:* model building and model auditing agents. Typed numbers in formulas, broken links, inconsistent rows and failed checks are all rule-based and detectable. *Ask:* "Do you have a standard model template, and what error do reviewers catch most often?"

### Phase 4: Know the clients (Days 18 to 24)

**Day 18. Capital markets.** Primary versus secondary. Shares versus bonds. IPO. Coupon, yield, maturity, and why price falls when yield rises. Credit ratings. Indices and benchmarks. Prices move on surprise versus expectation: consensus, beat, miss, guidance. *Builder:* market data is licensed, and terms may restrict feeding it to AI systems. Corporate actions break naive price histories. *Ask:* "Which data vendors are you licensed for, and do the terms allow that data to go into an AI system?"

**Day 19. How investment funds work.** Investors (LPs) and managers (GPs). Management fee and performance fee, "2 and 20", hurdle rate. AUM and NAV. Open-ended versus closed-ended. Fund types: long-only, hedge, private equity, venture, private credit, fund of funds. Committed versus called capital, capital calls, distributions. IRR, MOIC, DPI, TVPI. *Builder:* fee and profit-share rules live as prose in fund documents. Extracting and encoding them is a real use case, and an error pays the wrong party, so it needs human sign-off. *Ask:* "How are fees and carry calculated today: a spreadsheet, a system, or the administrator?"

**Day 20. Public-markets investing and research.** Long-only versus long/short. The investment thesis. Idea, research, model, position, monitor. Results season: results, call transcript, guidance, estimate changes. How a research note is structured, including bull, base and bear cases. Alpha, beta, volatility, Sharpe ratio, drawdown. *Builder:* results-day tools: results versus estimates, management quotes with exact source, guidance changes across quarters. Speed matters, and a misquote is worse than no quote. *Ask:* "On results day, what do you need in the first thirty minutes?"

**Day 21. Private deals: private equity, venture and M&A.** The funnel: sourcing, screening, information memorandum, NDA, data room, due diligence, investment committee memo, term sheet, close, monitoring, exit. A leveraged buyout in plain words. Pre-money, post-money, dilution (invest 10 at 40 pre-money, own 20%). Strategic versus financial buyers. *Builder:* data room question answering and deal screening. Thousands of pages under NDA, so page-level citations, per-deal access control and strict isolation between deals. *Ask:* "How many deals do you review for each one you close, and where in the funnel does the time go?"

**Day 22. Credit and lending.** The lender's mindset: will I be repaid. Principal, interest, spread. Secured versus unsecured, senior versus subordinated. Covenants. Default and recovery. Private credit funds. *Builder:* covenant monitoring. Definitions are bespoke to each loan agreement ("EBITDA as defined"), so standard formulas are wrong by default. Extract the definition, then compute. *Ask:* "How do you track covenant compliance across the portfolio today?"

**Day 23. Family offices and wealth managers.** Single and multi-family offices. Asset allocation across asset classes. Investment policy. Custodians. Consolidated reporting. Time-weighted versus money-weighted return. Liquidity planning. *Builder:* the classic pain is statements from many custodians and managers in different PDF layouts feeding one consolidated view. Extraction, classification and reconciliation, with extreme privacy sensitivity. *Ask:* "How many custodians and managers send you statements, and how long does the quarterly consolidated report take?"

**Day 24. Fund operations and the finance back office.** Front, middle and back office. Fund accounting and NAV. Trade, position and cash reconciliation. Capital call and distribution notices. Investor reporting. Administrator, custodian, auditor. On the corporate side: journal entries, month-end close, accruals, budget versus actual. Maker and checker. *Builder:* high-volume, rule-based and checkable work, so the best return on automation. Match automatically, route exceptions to people, log everything. *Ask:* "How many reconciliation breaks do you see each month, and how long does each take to clear?"

### Phase 5: Build and sell AI for finance (Days 25 to 30)

**Day 25. The use-case map.** A catalogue by client type: document extraction, research drafting, comps and screening, model building and audit, data room Q&A, portfolio monitoring, covenant tracking, reconciliation, consolidated reporting, investor report drafts, deck and number checking. Score each on value (hours × frequency × seniority), feasibility (is the data reachable, is the output checkable) and risk (cost of a wrong answer). Start where output is checkable. *Ask:* "If I gave your team back ten hours a week, which task would you choose?"

**Day 26. Finance data and its traps.** Sources: regulatory filings, company PDFs and scans, licensed vendor databases, client spreadsheets, ledger exports, administrator reports. Traps: multi-page tables, footnotes, scale and currency, period mismatch, restatements, standalone versus consolidated, reported versus adjusted, data as known then versus now (look-ahead bias), entity matching across tickers and name changes, brackets for negatives, dash versus zero versus missing. *Ask:* "Can you show me the ugliest document your team has to deal with?"

**Day 27. Building for trust.** Why finance tolerates almost no numeric error. Eight principles: every number links to its source page; models read and reason while code calculates; tie-out checks (balance sheet balances, cash ties, parts sum to totals); "not found" beats a guess; human review queue for exceptions; audit log; a golden test set built from the client's past work with field-level accuracy; output in the client's own format (Excel with live formulas, their Word and PowerPoint templates). *Ask:* "What does your reviewer check before work goes out? Let's turn that checklist into automated tests."

**Day 28. Regulation, confidentiality and risk.** Material non-public information and insider trading. Information barriers. NDAs. Personal and KYC data. Data residency for cross-border clients. Regulators by name and role only (SEBI, RBI, SEC, FCA). Information versus investment advice. Where client data goes: provider terms, retention, training use, isolation between clients. Concepts only: state no rule numbers or penalties, and end by telling the learner to confirm specifics with compliance or legal. *Builder:* the security review decides more deals than the demo. *Ask:* "Who has to approve a new tool that touches client data, and what do they ask for?"

**Day 29. Discovery, scoping and closing.** Discovery questions: workflow, volume, time per unit, reviewer, cost of an error, where data lives, who approves. Turning answers into value: hours saved, turnaround, capacity, error rate. Scoping a pilot: one workflow, one team, four to six weeks, a golden set, one agreed success metric, a written out-of-scope list. Pricing shapes. Objections: accuracy, security, "we tried a chatbot", job fears, "our work is too bespoke", build versus buy. Demo on their document and show a check catching an error. *Ask:* "What would have to be true after a six-week pilot for you to roll this out?"

**Day 30. Capstone.** Three mock clients: a long/short hedge fund research team, a multi-family office, a private credit fund. The learner picks one and fills in a one-page solution brief in the app (saved locally): workflow, pain in numbers, data sources, design (extract, calculate, check, review, output), three automated checks, success metric, pilot plan, two risks. Then reveal a model brief to compare. Finish with a 20-question final test drawn from all days and a list of every term learned.

## Day 30: the capstone file

Day 30 has the normal six pages, six authored questions and a speaking prompt. Its questions
join the pool for the final test. It also has a `capstone` block that only Day 30 may have:

```json
"capstone": {
  "clients": [
    {
      "id": "hedge-fund",
      "name": "Fictional firm name, and what it is",
      "situation": "60 to 120 words: who they are, the workflow, the pain in numbers, the data, constraints.",
      "model": {
        "workflow": "...", "pain": "...", "data": "...", "design": "...",
        "checks": "...", "metric": "...", "pilot": "...", "risks": "..."
      }
    }
  ]
}
```

- Exactly three clients, with ids `hedge-fund`, `family-office` and `private-credit`, in
  that order.
- Use clearly fictional names, never real firms.
- Each `model` field is 20 to 80 words and is a strong answer to that brief section:
  - `design` walks through extract, calculate, check, review, output;
  - `checks` gives exactly three automated checks;
  - `metric` gives one number with a target;
  - `pilot` gives one workflow, one team, four to six weeks, a golden set and what is out
    of scope;
  - `risks` gives exactly two risks, each with how to contain it.
- The worked example on the pages should use a different, small fictional example (for
  instance a value calculation), not one of the three clients.
- Day 30 has no ask in the brief, so write one in the same spirit.

The app handles picking a client, the form, the reveal, the 20-question final test and the
list of every term.
