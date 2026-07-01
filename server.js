require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 3011;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

const app = express();
app.use(express.json());

function checkToken(req, res, next) {
  const token = req.get('X-Auth-Token') || req.query.token;
  if (!AUTH_TOKEN || token !== AUTH_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'line-call-notify' });
});

app.post('/notify', checkToken, async (req, res) => {
  if (!DISCORD_WEBHOOK_URL) {
    return res.status(500).json({ error: 'DISCORD_WEBHOOK_URL not configured' });
  }
  const { caller, note } = req.body || {};
  let content = '📞 LINE通話の着信がありました';
  if (caller) content += `（発信者: ${caller}）`;
  if (note) content += `\n${note}`;

  try {
    const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!discordRes.ok) {
      const text = await discordRes.text();
      return res.status(502).json({ error: 'discord webhook failed', detail: text });
    }
    res.json({ status: 'sent' });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[line-call-notify] listening on 127.0.0.1:${PORT}`);
});
