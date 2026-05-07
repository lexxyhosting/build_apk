const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { botToken, authKey, zipUrl, userId, chatId, mode } = req.body;

  try {
    const { data, error } = await supabase
      .from('build_queue')
      .insert([{ 
        bot_token: botToken, 
        auth_key: authKey, // Disinkronkan dengan server.js pusat
        zip_url: zipUrl, 
        user_id: userId, 
        chat_id: chatId, 
        mode: mode, 
        status: 'pending' // Status awal harus pending agar dibaca server pusat
      }]);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Antrean berhasil didaftarkan' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}