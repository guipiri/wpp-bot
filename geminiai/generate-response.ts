import { GoogleGenAI } from '@google/genai'
import { env } from '../env'
import type {
  ChatHistory,
  GenerateTextResponseContract,
} from '../generate-response/text-contract'

const geminiai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

export class GenerateResponseGemini implements GenerateTextResponseContract {
  async exec({
    chatHistory,
    message,
  }: {
    chatHistory: ChatHistory
    message: string
  }) {
    const geminiChatHistory = chatHistory.map(msg => {
      return {
        parts: [{ text: msg.text }],
        role: msg.role,
      }
    })

    const chat = geminiai.chats.create({
      config: {
        maxOutputTokens: 150,
        responseMimeType: 'text/plain',
        systemInstruction:
          'Você deve responder sempre com uma piada em português.',
      },
      model: env.GEMINI_MODEL,
      history: geminiChatHistory,
    })

    const response = await chat.sendMessage({ message })

    console.log(response.text)

    return { response: response.text || 'Não sei te responder essa!' }
  }
}
