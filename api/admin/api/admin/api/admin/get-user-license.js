import { kv } from '@vercel/kv';

const AUTHORIZED_USERS = ['1367484802336555069', '1358905288035537026'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { discord_id, user_id } = req.query;

  if (!AUTHORIZED_USERS.includes(discord_id)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const allLicenseKeys = await kv.smembers('all_licenses');
    
    for (const key of allLicenseKeys) {
      const licenseData = await kv.get(`license:${key}`);
      if (licenseData && licenseData.for_user === user_id && licenseData.active) {
        return res.status(200).json({ found: true, license: licenseData });
      }
    }

    return res.status(200).json({ found: false });

  } catch (error) {
    console.error('KV error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
