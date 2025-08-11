import React from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: supabase.auth.options.redirectTo,
      },
    });

    if (error) console.error('Error signing in:', error.message);
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
}
