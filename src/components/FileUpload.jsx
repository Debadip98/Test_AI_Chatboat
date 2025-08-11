import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function FileUpload(){
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'public'

  async function upload(){
    if (!file) return alert('Pick a file')
    setLoading(true)
    const fileName = `${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
    setLoading(false)
    if (error) return alert('Upload error: ' + error.message)
    const url = supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
    alert('Uploaded! Public URL:\n' + url)
  }

  return (
    <div>
      <div className="small" style={{marginBottom:8}}>Upload a file to Supabase storage</div>
      <input type="file" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      <div style={{marginTop:8}}>
        <button onClick={upload} className="btn" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
      </div>
    </div>
  )
}
