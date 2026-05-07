import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                error: 'METHOD_NOT_ALLOWED'
            });
        }

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
            return res.status(500).json({
                success: false,
                error: 'SUPABASE_NOT_CONFIGURED'
            });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        );

        const {
            botToken,
            authKey,
            zipUrl,
            userId,
            chatId,
            mode,
            isPremium
        } = req.body;

        // =========================
        // VALIDASI AUTH KEY
        // =========================

        if (!authKey || String(authKey).trim() === '') {
            return res.status(403).json({
                success: false,
                error: 'LICENSE_INVALID',
                message: 'AUTH_KEY kosong.'
            });
        }

        const { data: licenseData, error: licenseError } = await supabase
            .from('licenses')
            .select('*')
            .eq('auth_key', authKey)
            .maybeSingle();

        if (licenseError) {
            console.log('LICENSE ERROR:', licenseError);

            return res.status(403).json({
                success: false,
                error: 'LICENSE_INVALID',
                message: 'Lisensi gagal diverifikasi.'
            });
        }

        if (!licenseData) {
            return res.status(403).json({
                success: false,
                error: 'LICENSE_INVALID',
                message: 'AUTH_KEY tidak terdaftar.'
            });
        }

        // OPTIONAL:
        // kalau license punya status aktif/nonaktif
        if (licenseData.active === false) {
            return res.status(403).json({
                success: false,
                error: 'LICENSE_DISABLED',
                message: 'Lisensi sudah dinonaktifkan.'
            });
        }

        // =========================
        // INSERT QUEUE
        // =========================

        const { error } = await supabase
            .from('build_queue')
            .insert([
                {
                    bot_token: botToken,
                    auth_key: authKey,
                    zip_url: zipUrl,
                    user_id: userId,
                    chat_id: chatId,
                    mode,
                    is_premium: isPremium || false,
                    status: 'pending'
                }
            ]);

        if (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                error: 'FAILED_INSERT_QUEUE'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Antrean berhasil didaftarkan'
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: error.message
        });
    }
}