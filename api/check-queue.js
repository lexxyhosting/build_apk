import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // 1. Cek Kunci Environment Vercel
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
       return res.status(500).json({ error: "GAGAL: Kunci Supabase belum terbaca oleh sistem Vercel. Pastikan sudah diisi di Environment Variables." });
    }

    // 2. Inisialisasi Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    // 3. Validasi Method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Salah jalur! Endpoint ini hanya menerima request GET.' });
    }

    // 4. Proses Database
    const { botToken } = req.query;
    if (!botToken) return res.status(400).json({ error: 'Token bot belum dimasukkan di akhir URL.' });

    const { data, error } = await supabase
      .from('build_queue')
      .select('*')
      .eq('bot_token', botToken);

    if (error) throw error;
    
    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ success: false, pesan_error_asli: error.message });
  }
}