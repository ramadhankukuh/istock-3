import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "1. Penerimaan Ketentuan",
    content:
      "Dengan mengakses dan menggunakan iStock, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan sebagian atau seluruh ketentuan, mohon untuk tidak menggunakan layanan kami.",
  },
  {
    title: "2. Penggunaan Layanan",
    content:
      "iStock menyediakan informasi dan alat analisis pasar saham untuk tujuan informasi dan edukasi. Keputusan investasi sepenuhnya berada di tangan Anda. iStock tidak bertanggung jawab atas kerugian yang timbul dari keputusan investasi yang dibuat berdasarkan informasi dari platform ini.",
  },
  {
    title: "3. Akun Pengguna",
    content:
      "Anda bertanggung jawab penuh atas kerahasiaan akun dan password Anda. Setiap aktivitas yang terjadi dalam akun Anda adalah tanggung jawab Anda. Anda setuju untuk segera memberi tahu kami jika terjadi akses tidak sah ke akun Anda.",
  },
  {
    title: "4. Batasan Tanggung Jawab",
    content:
      "iStock tidak bertanggung jawab atas kerusakan langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami, termasuk namun tidak terbatas pada kerugian investasi.",
  },
  {
    title: "5. Kekayaan Intelektual",
    content:
      "Semua konten, fitur, dan fungsionalitas iStock dilindungi oleh hak cipta, merek dagang, dan hukum kekayaan intelektual lainnya. Dilarang mereproduksi, mendistribusikan, atau membuat karya turunan tanpa izin tertulis.",
  },
  {
    title: "6. Perubahan Ketentuan",
    content:
      "Kami berhak mengubah Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan diumumkan melalui platform. Dengan terus menggunakan layanan setelah perubahan, Anda dianggap menyetujui ketentuan yang telah diperbarui.",
  },
];

export default function SyaratKetentuanPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-8 py-8 sm:py-12">
      <div>
        <Link
          href="/settings"
          className="focus-ring mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Settings
        </Link>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-(--border) bg-(--surface-strong)">
            <FileText className="h-5 w-5 text-(--accent)" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Syarat dan Ketentuan
            </h1>
            <p className="text-sm text-muted">
              Terakhir diperbarui: 24 Juli 2026
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-6"
          >
            <h2 className="mb-2 text-base font-semibold">{section.title}</h2>
            <p className="text-sm leading-relaxed text-muted">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
