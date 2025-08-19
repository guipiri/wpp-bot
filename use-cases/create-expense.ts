import type {
  Expense,
  ExpensesRepository,
} from '../repositories/expenses-repository'
import { splitAmountEqually } from '../utils/split-amount'

interface CreateExpenseEquallyInput {
  amount: number
  description: string
  payer: string
  debtors: { debtor: string }[]
}

export class CreateExpenseUseCase {
  constructor(private expensesRepository: ExpensesRepository) {}

  async executeEqually(input: CreateExpenseEquallyInput): Promise<Expense> {
    const { amount, debtors, description, payer } = input

    if (debtors.length === 0) {
      throw new Error('É necessário informar os devedores da despesa.')
    }

    if (amount <= 0) {
      throw new Error('O valor da despesa deve ser maior que zero.')
    }

    const debtorAmounts = splitAmountEqually(amount, debtors.length)

    const createExpenseData = {
      amount,
      debtors: debtors.map((debtor, idx) => {
        return { debtor: debtor.debtor, amount: debtorAmounts[idx] }
      }),
      description,
      payer,
    }

    return await this.expensesRepository.createExpense(createExpenseData)
  }
}
