import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
       return res.status(500).json({ error: "Kunci Supabase belum dikonfigurasi di Vercel." });
    }
    
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { botToken, authKey, zipUrl, userId, chatId, mode, isPremium } = req.body;

    // --- VALIDASI LISENSI ---
    const { data: licenseData, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('auth_key', authKey)
      .single();

    if (licenseError || !licenseData) {
      return res.status(403).json({ 
        success: false, 
        error: "LICENSE_INVALID", 
        message: "Lisensi Server tidak valid atau tidak ditemukan." 
      });
    }
    // ------------------------

    const { data, error } = await supabase
      .from('build_queue')
      .insert([{ 
        bot_token: botToken, 
        auth_key: authKey,
        zip_url: zipUrl, 
        user_id: userId, 
        chat_id: chatId, 
        mode: mode, 
        is_premium: isPremium || false,
        status: 'pending' 
      }]);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Antrean berhasil didaftarkan' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}