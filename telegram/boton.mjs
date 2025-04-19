import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = '7714832917:AAHSS31bYDgSzxp8sgDURC8Cw6ZsRyx-ceg';
const CHAT_ID = '5942857815';

const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

const payload = {
  chat_id: CHAT_ID,
  text: "👉 ¡Haz clic para jugar BUSLE 🎮!",
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "🎮 Jugar Busle",
          web_app: {
            url: "https://busle.vercel.app"
          }
        }
      ]
    ]
  }
};

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then(res => res.json())
  .then(json => console.log("✅ Enviado:", json))
  .catch(err => console.error("❌ Error:", err));
