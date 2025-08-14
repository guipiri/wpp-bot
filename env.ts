import z from 'zod'

const envValidations = z.object({
  // WHATSAPP_TOKEN: z.string(),
  // WHATSAPP_PHONE_NUMBER_ID: z.string(),
  // VERIFY_TOKEN: z.string(),
  // PORT: z.number().default(3000),
  // OPENAI_API_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  GEMINI_MODEL: z.string(),
  TYPING_DELAY: z.string().transform(val => Number(val)),
  WAIT_FOR_MORE_MESSAGES_DELAY: z.string().transform(val => Number(val)),
})

export const env = envValidations.parse(process.env)
