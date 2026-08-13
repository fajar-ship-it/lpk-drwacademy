const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let sqlite = null;

function getSqlite() {
  if (sqlite === null) {
    try {
      sqlite = require("../basisdata");
    } catch (e) {
      sqlite = false;
    }
  }
  return sqlite || null;
}

function supabaseAda() {
  return !!(SUPABASE_URL && SUPABASE_KEY);
}

async function simpanPendaftaran(data) {
  if (supabaseAda()) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/pendaftaran`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ ...data, dibuat_pada: new Date().toISOString() }),
    });
    if (!res.ok) {
      const teks = await res.text().catch(() => "");
      throw new Error("Supabase insert gagal: " + res.status + " " + teks.slice(0, 120));
    }
    return { lastInsertRowid: null };
  }

  const db = getSqlite();
  if (!db) throw new Error("Database belum tersedia.");
  db.siapkanBasisdata();
  return db.simpanPendaftaran(data);
}

async function ambilPendaftaran() {
  if (supabaseAda()) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/pendaftaran?select=*&order=id.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (!res.ok) throw new Error("Supabase select gagal: " + res.status);
    return res.json();
  }

  const db = getSqlite();
  if (!db) throw new Error("Database belum tersedia.");
  db.siapkanBasisdata();
  return db.ambilPendaftaran();
}

module.exports = { simpanPendaftaran, ambilPendaftaran, supabaseAda };
