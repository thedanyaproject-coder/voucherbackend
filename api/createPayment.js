import fetch from 'node-fetch';

export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, amount, code, text } = req.body;
  if(!amount || !name || !code) return res.status(400).json({ error: 'Missing fields' });

  try {
    const response = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: { currency: 'EUR', value: amount.toString() },
        description: `Voucher ${code} für ${name}`,
        redirectUrl: `https://www.altgrieth.de/danke?code=${code}`,
        webhookUrl: `https://jouw-backend-url.com/api/mollieWebhook`,
        metadata: { name, code, text }
      })
    });

    const data = await response.json();
    return res.status(200).json({ checkoutUrl: data._links.checkout.href });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
