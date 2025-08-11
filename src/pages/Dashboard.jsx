import React from 'react'
import { supabase } from '../lib/supabaseClient'
import Chat from '../components/Chat'
import FileUpload from '../components/FileUpload'

export default function Dashboard({ session, view, setView }){
  async function signOut(){
    await supabase.auth.signOut()
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Minimal Chat</div>
        <div className="small">Signed in as</div>
        <div style={{fontWeight:600}}>{session.user.email}</div>

        <nav className="nav" style={{marginTop:12}}>
          <button onClick={() => setView('chat')}>Chat</button>
          <button onClick={() => setView('upload')}>Upload</button>
          <button onClick={() => setView('maplink')}>Open Google Maps</button>
        </nav>

        <div style={{marginTop:'auto'}}>
          <button onClick={signOut} className="btn" style={{background:'#ef4444'}}>Sign out</button>
        </div>
      </aside>

      <main className="content">
        <div className="header">
          <div>
            <h3 style={{margin:0}}>Chat & Tools</h3>
            <div className="small">Simple demo with OpenRouter GPT-3.5</div>
          </div>
        </div>

        <div>
          {view==='chat' && <div className="panel"><Chat /></div>}
          {view==='upload' && <div className="panel"><FileUpload /></div>}
          {view==='maplink' && <div className="panel"><h4>Open Google Maps</h4><p className="small">Opens in a new tab for searching restaurants and places.</p><p><a className="btn" href="https://www.google.com/maps" target="_blank" rel="noreferrer">Open Maps</a></p></div>}
        </div>
      </main>
    </div>
  )
}
