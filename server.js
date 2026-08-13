const express = require("express");
const path = require("path");
const { siapkanBasisdata, simpanPendaftaran, ambilPendaftaran } = require("./basisdata");

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "drwadmin2026";

const app = express();
app.use(express.json({ limit: "64kb" }));
app.use(express.static(path.join(__dirname, ".")));

siapkanBasisdata();

function bersihkan(teks) {
  return typeof teks === "string" ? teks.replace(/<[^>]*>/g, "").trim().slice(0, 500) : "";
}

// ── POST /api/pendaftaran ────────────────────────────
app.post("/api/pendaftaran", (req, res) => {
  try {
    const b = req.body || {};

    if (b.website) {
      return res.json({ berhasil: false, pesan: "Spam terdeteksi." });
    }

    const nama = bersihkan(b.nama);
    const whatsapp = bersihkan(b.whatsapp);
    const program = bersihkan(b.program);

    if (!nama || !whatsapp || !program) {
      return res
        .status(400)
        .json({ berhasil: false, pesan: "Nama, WhatsApp, dan Program wajib diisi." });
    }

    const hasil = simpanPendaftaran({
      nama,
      whatsapp,
      email: bersihkan(b.email),
      program,
      paket: bersihkan(b.paket),
      alamat: bersihkan(b.alamat),
      pesan: bersihkan(b.pesan),
    });

    res.json({
      berhasil: true,
      pesan: "Pendaftaran berhasil dikirim. Admin akan menghubungi Anda via WhatsApp.",
      id: hasil.lastInsertRowid,
    });
  } catch (err) {
    console.error("[ERROR]", err.message);
    res.status(500).json({ berhasil: false, pesan: "Terjadi kesalahan server." });
  }
});

// ── GET /api/pendaftaran (admin) ─────────────────────
app.get("/api/pendaftaran", (req, res) => {
  const password = String(req.query.password || "");
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ berhasil: false, pesan: "Password salah." });
  }
  res.json({ berhasil: true, data: ambilPendaftaran() });
});

app.listen(PORT, () => {
  console.log(`LPK DRW Academy berjalan di http://localhost:${PORT}`);
  console.log(`Halaman admin: http://localhost:${PORT}/admin/`);
});
