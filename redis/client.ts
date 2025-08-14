import { createClient } from 'redis'
import type { MessageRepository } from '../repositories/messages-repository'

const redisClient = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .on('connect', () => console.log('✅ Redis client connected successfully!'))
  .connect()

export class RedisMessageRepository implements MessageRepository {
  async saveMessage({
    from,
    message,
    role,
  }: {
    from: string
    message: string
    role: 'user' | 'model'
  }): Promise<void> {
    await redisClient.rPush(
      `messages:${from}`,
      JSON.stringify({ text: message, role: role })
    )
  }

  async getHistory({
    from,
  }: {
    from: string
  }): Promise<{ text: string; role: 'user' | 'model' }[]> {
    const messages = await redisClient.lRange(`messages:${from}`, 0, -1)
    return messages.map(msg => JSON.parse(msg))
  }

  async saveMessageToBeAnswered({
    from,
    messageId,
  }: {
    from: string
    messageId: string
  }): Promise<void> {
    await redisClient.set(`shouldBeAnswered:${from}`, messageId)
  }

  async getMessageToBeAnswered({
    from,
  }: {
    from: string
  }): Promise<string | null> {
    return await redisClient.get(`shouldBeAnswered:${from}`)
  }
}
