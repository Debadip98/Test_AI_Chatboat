export async function openrouterChat(message){
  const key = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!key) throw new Error('OpenRouter API key missing. Set VITE_OPENROUTER_API_KEY in .env')
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message }
      ],
      max_tokens: 512
    })
  })
  if (!res.ok){
    const text = await res.text()
    throw new Error('OpenRouter error: '+text)
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || (data?.output?.[0]) || null
  return content
}
export default { openrouterChat }
