export interface Message {
  text: string
  role: 'user' | 'model'
}

export type ChatHistory = Message[]

export interface GenerateTextResponseContract {
  exec(input: {
    chatHistory: ChatHistory
    message: string
  }): Promise<{ response: string }>
}
