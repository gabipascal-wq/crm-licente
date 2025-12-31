"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Pipeline() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    supabase.from("leads").select("*").then(res => {
      setLeads(res.data || []);
    });
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Pipeline</h1>
      {leads.map(l => (
        <div key={l.id}>
          {l.nume_prenume} – {l.organizatie} – {l.etapa}
        </div>
      ))}
    </div>
  );
}