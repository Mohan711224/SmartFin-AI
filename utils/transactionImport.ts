import { FinanceTransaction } from "@/types-finance";

type ImportedTransaction = Omit<FinanceTransaction, "id" | "isSample">;

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(cell.trim()); cell = ""; }
    else cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function parseDate(value: string) {
  const text = value.trim();
  const localDate = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (localDate) {
    const year = Number(localDate[3].length === 2 ? `20${localDate[3]}` : localDate[3]);
    const date = new Date(year, Number(localDate[2]) - 1, Number(localDate[1]), 12);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parseAmount(value: string) {
  const text = value.replace(/[₹,\s]/g, "").replace(/(INR|Rs\.?)/gi, "");
  const negative = /^\(.*\)$/.test(text) || /-$/.test(text);
  const number = Number(text.replace(/[()]/g, "").replace(/-$/, ""));
  if (!Number.isFinite(number)) return null;
  return negative ? -Math.abs(number) : number;
}

function classifyCategory(description: string, type: "income" | "expense") {
  const value = description.toLowerCase();
  if (type === "income") return /salary|payroll|wage/.test(value) ? "Salary" : /freelance|consulting|invoice/.test(value) ? "Freelance" : "Other";
  if (/grocery|grocer|supermarket|swiggy|zomato|restaurant|cafe|food|dining|blinkit|zepto|bigbasket/.test(value)) return "Food & groceries";
  if (/uber|ola|rapido|metro|transport|petrol|fuel|irctc|flight|airline|parking/.test(value)) return "Transport";
  if (/electricity|utility|utilities|broadband|internet|mobile bill|recharge|gas bill|rent|water bill/.test(value)) return "Bills & utilities";
  if (/pharmacy|medical|hospital|clinic|health|apollo/.test(value)) return "Health";
  if (/netflix|spotify|movie|cinema|hotstar|prime video|entertainment/.test(value)) return "Entertainment";
  if (/amazon|flipkart|myntra|shopping|retail|mall|store/.test(value)) return "Shopping";
  return "Other";
}

function inferPaymentMethod(value: string) {
  if (/upi|gpay|phonepe|paytm|bhim/.test(value.toLowerCase())) return "UPI";
  if (/card|pos|visa|mastercard|rupay/.test(value.toLowerCase())) return "Card";
  if (/neft|imps|rtgs|bank transfer|fund transfer/.test(value.toLowerCase())) return "Bank transfer";
  if (/wallet/.test(value.toLowerCase())) return "Wallet";
  return "Bank transfer";
}

export function parseBankCsv(csv: string) {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { transactions: [] as ImportedTransaction[], rejected: 0, error: "Paste a CSV with a header row and at least one transaction." };
  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const indexOf = (...names: string[]) => headers.findIndex((header) => names.includes(header));
  const dateIndex = indexOf("date", "transactiondate", "valuedate", "txndate");
  const descriptionIndex = indexOf("description", "narration", "remarks", "merchant", "particulars", "transactiondetails");
  const amountIndex = indexOf("amount", "transactionamount", "txnamount");
  const debitIndex = indexOf("debit", "debitamount", "withdrawal", "withdrawals", "paidout");
  const creditIndex = indexOf("credit", "creditamount", "deposit", "deposits", "paidin");
  const typeIndex = indexOf("type", "drcr", "transactiontype", "crdr");
  const methodIndex = indexOf("paymentmethod", "method", "channel");
  const hasAmountColumn = amountIndex >= 0 || debitIndex >= 0 || creditIndex >= 0;
  if (dateIndex < 0 || descriptionIndex < 0 || !hasAmountColumn) {
    return { transactions: [] as ImportedTransaction[], rejected: lines.length - 1, error: "Couldn’t find the required columns. Include date, description/narration, and amount (or debit/credit)." };
  }

  const transactions: ImportedTransaction[] = [];
  let rejected = 0;
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const date = parseDate(cells[dateIndex] || "");
    const title = (cells[descriptionIndex] || "").trim();
    const debitText = debitIndex >= 0 ? cells[debitIndex] || "" : "";
    const creditText = creditIndex >= 0 ? cells[creditIndex] || "" : "";
    const debit = debitText.trim() ? parseAmount(debitText) : null;
    const credit = creditText.trim() ? parseAmount(creditText) : null;
    const amountText = amountIndex >= 0 ? cells[amountIndex] || "" : "";
    const amount = debit !== null && debit !== 0 ? debit : credit !== null && credit !== 0 ? credit : parseAmount(amountText);
    const typeText = typeIndex >= 0 ? (cells[typeIndex] || "").toLowerCase() : "";
    const type = debit !== null && debit !== 0 ? "expense" : credit !== null && credit !== 0 ? "income" : /debit|withdraw|\bdr\b|paid.?out/.test(typeText) ? "expense" : /credit|deposit|\bcr\b|paid.?in/.test(typeText) ? "income" : amount !== null && amount < 0 ? "expense" : "income";
    if (!date || !title || amount === null || amount === 0) { rejected += 1; continue; }
    const method = methodIndex >= 0 && cells[methodIndex]?.trim() ? cells[methodIndex].trim() : inferPaymentMethod(title);
    transactions.push({ title, category: classifyCategory(title, type), amount: Math.abs(amount), type, date, paymentMethod: method, source: "imported" });
  }
  return { transactions, rejected, error: null as string | null };
}
