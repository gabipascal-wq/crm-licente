"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Pipeline() {
  const [leads, setLeads] = useState<any[]>([]);
    const [form, setForm] = useState({
    nume_prenume: "",
    telefon: "",
    organizatie: "",
    localitate: "",
    etapa: "pipeline"
  });

  async function loadLeads() {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data || []);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function addLead() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    await supabase.from("leads").insert({
      ...form,
      owner_id: user.id,
      localitate: "N/A"
    });

    setForm({ nume_prenume: "", telefon: "", organizatie: "", etapa: "pipeline" });
    loadLeads();
  }

  async function updateStage(id: number, etapa: string) {
    await supabase.from("leads").update({ etapa }).eq("id", id);
    loadLeads();
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Pipeline</h1>

      <h2>Add Lead</h2>
      <input placeholder="Nume" value={form.nume_prenume} onChange={e=>setForm({...form, nume_prenume:e.target.value})}/>
      <input placeholder="Telefon" value={form.telefon} onChange={e=>setForm({...form, telefon:e.target.value})}/>
      <input placeholder="Organizatie" value={form.organizatie} onChange={e=>setForm({...form, organizatie:e.target.value})}/>
      <input placeholder="Localitate" value={form.localitate} onChange={e=>setForm({...form, localitate:e.target.value})}/>
      <select value={form.etapa} onChange={e=>setForm({...form, etapa:e.target.value})}>
        <option value="pipeline">Pipeline</option>
        <option value="appointment">Appointment</option>
        <option value="prezentare">Prezentare</option>
        <option value="contract">Contract</option>
        <option value="onboarding">Onboarding</option>
      </select>
      <button onClick={addLead}>Add</button>

      <hr/>

      {leads.map(l => (
        <div key={l.id} style={{ marginBottom: 10 }}>
          <b>{l.nume_prenume}</b> — {l.organizatie} — 
          <select value={l.etapa} onChange={e=>updateStage(l.id, e.target.value)}>
            <option value="pipeline">Pipeline</option>
            <option value="appointment">Appointment</option>
            <option value="prezentare">Prezentare</option>
            <option value="contract">Contract</option>
            <option value="onboarding">Onboarding</option>
          </select>
        </div>
      ))}
    </div>
  );
}
