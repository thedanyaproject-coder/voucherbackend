export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, amount, code, text } = req.body;

    if (!amount || !code) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const response = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: Number(amount).toFixed(2)
        },
        description: `Gutschein ${code}${name ? ' für ' + name : ''}`,
        redirectUrl: 'https://www.altgrieth.de/danke',
        metadata: {
          name: name || '',
          code: code || '',
          text: text || ''
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Mollie API error',
        details: data
      });
    }

    return res.status(200).json({
      checkoutUrl: data._links.checkout.href
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}
