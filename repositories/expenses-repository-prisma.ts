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
    const expenses = await prisma.expense.findMany({
      include: { debtors: true },
    })
    return expenses
  }

  async updateExpense({
    id,
    amount,
    description,
    debtors,
  }: Partial<CreateExpenseInput> & { id: number }) {
    await prisma.expense.update({
      where: { id },
      data: {
        amount,
        description,
        debtors: {
          create: debtors?.map(debtor => ({
            amount: debtor.amount,
            debtor: debtor.debtor,
          })),
        },
      },
    })
  }

  async deleteExpensive(id: number): Promise<void> {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { debtors: true },
    })

    if (!expense) {
      throw new Error(`Expense with id ${id} not found`)
    }

    await prisma.debtor.deleteMany({
      where: {
        expenseId: id,
      },
    })
    await prisma.expense.delete({
      where: { id },
      include: { debtors: true },
    })
  }
}
