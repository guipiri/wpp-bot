# WhatsApp Chatbot with Node.js

A simple WhatsApp chatbot implementation using Node.js with support for both WhatsApp Business API and WhatsApp Web.js.

## Features

- 🤖 Automated responses to common queries
- 📱 Support for WhatsApp Business API (official)
- 🌐 Support for WhatsApp Web.js (unofficial but easier setup)
- 🎯 Command-based interactions
- 🔧 Extensible architecture
- 🤖 Optional AI integration with OpenAI

## Setup Instructions

### Option 1: WhatsApp Business API (Recommended for Production)

1. **Get WhatsApp Business API Access:**
   - Sign up for Meta Business account
   - Apply for WhatsApp Business API access
   - Get your access token and phone number ID

2. **Configure Environment Variables:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Fill in your WhatsApp Business API credentials.

3. **Set up Webhook:**
   - Deploy your app to a public URL (use ngrok for testing)
   - Configure webhook URL in Meta Developer Console
   - Verify webhook with your verify token

### Option 2: WhatsApp Web.js (Easier for Development)

1. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run the Bot:**
   \`\`\`bash
   npm start
   \`\`\`

3. **Scan QR Code:**
   - A QR code will appear in your terminal
   - Scan it with your WhatsApp mobile app
   - The bot will be ready to receive messages

## Available Commands

- **hello/hi** - Get a greeting message
- **help** - See all available commands
- **time** - Get current time
- **joke** - Get a random joke
- **menu** - See services menu
- **contact** - Get contact information

## Project Structure

\`\`\`
whatsapp-chatbot/
├── server.js              # Main server file
├── bots/
│   ├── business-api-bot.js # WhatsApp Business API implementation
│   └── whatsapp-web-bot.js # WhatsApp Web.js implementation
├── utils/
│   └── ai-integration.js   # Optional AI integration
├── package.json
├── .env.example
└── README.md
\`\`\`

## Extending the Bot

### Adding New Commands

Edit the `processMessage` function in either bot file:

\`\`\`javascript
if (lowerMessage.includes('your-command')) {
  response = 'Your custom response here';
}
\`\`\`

### Adding AI Responses

1. Set your OpenAI API key in `.env`
2. Import and use the AI integration:

\`\`\`javascript
const aiIntegration = require('../utils/ai-integration');

// In your message handler
const aiResponse = await aiIntegration.generateResponse(messageBody);
if (aiResponse) {
  await this.sendMessage(from, aiResponse);
}
\`\`\`

## Deployment

### Using Vercel (for WhatsApp Business API)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard
4. Update webhook URL in Meta Developer Console

### Using Railway/Heroku

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

## Important Notes

- **WhatsApp Web.js** requires a browser session and may be unstable for production
- **WhatsApp Business API** is more reliable but requires approval and setup
- Always test thoroughly before deploying to production
- Respect WhatsApp's terms of service and rate limits

## Troubleshooting

- **QR Code not appearing**: Make sure you have the latest version of whatsapp-web.js
- **Webhook not working**: Check your verify token and ensure your server is publicly accessible
- **Messages not sending**: Verify your API credentials and phone number permissions
