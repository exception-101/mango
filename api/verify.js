import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { license, hwid } = req.body;

  if (!license || !hwid) {
    return res.status(400).json({ valid: false, error: 'Missing license or hwid' });
  }

  try {
    const licenseData = await kv.get(`license:${license}`);
    
    if (!licenseData) {
      return res.status(200).json({ valid: false });
    }

    if (new Date(licenseData.expires_at) < new Date()) {
      return res.status(200).json({ valid: false });
    }

    if (!licenseData.active) {
      return res.status(200).json({ valid: false });
    }

    if (licenseData.hwid && licenseData.hwid !== hwid) {
      return res.status(200).json({ valid: false });
    }

    if (!licenseData.hwid) {
      licenseData.hwid = hwid;
      await kv.set(`license:${license}`, licenseData);
    }

    licenseData.last_used = new Date().toISOString();
    await kv.set(`license:${license}`, licenseData);

    return res.status(200).json({ valid: true });

  } catch (error) {
    console.error('KV error:', error);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
