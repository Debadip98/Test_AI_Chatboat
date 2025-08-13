import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (data.session) navigate('/chat', { replace: true })
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      if (sess) navigate('/chat', { replace: true })
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  const signInWithGoogle = async () => {
    const redirectTo = window.location.origin + '/chat'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-slate-300 mt-1">Sign in to start chatting</p>
        </div>
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-3 rounded-xl hover:bg-slate-100 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.23 3.6l6.85-6.85C35.64 2.67 30.14 0 24 0 14.64 0 6.4 5.3 2.45 13l7.98 6.2C12.07 13.4 17.55 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.15 24.5c0-1.59-.14-3.13-.4-4.6H24v9.05h12.45c-.54 2.9-2.14 5.36-4.54 7.02l7.17 5.54c4.2-3.88 6.62-9.62 6.62-16.01z"/>
            <path fill="#FBBC05" d="M10.43 28.22c-.63-1.9-.99-3.93-.99-6.02 0-2.09.36-4.12.99-6.02l-7.98-6.2C.88 13.88 0 18.79 0 24c0 5.21.88 10.12 2.45 14.02l7.98-6.2z"/>
            <path fill="#34A853" d="M24 48c6.14 0 11.64-2.02 15.54-5.49l-7.17-5.54c-2 1.35-4.53 2.14-7.37 2.14-6.45 0-11.93-3.9-14.57-9.43l-7.98 6.2C6.4 42.7 14.64 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}
