export type TransactionType = "income" | "expense";

export type FinanceTransaction = {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
  paymentMethod?: string;
  source?: "manual" | "imported" | "upi";
  isSample?: boolean;
};

export type FinanceState = {
  transactions: FinanceTransaction[];
  budget: number;
  balance: number;
};
