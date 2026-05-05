// File: server-api.js (Di-host oleh Anda, BUKAN diberikan ke pembeli)
require("dotenv").config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Kunci Supabase AMAN di server Anda sendiri
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post('/api/add-queue', async (req, res) => {
  const { botToken, zipUrl, userId, chatId } = req.body;

  // 1. Cek apakah botToken pembeli ini valid/terdaftar di database lisensi Anda
  const { data: license } = await supabase
    .from('licenses')
    .select('auth_key')
    .eq('bot_token', botToken)
    .single();

  if (!license) {
    return res.status(403).json({ success: false, message: "Akses Ditolak: Lisensi tidak valid." });
  }

  // 2. Jika valid, masukkan ke antrean
  const { error } = await supabase.from('build_queue').insert([{
    auth_key: license.auth_key,
    zip_url: zipUrl,
    user_id: userId,
    chat_id: chatId,
    bot_token: botToken,
    status: 'pending'
  }]);

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, message: "Berhasil masuk antrean pusat." });
});

app.listen(3000, () => console.log('API Sentral berjalan...'));