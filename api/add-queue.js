import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
       return res.status(500).json({ error: "GAGAL: Kunci Supabase belum terbaca." });
    }
    
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // Tangkap isPremium dari bot
    const { botToken, authKey, zipUrl, userId, chatId, mode, isPremium } = req.body;

    const { data, error } = await supabase
      .from('build_queue')
      .insert([{ 
        bot_token: botToken, 
        auth_key: authKey,
        zip_url: zipUrl, 
        user_id: userId, 
        chat_id: chatId, 
        mode: mode, 
        is_premium: isPremium || false, // Masukkan status VIP ke database
        status: 'pending' 
      }]);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Antrean berhasil didaftarkan' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}