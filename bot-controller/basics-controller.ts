import type WAWebJS from 'whatsapp-web.js'

export class BasicBotController {
  async handleHelpMessage(message: WAWebJS.Message) {
    const helpResponse = `*Comandos disponíveis:*
    /nova - Cria uma nova despesa
    /despesas - Lista todas as despesas
    /deleta - Deleta uma despesa
    /atualiza - Atualiza uma despesa
    /ajuda - Mostra esta mensagem de ajuda

*Sintaxe:*
    /despesas
    /deleta [id]
    /atualiza [id] [valor] [descrição]
    /nova [valor] [descrição]`

    message.reply(helpResponse)
  }
}
