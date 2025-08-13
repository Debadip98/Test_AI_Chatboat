// Vercel serverless function (Node)
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args))

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages } = req.body || {}
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not set' })

    const referer = req.headers['origin'] || 'https://vercel.app'
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': referer,
        'X-Title': 'Final Chat App'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages
      })
    })

    const data = await resp.json()
    if (!resp.ok) {
      return res.status(resp.status).json(data)
    }
    return res.status(200).json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
