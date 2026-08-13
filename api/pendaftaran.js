const { simpanPendaftaran, ambilPendaftaran, supabaseAda } = require("../lib/pendaftaran");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "drwadmin2026";

function bersihkan(teks) {
  return typeof teks === "string" ? teks.replace(/<[^>]*>/g, "").trim().slice(0, 500) : "";
}

module.exports = async function handler(req, res) {
  if (req.method === "POST") {
    try {
      if (!supabaseAda()) {
        return res.status(503).json({
          berhasil: false,
          pesan: "Database belum dikonfigurasi. Silakan daftar via WhatsApp 0811-2649-051.",
        });
      }

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

      const hasil = await simpanPendaftaran({
        nama,
        whatsapp,
        email: bersihkan(b.email),
        program,
        paket: bersihkan(b.paket),
        alamat: bersihkan(b.alamat),
        pesan: bersihkan(b.pesan),
      });

      return res.json({
        berhasil: true,
        pesan: "Pendaftaran berhasil dikirim. Admin akan menghubungi Anda via WhatsApp.",
        id: hasil.lastInsertRowid || null,
      });
    } catch (err) {
      console.error("[ERROR]", err.message);
      return res.status(500).json({ berhasil: false, pesan: "Terjadi kesalahan server." });
    }
  }

  if (req.method === "GET") {
    try {
      if (!supabaseAda()) {
        return res.status(503).json({
          berhasil: false,
          pesan: "Database belum dikonfigurasi.",
        });
      }
      const password = String(req.query.password || "");
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ berhasil: false, pesan: "Password salah." });
      }
      const data = await ambilPendaftaran();
      return res.json({ berhasil: true, data });
    } catch (err) {
      console.error("[ERROR]", err.message);
      return res.status(500).json({ berhasil: false, pesan: "Terjadi kesalahan server." });
    }
  }

  return res.status(405).json({ berhasil: false, pesan: "Metode tidak diizinkan." });
};
