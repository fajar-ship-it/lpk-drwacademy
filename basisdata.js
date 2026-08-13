const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "basisdata.sqlite");

let db = null;

function siapkanBasisdata() {
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");

  db.exec(`
    CREATE TABLE IF NOT EXISTS pendaftaran (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT,
      program TEXT NOT NULL,
      paket TEXT,
      alamat TEXT,
      pesan TEXT,
      dibuat_pada TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_pendaftaran_dibuat ON pendaftaran(dibuat_pada);
  `);

  return db;
}

function simpanPendaftaran(data) {
  const stmt = db.prepare(`
    INSERT INTO pendaftaran (nama, whatsapp, email, program, paket, alamat, pesan, dibuat_pada)
    VALUES (@nama, @whatsapp, @email, @program, @paket, @alamat, @pesan, @dibuat_pada)
  `);
  return stmt.run({ ...data, dibuat_pada: new Date().toISOString() });
}

function ambilPendaftaran() {
  return db.prepare("SELECT * FROM pendaftaran ORDER BY id DESC").all();
}

module.exports = { siapkanBasisdata, simpanPendaftaran, ambilPendaftaran };
