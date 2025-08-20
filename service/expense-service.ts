import type {
  CreateExpenseInput,
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

interface UpdateExpenseInput {
  id: number
  data: Partial<CreateExpenseInput>
}

export class ExpensesService {
  constructor(private expensesRepository: ExpensesRepository) {}

  async createExpenseEquallySplit(
    input: CreateExpenseEquallyInput
  ): Promise<Expense> {
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

  async fetchExpenses(): Promise<Expense[]> {
    return await this.expensesRepository.fetchExpenses()
  }

  async updateExpense({ id, data }: UpdateExpenseInput): Promise<Expense> {
    const expense = await this.expensesRepository.getExpenseById(id)

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

    await this.expensesRepository.updateExpense(expense)

    return expense
  }

  async deleteExpense(id: number): Promise<void> {
    const expense = await this.expensesRepository.getExpenseById(id)

    if (!expense) {
      throw new Error('Despesa não encontrada!')
    }

    await this.expensesRepository.deleteExpense(id)
  }

  async generateReport(): Promise<string> {
    const expenses = await this.expensesRepository.fetchExpenses()

    if (expenses.length === 0) {
      return 'Não há despesas registradas.'
    }

    const reportMap = new Map<
      string,
      { owes: Map<string, number>; isOwed: number }
    >()

    expenses.forEach(expense => {
      // Initialize payer in reportMap if not present
      if (!reportMap.has(expense.payer)) {
        reportMap.set(expense.payer, { owes: new Map(), isOwed: 0 })
      }

      // Add to payer's 'isOwed' amount
      reportMap.get(expense.payer)!.isOwed += expense.amount

      expense.debtors.forEach(debtor => {
        // Initialize debtor in reportMap if not present
        if (!reportMap.has(debtor.debtor)) {
          reportMap.set(debtor.debtor, { owes: new Map(), isOwed: 0 })
        }

        // Add to debtor's 'owes' amount to the payer
        const currentOwes =
          reportMap.get(debtor.debtor)!.owes.get(expense.payer) || 0

        reportMap
          .get(debtor.debtor)!
          .owes.set(expense.payer, currentOwes + debtor.amount)
      })
    })

    let reportString = 'Relatório de Despesas:\n\n'

    reportMap.forEach((data, participant) => {
      reportString += `*${participant}*\n`

      let totalOwedByParticipant = 0
      data.owes.forEach((amount, toWhom) => {
        reportString += `  Deve ${amount.toFixed(2)} para ${toWhom}\n`
        totalOwedByParticipant += amount
      })

      const netBalance = data.isOwed - totalOwedByParticipant
      reportString += `  Total pago: ${data.isOwed.toFixed(2)}\n`
      reportString += `  Total devido: ${totalOwedByParticipant.toFixed(2)}\n`
      reportString += `  Saldo: ${netBalance.toFixed(2)}\n\n`
    })

    return reportString
  }
}
