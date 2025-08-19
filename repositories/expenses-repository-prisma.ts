import { PrismaClient } from '../generated/prisma'
import type {
  CreateExpenseInput,
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

  async getExpenseById(id: number): Promise<Expense | null> {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { debtors: true },
    })
    return expense
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
      },
    })

    if (debtors && debtors.length > 0) {
      // Remove existing debtors
      await prisma.debtor.deleteMany({ where: { expenseId: id } })
      // Add new debtors
      await prisma.debtor.createMany({
        data: debtors.map(debtor => ({
          amount: debtor.amount,
          debtor: debtor.debtor,
          expenseId: id,
        })),
      })
    }

    const expense = (await prisma.expense.findUnique({
      where: { id },
      include: { debtors: true },
    })) as Expense

    return expense
  }

  async deleteExpense(id: number): Promise<void> {
    await prisma.expense.delete({
      where: { id },
      include: { debtors: true },
    })
  }
}
