import type { Expense } from '../repositories/expenses-repository'

export function expenseStringfy(expenses: Expense[]): string {
  return expenses
    .map(expense => {
      const debtors = expense.debtors
        .map(debtor => `- ${debtor.debtor}: R$ ${debtor.amount.toFixed(2)}`)
        .join('\n')
      return `*${expense.description.toLocaleUpperCase()}*
  Id: ${expense.id}
  R$ ${expense.amount.toFixed(2)}
  Paga por: ${expense.payer}
  Devedores:
${debtors}`
    })
    .join('\n')
}
