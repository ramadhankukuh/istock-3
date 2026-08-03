export type KongloGroup = {
  name: string;
  group?: string;
  tickers: string[];
};

export const kongloList: KongloGroup[] = [
  {
    group: "Barito",
    name: "Prajogo Pangestu",
    tickers: ["BREN", "BRPT", "CDIA", "CUAN", "PTRO", "SSIA", "TPIA"],
  },
  {
    group: "Thohir",
    name: "Garibdi Thohir",
    tickers: ["AADI", "ABBA", "ADMR", "ADRO", "BFIN", "ESSA", "MARI", "MBMA", "MDKA", "TRIM"],
  },
  {
    group: "Bakrie",
    name: "Aburizal Bakrie",
    tickers: ["BRMS", "BTEL", "BUMI", "DEWA", "ELTY", "ENRG", "UNSP", "VIVA", "VKTR"],
  },
  {
    group: "Djarum",
    name: "Budi Hartono",
    tickers: ["BBCA", "BELI", "DATA", "HEAL", "RANC", "SSIA", "SUPR", "TOWR"],
  },
  {
    group: "Salim",
    name: "Anthoni Salim",
    tickers: ["BUMI", "DCII", "DNET", "EMTK", "ICBP", "IMAS", "INDF", "LSIP", "MEDC", "SIMP"],
  },
  {
    group: "Aguan",
    name: "Sugianto Kusuma",
    tickers: ["CBDK", "PANI", "PDPP"],
  },
  {
    group: "Hapsoro",
    name: "Hapsoro Sukmonohadi",
    tickers: ["BUVA", "MINA", "RAJA", "RATU", "SINI"],
  },
];

export const lastKongloUpdate = "06/02/2026";
