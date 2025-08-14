export interface MessageRepository {
  saveMessage(input: {
    from: string
    message: string
    role: 'user' | 'model'
  }): Promise<void>

  getHistory(input: {
    from: string
  }): Promise<{ text: string; role: 'user' | 'model' }[]>

  saveMessageToBeAnswered(input: {
    from: string
    messageId: string
  }): Promise<void>

  getMessageToBeAnswered(input: { from: string }): Promise<string | null>
}
