import qrcode from 'qrcode-terminal'
import wppweb from 'whatsapp-web.js'
import { ExpenseBotController } from '../bot-controller/expense-controller'
import { env } from '../env'
import { ExpensesRepositoryPrisma } from '../repositories/expenses-repository-prisma'
import { ExpensesService } from '../service/expense-service'

const { Client, LocalAuth } = wppweb

class WhatsAppWebBot {
  private client: wppweb.Client
  private groupId = '120363419257656117@g.us'

  constructor(private expenseBotController: ExpenseBotController) {
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
    const body = message.body.toLocaleLowerCase()

    if (body.includes('/nova')) {
      await this.expenseBotController.handleCreateExpense(message)
    } else if (body.includes('/despesas')) {
      await this.expenseBotController.handleFetchExpenses(message)
    } else if (body.includes('/deleta')) {
      await this.expenseBotController.handleDeleteExpense(message)
    } else if (body.includes('/atualiza')) {
      await this.expenseBotController.handleUpdateExpense(message)
    }
  }

  initialize() {
    console.log('🚀 Initializing WhatsApp Web.js bot...')
    this.client.initialize()
  }
}

const expensesPrismaRepository = new ExpensesRepositoryPrisma()
const expenseService = new ExpensesService(expensesPrismaRepository)
const expenseBotController = new ExpenseBotController(expenseService)

const webBot = new WhatsAppWebBot(expenseBotController)

webBot.initialize()
