const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '7714832917:AAHSS31bYDgSzxp8sgDURC8Cw6ZsRyx-ceg'; // 🔁 reemplaza con tu token real
const URL_APP = 'https://busle.vercel.app'; // 🔗 URL de tu Mini App

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, '👉 ¡Haz clic para jugar BUSLE 🎮!', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🎮 Jugar Busle',
            web_app: {
              url: URL_APP
            }
          }
        ]
      ]
    }
  });
});
