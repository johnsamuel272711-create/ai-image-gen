// api/telegram.js - VERCEL ENV VARS ONLY
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { photo, caption } = req.body;
    
    // 🔒 VERCEL ENV VARS (YOUR DASHBOARD SETTINGS)
    const BOT_TOKEN = process.env.TELEGRAM_BOT_API;
    const CHAT_ID = process.env.TELEGRAM_ID_RECIEVER;
    
    console.log('🔑 Bot Token loaded:', BOT_TOKEN ? 'YES' : 'NO');
    console.log('🔑 Chat ID loaded:', CHAT_ID ? 'YES' : 'NO');
    
    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ 
        error: 'Missing env vars', 
        bot: !!BOT_TOKEN, 
        chat: !!CHAT_ID 
      });
    }
    
    // 🛠️ Base64 → Blob
    const base64Data = photo.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // 📸 TELEGRAM SEND
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', blob, 'selfie.jpg');
    formData.append('caption', caption);
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    console.log('📸 Telegram response:', result);
    
    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: result });
    }
    
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ error: error.message });
  }
}
