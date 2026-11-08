import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { FinanceState, FinanceTransaction, TransactionType } from "@/types-finance";

type NewTransaction = Omit<FinanceTransaction, "id" | "date" | "isSample">;
type ImportedTransaction = Omit<FinanceTransaction, "id" | "isSample">;
type FinanceContextValue = FinanceState & {
  isReady: boolean;
  addTransaction: (draft: NewTransaction) => Promise<void>;
  importTransactions: (items: ImportedTransaction[]) => Promise<{ added: number; duplicates: number }>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (budget: number) => Promise<void>;
};

const STORAGE_KEY = "ai-finance-assistant.finance.v1";
const day = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString();

const starterState: FinanceState = {
  budget: 40000,
  balance: 248560,
  transactions: [
    { id: "sample-salary", title: "Monthly salary", category: "Salary", amount: 85000, type: "income", date: day(1), paymentMethod: "Bank transfer", isSample: true },
    { id: "sample-groceries", title: "Grocery Market", category: "Food & groceries", amount: 12450, type: "expense", date: day(0), paymentMethod: "UPI", isSample: true },
    { id: "sample-metro", title: "Metro recharge", category: "Transport", amount: 6200, type: "expense", date: day(1), paymentMethod: "UPI", isSample: true },
    { id: "sample-shopping", title: "Weekend shopping", category: "Shopping", amount: 5800, type: "expense", date: day(2), paymentMethod: "Card", isSample: true },
    { id: "sample-bills", title: "Electricity & internet", category: "Bills & utilities", amount: 4000, type: "expense", date: day(3), paymentMethod: "UPI", isSample: true },
    { id: "sample-dining", title: "Dinner out", category: "Food & groceries", amount: 4000, type: "expense", date: day(4), paymentMethod: "UPI", isSample: true }
  ]
};

export function FinanceProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<FinanceState>(starterState);
  const stateRef = useRef<FinanceState>(starterState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        try {
          const parsed = JSON.parse(stored) as FinanceState;
          if (Array.isArray(parsed.transactions) && typeof parsed.budget === "number" && typeof parsed.balance === "number") {
            stateRef.current = parsed;
            setState(parsed);
          }
        } catch {
          // Keep the starter data if local storage is incomplete or invalid.
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  const persist = useCallback(async (next: FinanceState) => {
    stateRef.current = next;
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const value = useMemo<FinanceContextValue>(() => ({
    ...state,
    isReady,
    addTransaction: async (draft) => {
      const transaction: FinanceTransaction = { ...draft, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: new Date().toISOString() };
      const current = stateRef.current;
      const balance = current.balance + (transaction.type === "income" ? transaction.amount : -transaction.amount);
      await persist({ ...current, balance, transactions: [transaction, ...current.transactions] });
    },
    importTransactions: async (items) => {
      const current = stateRef.current;
      const keyFor = (item: Omit<FinanceTransaction, "id" | "isSample">) => `${item.type}|${new Date(item.date).toISOString().slice(0, 10)}|${Math.round(item.amount * 100)}|${item.title.trim().toLowerCase()}`;
      const known = new Set(current.transactions.map(keyFor));
      const added = items.filter((item) => {
        const key = keyFor(item);
        if (known.has(key)) return false;
        known.add(key);
        return true;
      }).map((item, index) => ({ ...item, id: `import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}` }));
      if (added.length) {
        const balance = current.balance + added.reduce((sum, item) => sum + (item.type === "income" ? item.amount : -item.amount), 0);
        await persist({ ...current, balance, transactions: [...added, ...current.transactions] });
      }
      return { added: added.length, duplicates: items.length - added.length };
    },
    deleteTransaction: async (id) => {
      const current = stateRef.current;
      const transaction = current.transactions.find((item) => item.id === id);
      if (!transaction) return;
      const balance = current.balance + (transaction.type === "income" ? -transaction.amount : transaction.amount);
      await persist({ ...current, balance, transactions: current.transactions.filter((item) => item.id !== id) });
    },
    updateBudget: async (budget) => {
      await persist({ ...stateRef.current, budget });
    }
  }), [isReady, persist, state]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used inside FinanceProvider");
  return context;
}

export function currentMonthTransactions(transactions: FinanceTransaction[]) {
  const now = new Date();
  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
}

export function formatCurrency(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function totalByType(transactions: FinanceTransaction[], type: TransactionType) {
  return transactions.reduce((total, transaction) => total + (transaction.type === type ? transaction.amount : 0), 0);
}
