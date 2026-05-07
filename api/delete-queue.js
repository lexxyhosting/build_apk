import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
       return res.status(500).json({ error: "GAGAL: Kunci Supabase belum terbaca." });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { id } = req.body;

    const { error } = await supabase.from('build_queue').delete().eq('id', id);
    
    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}