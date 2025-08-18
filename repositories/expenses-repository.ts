export interface Debtor {
  amount: number
  debtor: string
}

export interface CreateExpenseInput {
  amount: number
  description: string
  payer: string
  debtors: Debtor[]
}

export type Expense = {
  id: number
  createdAt: Date
} & CreateExpenseInput

export interface DebtsReport {
  debts: Debts[]
}

export interface Debts {
  amount: number
  debtor: string
  receiver: string
}

export interface ExpensesRepository {
  createExpense(input: CreateExpenseInput): Promise<void>
  fetchExpenses(): Promise<Expense[]>
  updateExpense(
    input: Partial<CreateExpenseInput> & { id: number }
  ): Promise<void>
  deleteExpensive(id: number): Promise<void>
}
