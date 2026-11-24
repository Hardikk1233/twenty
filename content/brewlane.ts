// Brew Lane Cafés Ltd (fictional): the single source of truth for every figure in the course.
// Base figures are copied from the build brief (section 7). Everything else is computed here,
// in code, and the validator checks the results against the values the brief publishes.
// All amounts are ₹ crore unless noted. Costs and outflows are stored as positive magnitudes.

export const base = {
  // Income statement, FY26 (April 2025 to March 2026)
  revenue: 100,
  cogs: 40,
  grossProfit: 60,
  opex: 40,
  ebitda: 20,
  depreciation: 5,
  ebit: 15,
  interest: 3,
  pbt: 12,
  taxRate: 0.25,
  tax: 3,
  pat: 9,

  // Revenue history
  revenueFY24: 64,
  revenueFY25: 80,

  // Balance sheet at 31 March 2025 (...25) and 31 March 2026 (...26)
  cash25: 6,
  cash26: 8,
  receivables25: 3,
  receivables26: 4,
  inventory25: 5,
  inventory26: 6,
  ppe25: 47,
  ppe26: 52,
  totalAssets25: 61,
  totalAssets26: 70,
  payables25: 4,
  payables26: 5,
  debt25: 31,
  debt26: 30,
  shareCapital25: 10,
  shareCapital26: 10,
  reserves25: 16,
  reserves26: 25,
  totalLE25: 61,
  totalLE26: 70,

  // Cash flow, FY26 (simplified: interest and tax stay inside operating cash flow)
  receivablesIncrease: 1,
  inventoryIncrease: 1,
  payablesIncrease: 1,
  cfo: 13,
  capex: 10,
  cfi: -10,
  debtRepaid: 1,
  dividends: 0,
  cff: -1,
  netCashChange: 2,
  openingCash: 6,
  closingCash: 8,
  fcf: 3,

  // Market data
  shares: 1, // crore shares
  faceValue: 10, // ₹ per share
  price: 180, // ₹ per share
} as const;

const b = base;
const equity25 = b.shareCapital25 + b.reserves25;
const equity26 = b.shareCapital26 + b.reserves26;
const marketCap = b.price * b.shares;
const ev = marketCap + b.debt26 - b.cash26;
const eps = b.pat / b.shares;
const receivableDays = (b.receivables26 * 365) / b.revenue;
const inventoryDays = (b.inventory26 * 365) / b.cogs;
const payableDays = (b.payables26 * 365) / b.cogs;

export const derived = {
  totalExpenses: b.cogs + b.opex + b.depreciation + b.interest + b.tax,
  grossMarginPct: (b.grossProfit / b.revenue) * 100,
  ebitdaMarginPct: (b.ebitda / b.revenue) * 100,
  ebitMarginPct: (b.ebit / b.revenue) * 100,
  netMarginPct: (b.pat / b.revenue) * 100,
  eps,
  pe: b.price / eps,
  marketCap,
  equity25,
  equity26,
  bookValuePerShare: equity26 / b.shares,
  currentAssets25: b.cash25 + b.receivables25 + b.inventory25,
  currentAssets26: b.cash26 + b.receivables26 + b.inventory26,
  currentLiabilities25: b.payables25,
  currentLiabilities26: b.payables26,
  totalLiabilities25: b.payables25 + b.debt25,
  totalLiabilities26: b.payables26 + b.debt26,
  netDebt25: b.debt25 - b.cash25,
  netDebt26: b.debt26 - b.cash26,
  ev,
  evEbitda: ev / b.ebitda,
  evSales: ev / b.revenue,
  pb: b.price / (equity26 / b.shares),
  roePct: (b.pat / equity26) * 100,
  capitalEmployed26: equity26 + b.debt26,
  rocePct: (b.ebit / (equity26 + b.debt26)) * 100,
  netDebtToEbitda: (b.debt26 - b.cash26) / b.ebitda,
  interestCover: b.ebit / b.interest,
  currentRatio: (b.cash26 + b.receivables26 + b.inventory26) / b.payables26,
  debtToEquity: b.debt26 / equity26,
  assetTurnover: b.revenue / b.totalAssets26,
  equityMultiplier: b.totalAssets26 / equity26,
  receivableDays,
  inventoryDays,
  payableDays,
  ccc: receivableDays + inventoryDays - payableDays,
  revenueGrowthFY25Pct: (b.revenueFY25 / b.revenueFY24 - 1) * 100,
  revenueGrowthFY26Pct: (b.revenue / b.revenueFY25 - 1) * 100,
  revenueCagrPct: ((b.revenue / b.revenueFY24) ** (1 / 2) - 1) * 100,

  // Further figures for later lessons, all derived from section 7.
  nopat: b.ebit * (1 - b.taxRate), // 11.25: EBIT after tax
  investedCapital26: equity26 + b.debt26 - b.cash26, // 57: equity + debt - cash
  roicPct: ((b.ebit * (1 - b.taxRate)) / (equity26 + b.debt26 - b.cash26)) * 100, // 19.7
  costOfDebtPct: (b.interest / b.debt26) * 100, // 10: interest / closing debt
  afterTaxCostOfDebtPct: (b.interest / b.debt26) * (1 - b.taxRate) * 100, // 7.5
  workingCapital25: b.cash25 + b.receivables25 + b.inventory25 - b.payables25, // 10
  workingCapital26: b.cash26 + b.receivables26 + b.inventory26 - b.payables26, // 13
  tradeWorkingCapital25: b.receivables25 + b.inventory25 - b.payables25, // 4
  tradeWorkingCapital26: b.receivables26 + b.inventory26 - b.payables26, // 5
  fcfMarginPct: (b.fcf / b.revenue) * 100, // 3
  fcfYieldPct: (b.fcf / marketCap) * 100, // 1.67
  earningsYieldPct: (eps / b.price) * 100, // 5
  cashConversionPct: (b.cfo / b.ebitda) * 100, // 65: operating cash flow / EBITDA
  ebitdaToCashGap: b.ebitda - b.cfo, // 7
  profitToCashGap: b.pat - b.netCashChange, // 7
};

