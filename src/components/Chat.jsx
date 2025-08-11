import React, { useEffect, useRef, useState } from 'react'
import { openrouterChat } from '../lib/openrouter'

export default function Chat(){
  const [messages, setMessages] = useState([{id:1,from:'bot',text:'Hi — ask me about places, upload images, or chat.'}])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [file, setFile] = useState(null)
  const endRef = useRef(null)

  useEffect(()=> endRef.current?.scrollIntoView({behavior:'smooth'}), [messages])

  async function send(e){
    e?.preventDefault()
    const t = input.trim()
    if (!t) return
    setMessages(m => [...m, {id:Date.now(), from:'user', text:t}])
    setInput('')
    setTyping(true)
    try {
      const reply = await openrouterChat(t)
      setMessages(m => [...m, {id:Date.now()+1, from:'bot', text: reply || 'No reply'}])
      speak(reply || 'No reply')
    } catch(err){
      setMessages(m => [...m, {id:Date.now()+1, from:'bot', text: 'Error: ' + err.message}])
    } finally { setTyping(false) }
  }

  function speak(text){
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  function startVoice(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Speech recognition not supported')
    const r = new SR()
    r.lang = 'en-US'
    r.onresult = ev => setInput(ev.results[0][0].transcript)
    r.start()
  }

  async function uploadAndSend(){
    if (!file) return alert('Pick a file first')
    setMessages(m => [...m, {id:Date.now(), from:'user', text: 'Uploaded file: ' + file.name}])
    setFile(null)
  }

  return (
    <div>
      <div className="chat-area">
        <div className="chat-window">
          {messages.map(m=>(
            <div key={m.id} style={{display:'flex',flexDirection:'column',alignItems: m.from==='user' ? 'flex-end' : 'flex-start'}}>
              <div className={m.from==='user' ? 'bubble-user' : 'bubble-bot'}>{m.text}</div>
            </div>
          ))}
          {typing && <div className="small">Bot is typing…</div>}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} style={{display:'flex',gap:8,alignItems:'center'}}>
          <button type="button" onClick={startVoice} className="btn">🎤</button>
          <input type="file" onChange={e=>setFile(e.target.files?.[0] ?? null)} style={{display:'none'}} id="chat-file" />
          <label htmlFor="chat-file" className="filebtn">📎</label>
          <input className="input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Say something..." />
          <button className="btn" type="submit">Send</button>
          <button type="button" onClick={uploadAndSend} className="btn" style={{background:'#10b981'}}>Upload</button>
        </form>
      </div>
    </div>
  )
}
