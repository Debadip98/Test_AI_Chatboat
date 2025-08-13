import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import MessageBubble from '../components/MessageBubble'
import { sendMessage } from '../lib/openrouter'

export default function Chat() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything 😄' }
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [dark, setDark] = useState(true)
  const fileInputRef = useRef(null)

  // voice state
  const [recognizing, setRecognizing] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // theme
    const root = document.documentElement
    if (dark) root.classList.add('dark'); else root.classList.remove('dark')

    // auth
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      if (!data.user) {
        navigate('/', { replace: true })
      } else {
        setUser(data.user)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        navigate('/', { replace: true })
      } else {
        setUser(session.user)
      }
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [navigate, dark])

  const onSignOut = async () => {
    await supabase.auth.signOut()
    // hard redirect to clear any in-memory state
    window.location.href = '/'
  }

  const onSend = async () => {
    const text = input.trim()
    if (!text) return
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setThinking(true)
    try {
      const data = await sendMessage(next.map(m => ({ role: m.role, content: m.content })))
      const ai = data?.choices?.[0]?.message?.content || '(No response)'
      setMessages(curr => [...curr, { role: 'assistant', content: ai }])
    } catch (e) {
      setMessages(curr => [...curr, { role: 'assistant', content: 'Error calling AI: ' + e.message }])
    } finally {
      setThinking(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  // voice input (Web Speech API)
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.')
      return
    }
    if (!recognitionRef.current) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        setInput(v => (v ? v + ' ' : '') + transcript)
      }
      rec.onend = () => setRecognizing(false)
      recognitionRef.current = rec
    }
    if (!recognizing) {
      setRecognizing(true)
      recognitionRef.current.start()
    } else {
      recognitionRef.current.stop()
    }
  }

  // file upload → Supabase Storage (bucket name in env)
  const onFilePicked = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!user) return
    const bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'public'
    const path = `${user.id}/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
    })
    if (error) {
      setMessages(curr => [...curr, { role: 'assistant', content: `Upload error: ${error.message}` }])
    } else {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      setMessages(curr => [
        ...curr,
        { role: 'user', content: `Uploaded: ${file.name}\n${urlData.publicUrl}` }
      ])
    }
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-900/60 border-b border-slate-200/40 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Chat App</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(d => !d)}
              className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {dark ? 'Light' : 'Dark'}
            </button>
            <div className="text-xs opacity-75 mr-2">{user?.email}</div>
            <button
              onClick={onSignOut}
              className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-32">
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            role={m.role === 'assistant' ? 'assistant' : 'user'}
            text={m.content}
          />
        ))}
        {thinking && <MessageBubble role="assistant" thinking />}
      </main>

      <div className="fixed bottom-0 inset-x-0 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none"
            />
            <button
              onClick={toggleVoice}
              className={`px-3 py-3 rounded-2xl border text-sm ${recognizing ? 'border-blue-500' : 'border-slate-300 dark:border-slate-700'}`}
              title="Voice input"
            >
              🎤
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={onFilePicked}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-sm"
              title="Upload file"
            >
              📎
            </button>

            <button
              onClick={onSend}
              className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