/** Every named figure, for use in quiz `check` expressions. */
export const figures: Record<string, number> = { ...base, ...derived };

/** Values the brief publishes, with the decimals it shows. Derived figures must round to these. */
export const published: [name: string, value: number, decimals: number][] = [
  ['grossMarginPct', 60, 0],
  ['ebitdaMarginPct', 20, 0],
  ['netMarginPct', 9, 0],
  ['eps', 9, 0],
  ['pe', 20, 0],
  ['marketCap', 180, 0],
  ['netDebt26', 22, 0],
  ['ev', 202, 0],
  ['evEbitda', 10.1, 1],
  ['evSales', 2.0, 1],
  ['pb', 5.1, 1],
  ['roePct', 25.7, 1],
  ['rocePct', 23.1, 1],
  ['netDebtToEbitda', 1.1, 1],
  ['interestCover', 5.0, 1],
  ['currentRatio', 3.6, 1],
  ['receivableDays', 14.6, 1],
  ['inventoryDays', 54.8, 1],
  ['payableDays', 45.6, 1],
  ['ccc', 23.7, 1],
  ['revenueGrowthFY25Pct', 25, 0],
  ['revenueGrowthFY26Pct', 25, 0],
  ['revenueCagrPct', 25, 0],
  ['fcf', 3, 0],
];

/** Accounting identities the base figures must satisfy, so the three statements tie out. */
export const identities: [description: string, left: number, right: number][] = [
  ['Gross profit = revenue - cost of goods sold', b.grossProfit, b.revenue - b.cogs],
  ['EBITDA = gross profit - operating expenses', b.ebitda, b.grossProfit - b.opex],
  ['EBIT = EBITDA - depreciation', b.ebit, b.ebitda - b.depreciation],
  ['Profit before tax = EBIT - interest', b.pbt, b.ebit - b.interest],
  ['Tax = 25% of profit before tax', b.tax, b.pbt * b.taxRate],
  ['Profit after tax = profit before tax - tax', b.pat, b.pbt - b.tax],
  ['Total assets 2025 = sum of assets', b.totalAssets25, b.cash25 + b.receivables25 + b.inventory25 + b.ppe25],
  ['Total assets 2026 = sum of assets', b.totalAssets26, b.cash26 + b.receivables26 + b.inventory26 + b.ppe26],
  ['Liabilities and equity 2025 = sum of lines', b.totalLE25, b.payables25 + b.debt25 + b.shareCapital25 + b.reserves25],
  ['Liabilities and equity 2026 = sum of lines', b.totalLE26, b.payables26 + b.debt26 + b.shareCapital26 + b.reserves26],
  ['Balance sheet balances, 2025', b.totalAssets25, b.totalLE25],
  ['Balance sheet balances, 2026', b.totalAssets26, b.totalLE26],
  ['Receivables increase = change on balance sheet', b.receivablesIncrease, b.receivables26 - b.receivables25],
  ['Inventory increase = change on balance sheet', b.inventoryIncrease, b.inventory26 - b.inventory25],
  ['Payables increase = change on balance sheet', b.payablesIncrease, b.payables26 - b.payables25],
  ['Cash from operations', b.cfo, b.pat + b.depreciation - b.receivablesIncrease - b.inventoryIncrease + b.payablesIncrease],
  ['Cash from investing = -capex', b.cfi, -b.capex],
  ['Cash from financing = -debt repaid - dividends', b.cff, -b.debtRepaid - b.dividends],
  ['Net change in cash = CFO + CFI + CFF', b.netCashChange, b.cfo + b.cfi + b.cff],
  ['Opening cash = 2025 balance sheet cash', b.openingCash, b.cash25],
  ['Closing cash = opening cash + net change', b.closingCash, b.openingCash + b.netCashChange],
  ['Closing cash = 2026 balance sheet cash', b.closingCash, b.cash26],
  ['Free cash flow = CFO - capex', b.fcf, b.cfo - b.capex],
  ['Reserves roll forward: 2025 + profit - dividends', b.reserves26, b.reserves25 + b.pat - b.dividends],
  ['Debt roll forward: 2025 - repaid', b.debt26, b.debt25 - b.debtRepaid],
  ['Property and equipment roll forward: 2025 + capex - depreciation', b.ppe26, b.ppe25 + b.capex - b.depreciation],
  ['Revenue grew 25% in FY25', b.revenueFY25, b.revenueFY24 * 1.25],
  ['Revenue grew 25% in FY26', b.revenue, b.revenueFY25 * 1.25],
];

