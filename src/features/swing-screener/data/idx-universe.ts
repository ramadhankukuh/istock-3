/**
 * Universe ticker saham IDX untuk Swing Trade Screener.
 *
 * Daftar ini berisi saham-saham likuid yang masuk radar swing trader harian —
 * bukan seluruh ~900 emiten IDX. Universe yang lebih kecil ini menjaga runtime
 * cron tetap wajar sambil tetap mencakup saham-saham yang paling mungkin
 * menghasilkan setup swing yang layak.
 *
 * Format: kode saham tanpa suffix ".JK" (dengan huruf kapital).
 */
export const idxUniverse: string[] = [
  // ── Perbankan & finansial ──
  "BBCA",
  "BBRI",
  "BMRI",
  "BBNI",
  "BBTN",
  "BRIS",
  "ARTO",
  "BBYB",
  "BDMN",
  "BNGA",
  "NISP",
  "BJBR",
  "BJTM",
  "MEGA",
  "PNBN",
  "BTPN",
  "AGRS",
  "MAYA",
  "BINA",

  // ── Telekomunikasi ──
  "TLKM",
  "ISAT",
  "EXCL",
  "TOWR",
  "TBIG",
  "MTEL",
  "FREN",

  // ── Konsumer & ritel ──
  "ICBP",
  "INDF",
  "UNVR",
  "MYOR",
  "GGRM",
  "HMSP",
  "KLBF",
  "SIDO",
  "MLBI",
  "DLTA",
  "ULTJ",
  "ACES",
  "MAPI",
  "RALS",
  "ERAA",
  "AMRT",
  "MIDI",
  "BUDI",
  "TSPC",
  "KAEF",
  "DVLA",

  // ── Energi & tambang ──
  "ADRO",
  "PTBA",
  "ITMG",
  "ANTM",
  "INCO",
  "MDKA",
  "BRPT",
  "TPIA",
  "BREN",
  "CUAN",
  "BUMI",
  "DEWA",
  "MEDC",
  "PGAS",
  "AKRA",
  "ELSA",
  "SOCI",
  "ASSA",
  "AADI",
  "ADMR",
  "HRUM",
  "TINS",
  "KKGI",
  "INDY",
  "ENRG",

  // ── Properti ──
  "CTRA",
  "BSDE",
  "PWON",
  "SMRA",
  "ASRI",
  "LPKR",
  "JRPT",
  "MTLA",
  "DMAS",
  "MKPI",
  "KIJA",

  // ── Teknologi & media ──
  "GOTO",
  "BUKA",
  "EMTK",
  "SCMA",
  "MNCN",
  "WIFI",
  "DCII",
  "DNET",
  "MTDL",

  // ── Kesehatan ──
  "HEAL",
  "MIKA",
  "SILO",
  "CARE",
  "SAME",

  // ── Infrastruktur & konstruksi ──
  "WIKA",
  "WSKT",
  "ADHI",
  "PTPP",
  "TOTL",
  "ACST",
  "JKON",
  "PPRE",
  "JSMR",

  // ── Otomotif ──
  "UNTR",
  "ASII",
  "AUTO",
  "SMSM",
  "GJTL",
  "IMAS",
  "BRAM",

  // ── Perkebunan ──
  "AALI",
  "LSIP",
  "SIMP",
  "TAPG",
  "SGRO",
  "DSNG",
  "BWPT",

  // ── Agribisnis & peternakan ──
  "CPIN",
  "JPFA",
  "MAIN",
  "BISI",

  // ── Logistik & transportasi ──
  "BIRD",
  "GIAA",
  "SMDR",
  "TMAS",

  // ── Semen & material ──
  "SMGR",
  "INTP",
  "SMBR",
  "WTON",
  "TKIM",
  "INKP",
  "AMFG",
];
