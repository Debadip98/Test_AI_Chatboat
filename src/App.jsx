import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App(){
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('chat')

  useEffect(()=>{
    async function init(){
      const { data } = await supabase.auth.getSession()
      setSession(data?.session ?? null)
      setLoading(false)
    }
    init()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return ()=> sub?.subscription?.unsubscribe?.()
  },[])

  if (loading) return <div style={{padding:40}}>Loading...</div>
  if (!session) return <Login />
  return <Dashboard session={session} view={view} setView={setView} />
}
