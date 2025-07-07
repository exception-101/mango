import { kv } from '@vercel/kv';

const AUTHORIZED_USERS = ['1367484802336555069', '1358905288035537026'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { discord_id, duration_days = 30, license_key, for_user } = req.body;

  if (!AUTHORIZED_USERS.includes(discord_id)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration_days);

    const licenseData = {
      license_key: license_key,
      hwid: null,
      created_by: discord_id,
      for_user: for_user || null,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      last_used: null,
      active: true
    };

    await kv.set(`license:${license_key}`, licenseData);
    await kv.sadd('all_licenses', license_key);

    return res.status(200).json({ 
      success: true, 
      license_key: license_key,
      expires_at: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('KV error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
