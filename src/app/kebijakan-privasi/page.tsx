import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "1. Informasi yang Dikumpulkan",
    content:
      "Kami mengumpulkan informasi yang Anda berikan saat login menggunakan akun Google, yaitu nama, alamat email, dan foto profil. Kami juga mengumpulkan data penggunaan seperti preset yang Anda simpan dan preferensi aplikasi untuk meningkatkan pengalaman Anda.",
  },
  {
    title: "2. Penggunaan Informasi",
    content:
      "Informasi yang kami kumpulkan digunakan untuk: (a) menyediakan dan memelihara layanan, (b) menyimpan preferensi dan preset Anda, (c) meningkatkan dan mempersonalisasi pengalaman pengguna, serta (d) berkomunikasi mengenai perubahan layanan.",
  },
  {
    title: "3. Penyimpanan Data",
    content:
      "Data akun Anda disimpan secara aman di server kami. Kami tidak menyimpan password Google Anda — autentikasi dilakukan sepenuhnya melalui OAuth 2.0 Google. Data sesi diamankan dengan token JWT terenkripsi.",
  },
  {
    title: "4. Berbagi Data dengan Pihak Ketiga",
    content:
      "Kami tidak menjual, menukar, atau menyewakan informasi pribadi Anda kepada pihak ketiga. Data hanya dapat dibagikan jika diwajibkan oleh hukum atau untuk melindungi hak dan keamanan platform kami.",
  },
  {
    title: "5. Keamanan Data",
    content:
      "Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data Anda dari akses tidak sah, perubahan, pengungkapan, atau penghancuran. Namun, tidak ada metode transmisi data di internet yang sepenuhnya aman.",
  },
  {
    title: "6. Hak Pengguna",
    content:
      "Anda berhak mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja. Untuk penghapusan akun dan data, Anda dapat menghubungi kami melalui informasi kontak yang tersedia di platform.",
  },
  {
    title: "7. Perubahan Kebijakan Privasi",
    content:
      "Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu. Perubahan akan diumumkan melalui platform. Dengan terus menggunakan layanan setelah perubahan, Anda menyetujui kebijakan yang telah diperbarui.",
  },
];

export default function KebijakanPrivasiPage() {
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
            <Shield className="h-5 w-5 text-(--accent)" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Kebijakan Privasi
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
