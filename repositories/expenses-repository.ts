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
  createExpense(input: CreateExpenseInput): Promise<Expense>
  fetchExpenses(): Promise<Expense[]>
  getExpenseById(id: number): Promise<Expense | null>
  updateExpense(
    input: Partial<CreateExpenseInput> & { id: number }
  ): Promise<Expense>
  deleteExpense(id: number): Promise<void>
}
