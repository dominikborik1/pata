// Vercel serverless funkcia — odoslanie formulára cez Resend
// Env premenné (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  – povinné, API kľúč z resend.com
//   CONTACT_TO      – nepovinné, kam chodia dopyty (default office@aksalcrown.com)
//   CONTACT_FROM    – nepovinné, odosielateľ na overenej doméne
//                     (default "Objekt Pata <formular@aksalcrown.com>")

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // telo môže prísť ako objekt (Vercel ho parsuje) alebo ako string
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const interest = String(body.interest || '').trim();
    const honey = String(body.company || '').trim(); // honeypot proti spamu

    // spam-bot vyplnil skryté pole → tvárime sa, že OK, ale neposielame
    if (honey) return res.status(200).json({ ok: true });

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Chýba meno alebo platný e-mail.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Chýba RESEND_API_KEY');
      return res.status(500).json({ error: 'Server nie je nakonfigurovaný.' });
    }

    const to = process.env.CONTACT_TO || 'office@aksalcrown.com';
    const from = process.env.CONTACT_FROM || 'Objekt Pata <formular@aksalcrown.com>';
    const esc = (s) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

    const html = `
      <div style="font-family:Arial,sans-serif;color:#182521;line-height:1.6">
        <h2 style="color:#0f3d2e;margin:0 0 12px">Nový dopyt — Objekt Pata</h2>
        <p><strong>Meno:</strong> ${esc(name)}</p>
        <p><strong>E-mail:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
        <p><strong>Záujem o:</strong> ${esc(interest || '—')}</p>
        <hr style="border:none;border-top:1px solid #e3eae5;margin:16px 0">
        <p style="font-size:12px;color:#5b6b62">Odoslané z landing page Objekt Pata.</p>
      </div>`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Dopyt z webu Pata — ${name}`,
        html,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Resend error:', resp.status, detail);
      return res.status(502).json({ error: 'E-mail sa nepodarilo odoslať.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Neočakávaná chyba.' });
  }
}
