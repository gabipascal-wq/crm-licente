"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) setError(error.message);
    else window.location.href = "/pipeline";
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>CRM Licente - Login</h1>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><br/><br/>
      <input type="password" placeholder="Parola" value={password} onChange={e=>setPassword(e.target.value)} /><br/><br/>
      <button onClick={login}>Login</button>
      <p style={{ color: "red" }}>{error}</p>
    </div>
  );
}