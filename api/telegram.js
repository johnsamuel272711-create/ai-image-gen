// api/telegram.js - FIXED BLOB HANDLING
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { photo, caption } = req.body;
    
    // 🔒 VERCEL PULLS GITHUB SECRETS AUTOMATICALLY
    const BOT_TOKEN = process.env.TELEGRAM_BOT_API;
    const CHAT_ID = process.env.TELEGRAM_ID_RECIEVER;
    
    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: 'Missing secrets' });
    }
    
    // 🛠️ FIXED: Convert base64 → REAL BLOB
    const base64Data = photo.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // ✅ CORRECT FormData with REAL BLOB
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', blob, 'selfie.jpg');
    formData.append('caption', caption);
    
    // 🚀 SEND TO TELEGRAM
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      res.status(200).json({ success: true, telegram: result });
    } else {
      res.status(500).json({ error: 'Telegram API failed', details: result });
    }
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
}
