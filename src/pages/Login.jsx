import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login(){
  const [loading, setLoading] = useState(false)
  async function signIn(){
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin, queryParams: { prompt: 'consent' } }
    })
    setLoading(false)
  }
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',padding:20}}>
      <div style={{width:420}} className="panel">
        <h2 style={{margin:0}}>Welcome</h2>
        <p className="small">Sign in with Google to access the demo</p>
        <button className="btn" style={{marginTop:12}} onClick={signIn} disabled={loading}>{loading ? 'Opening...' : 'Sign in with Google'}</button>
      </div>
    </div>
  )
}
