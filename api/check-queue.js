const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { botToken } = req.query;

  if (!botToken) return res.status(400).json({ error: 'Token bot diperlukan' });

  try {
    const { data, error } = await supabase
      .from('build_queue')
      .select('*')
      .eq('bot_token', botToken);

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}