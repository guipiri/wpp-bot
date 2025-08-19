import qrcode from 'qrcode-terminal'
import wppweb from 'whatsapp-web.js'
import { env } from '../env'
import type { ExpensesRepository } from '../repositories/expenses-repository'
import { ExpensesRepositoryPrisma } from '../repositories/expenses-repository-prisma'
import { CreateExpenseUseCase } from '../use-cases/create-expense'
import { UpdateExpenseUseCase } from '../use-cases/update-expense'
import { expenseStringfy } from '../utils/expenseStringfy'

const { Client, LocalAuth } = wppweb

class WhatsAppWebBot {
  private client: wppweb.Client
  private groupId = '120363419257656117@g.us'

  constructor(
    private expensesRepository: ExpensesRepository,
    private createExpenseUseCase: CreateExpenseUseCase,
    private updateExpenseUseCase: UpdateExpenseUseCase
  ) {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    })

    this.setupEventHandlers()
  }

  setupEventHandlers() {
    // Generate QR code for authentication
    this.client.on('qr', qr => {
      console.log('📱 Scan this QR code with your WhatsApp:')
      qrcode.generate(qr, { small: true })
    })

    // Client ready
    this.client.on('ready', () => {
      console.log('✅ WhatsApp Web.js client is ready!')
    })

    // Handle incoming messages
    this.client.on('message_create', async (message: wppweb.Message) => {
      if (message.to === this.groupId) {
        await this.handleMessage(message)
      }
    })

    // Handle authentication
    this.client.on('authenticated', () => {
      console.log('✅ WhatsApp authenticated successfully!')
    })

    // Handle authentication failure
    this.client.on('auth_failure', msg => {
      console.error('❌ Authentication failed:', msg)
    })

    // Handle disconnection
    this.client.on('disconnected', reason => {
      console.log('📱 WhatsApp disconnected:', reason)
    })
  }

  async sendStateTyping(chat: wppweb.Chat) {
    chat.sendStateTyping()
    await new Promise(resolve => setTimeout(resolve, env.TYPING_DELAY))
  }

  async waitForMoreMessages() {
    await new Promise(resolve =>
      setTimeout(resolve, env.WAIT_FOR_MORE_MESSAGES_DELAY)
    )
  }

  async handleMessage(message: wppweb.Message) {
    const contact = await message.getContact()
    const chat = (await message.getChat()) as wppweb.GroupChat
    const participants = chat.participants
    const body = message.body.toLocaleLowerCase()

    if (body.includes('/nova')) {
      const amount = Number(message.body.split(' ')[1].replaceAll(',', '.'))

      if (Number.isNaN(amount)) {
        return message.reply('O valor da despesa deve ser um número.')
      }

      const payer = contact.number
      const description = message.body
        .split(' ')
        .slice(2)
        .join(' ')
        .toUpperCase()

      const debtors = participants.map(participant => {
        return {
          debtor: participant.id.user,
        }
      })

      try {
        const expenseCreated = await this.createExpenseUseCase.executeEqually({
          amount,
          description,
          payer,
          debtors,
        })
        message.reply(
          'Despesa registrada com sucesso!\n' +
            expenseStringfy([expenseCreated])
        )
      } catch (error: unknown) {
        message.reply((error as Error)?.message)
      }
    } else if (body.includes('/despesas')) {
      const expenses = await this.expensesRepository.fetchExpenses()
      const response = expenseStringfy(expenses)
      message.reply(response)
    } else if (body.includes('/deleta')) {
      const expenseId = Number(body.split(' ')[1])

      if (Number.isNaN(expenseId)) {
        message.reply('O id da despesa deve ser um número.')
      }

      try {
        // await this.deleteExpensive(expenseId)
        message.reply('Despesa deletada com sucesso!')
      } catch (error: unknown) {
        message.reply((error as Error)?.message || 'Erro ao deletar despesa.')
      }
    } else if (body.includes('/atualiza')) {
      const expenseId = Number(body.split(' ')[1])
      const amount = Number(message.body.split(' ')[2].replaceAll(',', '.'))
      const description = message.body
        .split(' ')
        .slice(3)
        .join(' ')
        .toUpperCase()

      if (Number.isNaN(amount) || Number.isNaN(expenseId)) {
        message.reply('O valor e o id da despesa deve ser um número.')
      }

      try {
        const expenseUpdated = await this.updateExpenseUseCase.execute({
          id: expenseId,
          data: { amount, description },
        })
        message.reply(
          'Despesa atualizada com sucesso!\n' +
            expenseStringfy([expenseUpdated])
        )
      } catch (error: unknown) {
        message.reply((error as Error)?.message || 'Erro ao atualizar despesa.')
      }
    }
  }

  initialize() {
    console.log('🚀 Initializing WhatsApp Web.js bot...')
    this.client.initialize()
  }
}

const expensesRepository = new ExpensesRepositoryPrisma()
const createExpenseUseCase = new CreateExpenseUseCase(expensesRepository)
const updateExpenseUseCase = new UpdateExpenseUseCase(expensesRepository)
// const deleteExpenseUseCase = new DeleteExpenseUseCase(expensesRepository)
const webBot = new WhatsAppWebBot(
  expensesRepository,
  createExpenseUseCase,
  updateExpenseUseCase
)

webBot.initialize()
