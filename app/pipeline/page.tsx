"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Stage = "PIPELINE" | "APPOINTMENT" | "PREZENTARE" | "CONTRACT" | "ONBOARDING";

type Lead = {
  id: string;
  nume_prenume: string;
  telefon: string;
  organizatie: string;
  localitate: string;
  etapa: Stage;
  ranking?: number;
};

const STAGES: { value: Stage; label: string }[] = [
  { value: "PIPELINE", label: "Pipeline" },
  { value: "APPOINTMENT", label: "Appointment" },
  { value: "PREZENTARE", label: "Prezentare" },
  { value: "CONTRACT", label: "Contract" },
  { value: "ONBOARDING", label: "Onboarding" }
];

export default function PipelinePage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState({
    nume_prenume: "",
    telefon: "",
    organizatie: "",
    localitate: "",
    etapa: "PIPELINE" as Stage,
    ranking: 50
  });

  const stageOptions = useMemo(() => STAGES, []);

  async function getAuthedUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const user = data?.user;
    if (!user) throw new Error("Not authenticated");
    return user;
  }

  async function loadLeadsOnce() {
    setError("");
    try {
      const user = await getAuthedUser();
      setUserEmail(user.email || "");

      const { data, error } = await supabase
  .from("leads")
  .insert({...})
  .select()
  .single()

if (error) throw error

setLeads(prev => [data, ...prev])
    } catch (e: any) {
      const msg = e?.message || "Eroare necunoscută";
      setError(msg);
      if (msg.includes("Not authenticated")) window.location.href = "/login";
    }
  }

  useEffect(() => {
    loadLeadsOnce();
    // IMPORTANT: fără deps => rulează o singură dată
  }, []);

  async function addLead() {
    setError("");
    try {
      const user = await getAuthedUser();

      if (!form.nume_prenume || !form.telefon || !form.organizatie || !form.localitate) {
        setError("Completează nume, telefon, organizație și localitate.");
        return;
      }

      const res = await supabase.from("leads").insert({
        nume_prenume: form.nume_prenume,
        telefon: form.telefon,
        organizatie: form.organizatie,
        localitate: form.localitate,
        etapa: form.etapa,
        ranking: form.ranking,
        owner_id: user.id
      });

      if (res.error) throw res.error;

      setForm({
        nume_prenume: "",
        telefon: "",
        organizatie: "",
        localitate: "",
        etapa: "PIPELINE",
        ranking: 50
      });

      await loadLeadsOnce();
    } catch (e: any) {
      setError(e?.message || "Eroare la adăugare lead");
    }
  }

  async function updateStage(id: string, etapa: Stage) {
    setError("");
    try {
      const res = await supabase.from("leads").update({ etapa }).eq("id", id);
      if (res.error) throw res.error;
      await loadLeadsOnce();
    } catch (e: any) {
      setError(e?.message || "Eroare la schimbare etapă");
    }
  }

  async function doLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Pipeline</h1>
        <div>
          <span style={{ marginRight: 12 }}>{userEmail}</span>
          <button onClick={doLogout}>Logout</button>
        </div>
      </div>

      <h2>Add Lead</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Nume și prenume"
          value={form.nume_prenume}
          onChange={(e) => setForm({ ...form, nume_prenume: e.target.value })}
        />
        <input
          placeholder="Telefon"
          value={form.telefon}
          onChange={(e) => setForm({ ...form, telefon: e.target.value })}
        />
        <input
          placeholder="Organizație"
          value={form.organizatie}
          onChange={(e) => setForm({ ...form, organizatie: e.target.value })}
        />
        <input
          placeholder="Localitate"
          value={form.localitate}
          onChange={(e) => setForm({ ...form, localitate: e.target.value })}
        />
        <input
          type="number"
          placeholder="Ranking (1-100)"
          value={form.ranking}
          onChange={(e) => setForm({ ...form, ranking: Number(e.target.value) || 50 })}
          style={{ width: 140 }}
        />
        <select value={form.etapa} onChange={(e) => setForm({ ...form, etapa: e.target.value as Stage })}>
          {stageOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button onClick={addLead}>Add</button>
      </div>

      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      <hr />

      {leads.length === 0 ? <p>Nu există leaduri încă.</p> : null}

      {leads.map((l) => (
        <div key={l.id} style={{ marginBottom: 10 }}>
          <b>{l.nume_prenume}</b> — {l.organizatie} — {l.localitate} —{" "}
          <select value={l.etapa} onChange={(e) => updateStage(l.id, e.target.value as Stage)}>
            {stageOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
