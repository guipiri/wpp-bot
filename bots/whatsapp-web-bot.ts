import qrcode from 'qrcode-terminal'
import wppweb from 'whatsapp-web.js'
import { env } from '../env'
import { GenerateResponseGemini } from '../geminiai/generate-response'
import type { GenerateTextResponseContract } from '../generate-response/text-contract'
import { RedisMessageRepository } from '../redis/client'
import type { MessageRepository } from '../repositories/messages-repository'

const { Client, LocalAuth } = wppweb

class WhatsAppWebBot {
  private client: wppweb.Client
  private chatId = '5511991627042@c.us'

  constructor(
    private generateResponse: GenerateTextResponseContract,
    private messageRepository: MessageRepository
  ) {
    this.generateResponse = generateResponse
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
      const contact = await message.getContact()

      const isGroup = contact.isGroup

      if (message.fromMe && !isGroup) {
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
    const from = message.from
    const chat = await message.getChat()
    const messageId = message.id.id

    // avoid infinite loop && answer just me
    if (contact.name === 'Eu' && message.to === this.chatId) return

    console.log(`📨 Message from ${contact.number}: ${message.body}`)

    // Save as the message to be answered
    await this.messageRepository.saveMessageToBeAnswered({ from, messageId })

    // Wait for more messages
    await this.waitForMoreMessages()

    // Set typing state and wait typing delay
    await this.sendStateTyping(chat)

    // Verify if this message should be answered
    const getMessageToBeAnswered =
      await this.messageRepository.getMessageToBeAnswered({ from })
    const shouldBeAnswered = getMessageToBeAnswered === messageId

    // If the message should not be answered, exit the function
    if (!shouldBeAnswered) {
      // Update history
      await this.messageRepository.saveMessage({
        from,
        message: message.body,
        role: 'user',
      })
      return
    }

    // Get chat history
    const chatHistory = await this.messageRepository.getHistory({ from })

    // Process the response
    const { response } = await this.generateResponse.exec({
      chatHistory,
      message: message.body,
    })

    // Update history
    await this.messageRepository.saveMessage({
      from,
      message: message.body,
      role: 'user',
    })
    await this.messageRepository.saveMessage({
      from,
      message: response,
      role: 'model',
    })

    // Send the response
    await this.client.sendMessage(message.from, response)

    console.log(`📨 Answred ${contact.number}: ${response}`)
  }

  initialize() {
    console.log('🚀 Initializing WhatsApp Web.js bot...')
    this.client.initialize()
  }
}

const generateResponse = new GenerateResponseGemini()
const messageRepository = new RedisMessageRepository()
const webBot = new WhatsAppWebBot(generateResponse, messageRepository)

webBot.initialize()

// module.exports = {
//   initialize: () => webBot.initialize(),
//   sendMessage: (number, message) => webBot.sendMessage(number, message),
// }
