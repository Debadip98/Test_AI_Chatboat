export async function sendMessage(messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'OpenRouter call failed')
  }
  return res.json()
}
