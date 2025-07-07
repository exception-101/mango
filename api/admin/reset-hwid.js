import { kv } from '@vercel/kv';

const AUTHORIZED_USERS = ['1367484802336555069', '1358905288035537026'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { discord_id, license_key } = req.body;

  if (!AUTHORIZED_USERS.includes(discord_id)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const licenseData = await kv.get(`license:${license_key}`);
    
    if (!licenseData) {
      return res.status(404).json({ error: 'License not found' });
    }

    licenseData.hwid = null;
    await kv.set(`license:${license_key}`, licenseData);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('KV error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
