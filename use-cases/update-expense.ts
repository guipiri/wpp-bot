import type {
  CreateExpenseInput,
  Expense,
  ExpensesRepository,
} from '../repositories/expenses-repository'
import { splitAmountEqually } from '../utils/split-amount'

interface UpdateExpenseUseCaseInput {
  id: number
  data: Partial<CreateExpenseInput>
}

export class UpdateExpenseUseCase {
  constructor(private expenseRepository: ExpensesRepository) {}

  async execute({ id, data }: UpdateExpenseUseCaseInput): Promise<Expense> {
    const expense = await this.expenseRepository.getExpenseById(id)

    if (!expense) {
      throw new Error('Despesa não encontrada!')
    }

    const { description, amount, debtors } = data

    if (amount && !debtors) {
      const debtorAmount = splitAmountEqually(amount, expense.debtors.length)
      expense.debtors = expense.debtors.map((debtor, idx) => {
        return { ...debtor, amount: debtorAmount[idx] }
      })
      expense.amount = amount
    }

    if (debtors && amount) {
      const totalDebtorsAmount = debtors.reduce(
        (sum, debtor) => sum + debtor.amount,
        0
      )

      if (totalDebtorsAmount !== amount) {
        throw new Error(
          'A soma dos valores dos devedores deve ser igual ao valor total da despesa.'
        )
      }

      expense.debtors = debtors
      expense.amount = amount
    }

    if (description) expense.description = description

    await this.expenseRepository.updateExpense(expense)

    return expense
  }
}
