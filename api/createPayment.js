export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, name, email, message, description } = req.body || {};

    if (!process.env.MOLLIE_API_KEY) {
      return res.status(500).json({ error: "MOLLIE_API_KEY ontbreekt" });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Ongeldig bedrag" });
    }

    const mollieResponse = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: Number(amount).toFixed(2)
        },
        description: description || "Gutschein Alt Grieth",
        redirectUrl: "https://voucherfront.vercel.app/success.html",
        metadata: {
          name: name || "",
          email: email || "",
          message: message || "",
          amount: Number(amount).toFixed(2)
        }
      })
    });

    const data = await mollieResponse.json();

    if (!mollieResponse.ok) {
      return res.status(500).json(data);
    }

    return res.status(200).json({
      id: data.id,
      checkoutUrl: data._links.checkout.href
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
