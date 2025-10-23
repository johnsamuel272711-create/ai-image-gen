// api/telegram.js - Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { photo, caption } = req.body;
    
    // 🔒 VERCEL AUTOMATICALLY PULLS GITHUB SECRETS
    const BOT_TOKEN = process.env.TELEGRAM_BOT_API;
    const CHAT_ID = process.env.TELEGRAM_ID_RECIEVER;
    
    // Convert base64 photo to buffer
    const buffer = Buffer.from(photo.split(',')[1], 'base64');
    
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', buffer, { filename: 'selfie.jpg' });
    formData.append('caption', caption);
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: 'Telegram failed' });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
