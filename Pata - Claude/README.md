# Objekt Pata — landing page

Statická landing page (`index.html`) + serverless funkcia na odosielanie formulára cez Resend.

## Štruktúra
- `index.html` — celá stránka (HTML/CSS/JS v jednom súbore)
- `api/contact.js` — Vercel serverless funkcia (formulár → Resend e-mail)
- `img-web/` — optimalizované fotografie a vizualizácie
- `assets/` — logá (SVG)

## Nasadenie (Vercel)
Vercel automaticky deteguje priečinok `api/` ako serverless funkcie — netreba build ani `vercel.json`.

### Potrebné premenné prostredia (Vercel → Settings → Environment Variables)
| Name | Value |
|---|---|
| `RESEND_API_KEY` | API kľúč z resend.com (`re_...`) |
| `CONTACT_TO` | `office@aksalcrown.com` (nepovinné, default) |
| `CONTACT_FROM` | `Objekt Pata <formular@aksalcrown.com>` (musí byť na overenej doméne) |

### Resend
1. Účet na resend.com → **API Keys** → vytvoriť kľúč.
2. **Domains** → pridať `aksalcrown.com` → vložiť SPF + DKIM DNS záznamy.
3. Po overení odosielať z adresy `@aksalcrown.com`.

## Lokálny test
```bash
npm i -g vercel
vercel dev
```
