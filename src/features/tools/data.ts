export type ToolItem = {
  slug: string;
  title: string;
  description: string;
  category?: string;
};

export const tools: ToolItem[] = [
  {
    slug: "stock-analysis",
    title: "Stock Analysis",
    description:
      "Analisis saham teknikal dan fundamental dengan indikator RSI, MACD, MA, serta data profil emiten dan rating analis.",
    category: "Analisis",
  },
  {
    slug: "foreign-flow",
    title: "Foreign Flow",
    description:
      "Pantau net buy asing, broker aktif, dan arah rotasi sektor yang sedang diburu pasar.",
    category: "Flow",
  },
  {
    slug: "uw-tracker",
    title: "UW Tracker",
    description:
      "Lacak saham yang sedang dipegang underwriter untuk melihat potensi distribusi dan akumulasi.",
    category: "Analisis",
  },
  {
    slug: "konglo-tracker",
    title: "Konglo Tracker",
    description:
      "Pantau dan analisis saham-saham dari konglomerat besar Indonesia dengan data PBV, PER, dan return periode.",
    category: "Analisis",
  },
  {
    slug: "ara-arb-calculator",
    title: "ARA/ARB Calculator",
    description:
      "Simulasi auto rejection atas & bawah dengan fraksi harga BEI untuk menghitung batas pergerakan harga harian.",
    category: "Kalkulator",
  },
  {
    slug: "ipo-allotment-predictor",
    title: "IPO Allotment Predictor",
    description:
      "Estimasi jatah lot saham IPO berdasarkan jumlah pemesanan, total investor, dan skema pooling ritel.",
    category: "Kalkulator",
  },
  {
    slug: "stock-average-calculator",
    title: "Stock Average Calculator",
    description:
      "Hitung rata-rata harga pembelian saham dari beberapa transaksi dengan harga dan jumlah lot berbeda.",
    category: "Kalkulator",
  },
  {
    slug: "dividend-calculator",
    title: "Dividend Calculator",
    description:
      "Hitung total dividen yang diterima dari suatu saham, baik sebelum maupun setelah pajak.",
    category: "Kalkulator",
  },
  {
    slug: "right-issue-calculator",
    title: "RI Calculator",
    description:
      "Hitung harga teoritis saham setelah right issue, jumlah saham baru, dan potensi dilusi kepemilikan.",
    category: "Kalkulator",
  },
  {
    slug: "fibonacci-retracement-calculator",
    title: "Fibonacci Retracement Calculator",
    description:
      "Hitung level-level Fibonacci retracement untuk analisis teknikal support dan resistance.",
    category: "Kalkulator",
  },
  {
    slug: "value-at-risk-calculator",
    title: "Value at Risk (VaR) Calculator",
    description:
      "Hitung potensi kerugian maksimal portfolio dalam periode tertentu dengan metode parametrik VaR.",
    category: "Kalkulator",
  },
  {
    slug: "dca-calculator",
    title: "DCA Calculator",
    description:
      "Simulasi strategi Dollar Cost Averaging dengan modal rutin bulanan untuk akumulasi saham bertahap.",
    category: "Kalkulator",
  },
];
