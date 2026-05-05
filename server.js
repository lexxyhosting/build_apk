require("dotenv").config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Pengecekan Keamanan: Mencegah Vercel Crash (Error 500) jika .env kosong
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("FATAL ERROR: SUPABASE_URL atau SUPABASE_KEY belum diisi di Vercel!");
}

// Inisialisasi Supabase (hanya jika Key tersedia)
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY) 
  : null;

// Jalur Utama (Untuk ngetes di browser apakah server hidup)
app.get('/', (req, res) => {
  res.send("✅ Lex Builder API Gateway is Running Perfectly!");
});

app.post('/api/add-queue', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: "Database tidak terkonfigurasi di server." });
  
  const { botToken, zipUrl, userId, chatId } = req.body;

  try {
    const { data: license } = await supabase
      .from('licenses')
      .select('auth_key')
      .eq('bot_token', botToken)
      .single();

    if (!license) {
      return res.status(403).json({ success: false, message: "Akses Ditolak: Lisensi tidak valid." });
    }

    const { error } = await supabase.from('build_queue').insert([{
      auth_key: license.auth_key,
      zip_url: zipUrl,
      user_id: userId,
      chat_id: chatId,
      bot_token: botToken,
      status: 'pending'
    }]);

    if (error) throw error;
    res.json({ success: true, message: "Berhasil masuk antrean pusat." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/check-status', async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, message: "Database tidak terkonfigurasi di server." });

  const { bot_token } = req.query; 

  if (!bot_token) {
    return res.status(400).json({ success: false, message: "Token bot tidak diberikan." });
  }

  try {
    const { data, error } = await supabase
      .from('build_queue')
      .select('*')
      .eq('bot_token', bot_token);

    if (error) throw error;
    res.json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan server internal." });
  }
});

// Wajib untuk Vercel Serverless
module.exports = app;