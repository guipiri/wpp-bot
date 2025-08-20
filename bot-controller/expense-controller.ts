import type WAWebJS from 'whatsapp-web.js'
import type { ExpensesService } from '../service/expense-service'
import { expenseStringfy } from '../utils/expenseStringfy'

export class ExpenseBotController {
  constructor(private expensesService: ExpensesService) {}

  async handleCreateExpense(message: WAWebJS.Message): Promise<void> {
    const contact = await message.getContact()
    const chat = (await message.getChat()) as WAWebJS.GroupChat
    const participants = chat.participants
    const amount = Number(message.body.split(' ')[1].replaceAll(',', '.'))

    if (Number.isNaN(amount)) {
      message.reply('O valor da despesa deve ser um número.')
      return
    }

    const payer = contact.number
    const description = message.body.split(' ').slice(2).join(' ').toUpperCase()

    const debtors = participants.map(participant => {
      return {
        debtor: participant.id.user,
      }
    })

    try {
      const expenseCreated =
        await this.expensesService.createExpenseEquallySplit({
          amount,
          description,
          payer,
          debtors,
        })
      message.reply(
        `Despesa registrada com sucesso!\n ${expenseStringfy([expenseCreated])}`
      )
    } catch (error: unknown) {
      message.reply((error as Error)?.message)
    }
  }

  async handleFetchExpenses(message: WAWebJS.Message): Promise<void> {
    const expenses = await this.expensesService.fetchExpenses()
    message.reply(expenseStringfy(expenses))
  }

  async handleDeleteExpense(
    message: WAWebJS.Message
  ): Promise<WAWebJS.Message> {
    const body = message.body.toLowerCase()
    const expenseId = Number(body.split(' ')[1])

    if (Number.isNaN(expenseId)) {
      return message.reply('O id da despesa deve ser um número.')
    }

    try {
      await this.expensesService.deleteExpense(expenseId)
      return message.reply('Despesa deletada com sucesso!')
    } catch (error: unknown) {
      return message.reply(
        (error as Error)?.message || 'Erro ao deletar despesa.'
      )
    }
  }

  async handleUpdateExpense(message: WAWebJS.Message): Promise<void> {
    const body = message.body.toLowerCase()

    const expenseId = Number(body.split(' ')[1])
    const amount = Number(message.body.split(' ')[2].replaceAll(',', '.'))
    const description = message.body.split(' ').slice(3).join(' ').toUpperCase()

    if (Number.isNaN(amount) || Number.isNaN(expenseId)) {
      message.reply('O valor e o id da despesa deve ser um número.')
    }

    try {
      const expenseUpdated = await this.expensesService.updateExpense({
        id: expenseId,
        data: { amount, description },
      })
      message.reply(
        `Despesa atualizada com sucesso!\n${expenseStringfy([expenseUpdated])}`
      )
    } catch (error: unknown) {
      message.reply((error as Error)?.message || 'Erro ao atualizar despesa.')
    }
  }

  async handleReport(message: WAWebJS.Message): Promise<WAWebJS.Message> {
    const report = await this.expensesService.generateReport()
    return message.reply(report)
  }
}
