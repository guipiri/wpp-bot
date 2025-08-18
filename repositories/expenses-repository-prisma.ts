import { PrismaClient } from '../generated/prisma'
import type {
  CreateExpenseInput,
  DebtsReport,
  Expense,
  ExpensesRepository,
} from './expenses-repository'

const prisma = new PrismaClient()

export class ExpensesRepositoryPrisma implements ExpensesRepository {
  async createExpense(input: CreateExpenseInput): Promise<void> {
    await prisma.expense.create({
      data: {
        description: input.description,
        amount: input.amount,
        payer: input.payer,
        debtors: {
          create: input.debtors.map(debtor => ({
            amount: debtor.amount,
            debtor: debtor.debtor,
          })),
        },
      },
    })
  }

  async fetchExpenses(): Promise<Expense[]> {
    return []
  }

  async getDebtsReport(): Promise<DebtsReport> {
    return { debts: [] }
  }
}

const prismaExpenseRepository = new ExpensesRepositoryPrisma()

await prismaExpenseRepository.createExpense({
  description: 'Dinner',
  amount: 100,
  payer: 'Alice',
  debtors: [
    { amount: 50, debtor: 'Bob' },
    { amount: 50, debtor: 'Charlie' },
  ],
})