export type Period = '24' | '25' | '26';

/**
 * Statement-table labels the validator recognises, with the canonical value for each period.
 * '26' means FY26 for income statement and cash flow lines, and 31 March 2026 for balance sheet
 * lines (likewise '25', '24'). Tables are compared on magnitude, so (40) and 40 both match 40.
 */
export const lineItems: { labels: string[]; values: Partial<Record<Period, number>> }[] = [
  { labels: ['revenue', 'revenue from operations', 'sales'], values: { '24': b.revenueFY24, '25': b.revenueFY25, '26': b.revenue } },
  { labels: ['cost of goods sold', 'cost of sales'], values: { '26': b.cogs } },
  { labels: ['gross profit'], values: { '26': b.grossProfit } },
  { labels: ['operating expenses'], values: { '26': b.opex } },
  { labels: ['ebitda'], values: { '26': b.ebitda } },
  { labels: ['depreciation', 'add depreciation', 'add back depreciation'], values: { '26': b.depreciation } },
  { labels: ['ebit', 'operating profit'], values: { '26': b.ebit } },
  { labels: ['interest', 'interest expense', 'finance costs'], values: { '26': b.interest } },
  { labels: ['profit before tax'], values: { '26': b.pbt } },
  { labels: ['tax', 'tax at 25%'], values: { '26': b.tax } },
  { labels: ['profit after tax', 'net profit'], values: { '26': b.pat } },
  { labels: ['expenses including interest and tax', 'total expenses'], values: { '26': derived.totalExpenses } },
  { labels: ['gross margin %', 'gross margin'], values: { '26': derived.grossMarginPct } },
  { labels: ['ebitda margin %', 'ebitda margin'], values: { '26': derived.ebitdaMarginPct } },
  { labels: ['ebit margin %', 'ebit margin'], values: { '26': derived.ebitMarginPct } },
  { labels: ['net margin %', 'net margin'], values: { '26': derived.netMarginPct } },
  { labels: ['eps', 'eps ₹', 'earnings per share', 'earnings per share ₹'], values: { '26': derived.eps } },

  { labels: ['cash'], values: { '25': b.cash25, '26': b.cash26 } },
  { labels: ['receivables', 'trade receivables'], values: { '25': b.receivables25, '26': b.receivables26 } },
  { labels: ['inventory', 'inventories'], values: { '25': b.inventory25, '26': b.inventory26 } },
  { labels: ['current assets'], values: { '25': derived.currentAssets25, '26': derived.currentAssets26 } },
  { labels: ['property and equipment net', 'property and equipment'], values: { '25': b.ppe25, '26': b.ppe26 } },
  { labels: ['total assets'], values: { '25': b.totalAssets25, '26': b.totalAssets26 } },
  { labels: ['payables', 'trade payables'], values: { '25': b.payables25, '26': b.payables26 } },
  { labels: ['debt', 'borrowings'], values: { '25': b.debt25, '26': b.debt26 } },
  { labels: ['total liabilities'], values: { '25': derived.totalLiabilities25, '26': derived.totalLiabilities26 } },
  { labels: ['share capital'], values: { '25': b.shareCapital25, '26': b.shareCapital26 } },
  { labels: ['reserves'], values: { '25': b.reserves25, '26': b.reserves26 } },
  { labels: ['total equity', 'equity'], values: { '25': derived.equity25, '26': derived.equity26 } },
  { labels: ['total liabilities and equity'], values: { '25': b.totalLE25, '26': b.totalLE26 } },
  { labels: ['net debt'], values: { '25': derived.netDebt25, '26': derived.netDebt26 } },

  { labels: ['receivables up', 'increase in receivables'], values: { '26': b.receivablesIncrease } },
  { labels: ['inventory up', 'increase in inventory'], values: { '26': b.inventoryIncrease } },
  { labels: ['payables up', 'increase in payables'], values: { '26': b.payablesIncrease } },
  { labels: ['cash from operations', 'cash from operating activities', 'operating cash flow'], values: { '26': b.cfo } },
  { labels: ['capital expenditure', 'capex'], values: { '26': b.capex } },
  { labels: ['cash from investing', 'cash from investing activities'], values: { '26': b.cfi } },
  { labels: ['debt repaid'], values: { '26': b.debtRepaid } },
  { labels: ['dividends', 'dividend paid', 'dividends paid'], values: { '26': b.dividends } },
  { labels: ['cash from financing', 'cash from financing activities'], values: { '26': b.cff } },
  { labels: ['net change in cash'], values: { '26': b.netCashChange } },
  { labels: ['opening cash'], values: { '26': b.openingCash } },
  { labels: ['closing cash'], values: { '26': b.closingCash } },
  // Roll-forwards within FY26: opening is the 31 March 2025 balance, closing the 2026 one.
  { labels: ['opening reserves'], values: { '26': b.reserves25 } },
  { labels: ['closing reserves'], values: { '26': b.reserves26 } },
  { labels: ['opening property and equipment', 'opening property and equipment net'], values: { '26': b.ppe25 } },
  { labels: ['closing property and equipment', 'closing property and equipment net'], values: { '26': b.ppe26 } },
  { labels: ['opening debt'], values: { '26': b.debt25 } },
  { labels: ['closing debt'], values: { '26': b.debt26 } },
  { labels: ['free cash flow'], values: { '26': b.fcf } },

  // Ratio and market rows. Market data is as at the FY26 results, so it sits in the '26' column.
  { labels: ['working capital'], values: { '25': derived.workingCapital25, '26': derived.workingCapital26 } },
  { labels: ['trade working capital'], values: { '25': derived.tradeWorkingCapital25, '26': derived.tradeWorkingCapital26 } },
  { labels: ['capital employed'], values: { '26': derived.capitalEmployed26 } },
  { labels: ['invested capital'], values: { '26': derived.investedCapital26 } },
  { labels: ['nopat', 'ebit after tax'], values: { '26': derived.nopat } },
  { labels: ['revenue growth', 'revenue growth %'], values: { '25': derived.revenueGrowthFY25Pct, '26': derived.revenueGrowthFY26Pct } },
  { labels: ['roe', 'roe %', 'return on equity', 'return on equity %'], values: { '26': derived.roePct } },
  { labels: ['roce', 'roce %', 'return on capital employed', 'return on capital employed %'], values: { '26': derived.rocePct } },
  { labels: ['roic', 'roic %', 'return on invested capital', 'return on invested capital %'], values: { '26': derived.roicPct } },
  { labels: ['asset turnover', 'asset turnover x'], values: { '26': derived.assetTurnover } },
  { labels: ['equity multiplier', 'equity multiplier x'], values: { '26': derived.equityMultiplier } },
  { labels: ['current ratio', 'current ratio x'], values: { '26': derived.currentRatio } },
  { labels: ['debt to equity', 'debt to equity x'], values: { '26': derived.debtToEquity } },
  { labels: ['net debt to ebitda', 'net debt ebitda', 'net debt to ebitda x', 'net debt ebitda x'], values: { '26': derived.netDebtToEbitda } },
  { labels: ['interest cover', 'interest cover x'], values: { '26': derived.interestCover } },
  { labels: ['receivable days'], values: { '26': derived.receivableDays } },
  { labels: ['inventory days'], values: { '26': derived.inventoryDays } },
  { labels: ['payable days'], values: { '26': derived.payableDays } },
  { labels: ['cash conversion cycle', 'cash conversion cycle days'], values: { '26': derived.ccc } },
  { labels: ['shares outstanding', 'shares outstanding crore', 'shares crore'], values: { '26': b.shares } },
  { labels: ['share price', 'share price ₹'], values: { '26': b.price } },
  { labels: ['market capitalisation', 'market cap', 'equity value'], values: { '26': derived.marketCap } },
  { labels: ['enterprise value', 'ev'], values: { '26': derived.ev } },
  { labels: ['p e', 'p e x', 'pe', 'price to earnings', 'price to earnings x'], values: { '26': derived.pe } },
  { labels: ['ev ebitda', 'ev ebitda x', 'ev to ebitda', 'ev to ebitda x'], values: { '26': derived.evEbitda } },
  { labels: ['ev sales', 'ev sales x', 'ev to sales', 'ev to sales x'], values: { '26': derived.evSales } },
  { labels: ['p b', 'p b x', 'price to book', 'price to book x'], values: { '26': derived.pb } },
  { labels: ['book value per share', 'book value per share ₹'], values: { '26': derived.bookValuePerShare } },
];
