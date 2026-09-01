"use client";
import { useState, useMemo, useEffect } from "react";
import { Trophy, Handshake, Flame, Users, TrendingUp, ArrowUpCircle, ArrowDownCircle, LayoutGrid, List, AlertCircle } from "lucide-react";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";
import uwList from "@/lib/data/listUW.json";
import detailIPO from "@/lib/data/detailIPO.json";

interface IPO {
  UW: string;
  Code: string;
  CompanyName: string;
  IPOPrice: string;
  ReturnD1: string;
  ReturnD2: string;
  ReturnD3: string;
  ReturnD4: string;
  ReturnD5: string;
  ReturnD6: string;
  ReturnD7: string;
  ReturnT30?: string;
  ReturnT180?: string;
  ReturnT360?: string;
  ListingBoard: string;
  ListingDate: string;
  Record: string;
  Sector?: string;
  Subsector?: string;
  LineOfBusiness?: string;
  NumberOfSharesOffered?: number;
  PercentOfTotalShares?: number;
  ParticipantAdmin?: string;
  Underwriters?: string;
  WarrantRatio?: number;
  ExercisePrice?: number | string;
  OversubscriptionRatio?: number;
  ShareholdersThroughIPO?: number;
}

const ipoData: IPO[] = [];
(detailIPO as any[]).forEach((detail) => {
  const underwriters = detail["Underwriter(s)"] || "";
  if (underwriters && underwriters !== "-") {
    const uwArray = underwriters.split(",").map((u: string) => u.trim()).filter(Boolean);
    uwArray.forEach((uw: string) => {
      ipoData.push({
        UW: uw,
        Code: detail["Ticker Code"] || "-",
        Record: detail["Record"] || "",
        CompanyName: detail["Company Name"] || "-",
        IPOPrice: detail["Final Price (Rp)"]?.toString() || "-",
        ReturnD1: detail["Return D1"]?.toString() || "-",
        ReturnD2: detail["Return D2"]?.toString() || "-",
        ReturnD3: detail["Return D3"]?.toString() || "-",
        ReturnD4: detail["Return D4"]?.toString() || "-",
        ReturnD5: detail["Return D5"]?.toString() || "-",
        ReturnD6: detail["Return D6"]?.toString() || "-",
        ReturnD7: detail["Return D7"]?.toString() || "-",
        ReturnT30: detail["Return T30"]?.toString() || "-",
        ReturnT180: detail["Return T180"]?.toString() || "-",
        ReturnT360: detail["Return T360"]?.toString() || "-",
        ListingBoard: detail["Listing Board"] || "-",
        ListingDate: detail["Listing Date"] || "-",
        Sector: detail["Sector"] || "-",
        Subsector: detail["Subsector"] || "-",
        LineOfBusiness: detail["Line of Business"] || "-",
        NumberOfSharesOffered: detail["Number of shares offered"] || 0,
        PercentOfTotalShares: detail["% of Total Shares"] || 0,
        ParticipantAdmin: detail["Participant Admin"] || "-",
        Underwriters: detail["Underwriter(s)"] || "-",
        WarrantRatio: detail["Warrant per share ratio"] || 0,
        ExercisePrice: detail["Exercise Price (Warrant) (Rp)"] || "-",
        OversubscriptionRatio: detail["Oversubscribed Ratio"] ? Number(detail["Oversubscribed Ratio"]) : 0,
        ShareholdersThroughIPO: detail["Shareholders Though IPO"] ? Number(detail["Shareholders Though IPO"]) : 0,
      });
    });
  }
});

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getReturnStyle(val: string) {
  const num = parseFloat(val);
  if (!val || Number.isNaN(num) || num === 0) return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
  if (num > 0) return num >= 0.2 ? "bg-green-300 text-green-900 dark:bg-green-800/60 dark:text-green-200" : "bg-green-100 text-green-700 dark:bg-green-600/40 dark:text-green-100";
  return num <= -0.2 ? "bg-red-300 text-red-900 dark:bg-red-800/60 dark:text-red-200" : "bg-red-100 text-red-700 dark:bg-red-600/40 dark:text-red-100";
}

function getIPOStatus(ipo: any) {
  const record = (ipo.Record || "").trim().toLowerCase();
  if (!record) return null;
  if (record.includes("ara") && !record.includes("arb")) return "ARA";
  if (record.includes("arb")) return "ARB";
  if (record.includes("close hijau")) return "CloseHijau";
  if (record.includes("close merah")) return "CloseMerah";
  if (record.includes("stagnan")) return "Stagnan";
  return null;
}

function formatNumber(num: number) {
  return num.toLocaleString("id-ID");
}

function formatPct(val: string) {
  const num = parseFloat(val);
  if (isNaN(num)) return "-";
  return `${(num * 100).toFixed(1)}%`;
}

function calculateDanaDihimpun(shares?: number, ipoPrice?: string | number) {
  if (!shares || !ipoPrice) return "-";
  const price = typeof ipoPrice === "string" ? parseFloat(ipoPrice.replace(/[^0-9]/g, "")) : ipoPrice;
  if (isNaN(price)) return "-";
  const dana = shares * price;
  let formatted = "";
  let suffix = "";
  if (dana >= 1_000_000_000_000) { formatted = (dana / 1_000_000_000_000).toFixed(2); suffix = " T"; }
  else if (dana >= 1_000_000_000) { formatted = (dana / 1_000_000_000).toFixed(2); suffix = " M"; }
  else if (dana >= 1_000_000) { formatted = (dana / 1_000_000).toFixed(2); suffix = " Jt"; }
  else { formatted = dana.toFixed(0); }
  const withSeparator = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(".00", "");
  return `Rp ${withSeparator}${suffix}`;
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-foreground mb-4">
      <Icon className="w-5 h-5 text-(--accent)" />
      {title}
    </h2>
  );
}

function UWRanking({ type, ipoData: ipos, uwList: uws }: { type: "best" | "most"; ipoData: any[]; uwList: any[] }) {
  const grouped: Record<string, any[]> = {};
  ipos.forEach((ipo) => { if (!grouped[ipo.UW]) grouped[ipo.UW] = []; grouped[ipo.UW].push(ipo); });
  const stats = Object.entries(grouped).map(([uw, list]) => {
    let validCount = 0, winCount = 0;
    list.forEach((ipo) => { const status = getIPOStatus(ipo); if (status) { validCount++; if (status === "ARA" || status === "CloseHijau") winCount++; } });
    return { uw, count: list.length, validCount, winRate: validCount > 0 ? (winCount / validCount) * 100 : 0 };
  });
  const sorted = type === "best"
    ? stats.filter((s) => s.validCount >= 2).sort((a, b) => b.winRate - a.winRate || b.validCount - a.validCount || b.count - a.count)
    : stats.sort((a, b) => b.count - a.count);
  const top3 = sorted.slice(0, 3);
  return (
    <div className="grid gap-3">
      {top3.map((s, i) => {
        const uwData = uws.find((u: any) => u.kode === s.uw);
        return (
          <div key={i} className="p-4 rounded-xl border border-(--border) bg-(--surface-strong) flex justify-between items-center">
            <div>
              <p className="font-bold text-foreground">{i + 1}. {s.uw}</p>
              <p className="text-sm text-muted">{uwData?.nama || "-"}</p>
            </div>
            <div className="text-right">
              {type === "best" ? (
                <p className="font-semibold text-green-600">{s.winRate.toFixed(0)}% <span className="text-xs text-muted">({s.validCount} IPO)</span></p>
              ) : (
                <p className="font-semibold text-(--accent)">{s.count} IPO</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IPORanking({ type, ipoData: ipos }: { type: "oversub" | "shareholders"; ipoData: any[] }) {
  const uniqueIPO = Array.from(new Map(ipos.map((i) => [i.Code, i])).values());
  const ranking = type === "oversub"
    ? uniqueIPO.filter((i) => (i.OversubscriptionRatio || 0) > 0).sort((a, b) => (b.OversubscriptionRatio || 0) - (a.OversubscriptionRatio || 0)).slice(0, 3)
    : uniqueIPO.filter((i) => (i.ShareholdersThroughIPO || 0) > 0).sort((a, b) => (b.ShareholdersThroughIPO || 0) - (a.ShareholdersThroughIPO || 0)).slice(0, 3);
  return (
    <div className="grid gap-3">
      {ranking.map((ipo, i) => (
        <div key={ipo.Code} className="p-4 rounded-xl border border-(--border) bg-(--surface-strong) flex justify-between items-center">
          <div>
            <p className="font-bold text-foreground">{i + 1}. {ipo.Code}</p>
            <p className="text-sm text-muted">{ipo.CompanyName || "-"}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-(--accent)">{type === "oversub" ? `${ipo.OversubscriptionRatio?.toFixed(2)}x` : (ipo.ShareholdersThroughIPO || 0).toLocaleString("id-ID")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function IPOARAARBRanking({ type, ipoData: ipos, detailIPO: details }: { type: "ara" | "arb"; ipoData: any[]; detailIPO: any[] }) {
  const grouped: Record<string, any[]> = {};
  ipos.forEach((ipo) => { if (!grouped[ipo.Code]) grouped[ipo.Code] = []; grouped[ipo.Code].push(ipo); });
  const stats = Object.entries(grouped).map(([code, list]) => {
    const detail = details.find((d) => d["Ticker Code"] === code);
    const record = detail?.["Record"] || "";
    const matches = record.match(/\d+/g);
    const count = matches ? parseInt(matches[0], 10) : 0;
    const isMatch = type === "ara" ? record.toLowerCase().includes("ara") && !record.toLowerCase().includes("arb") : record.toLowerCase().includes("arb");
    if (!isMatch || count === 0) return null;
    const underwriters = detail?.["Underwriter(s)"] ? detail["Underwriter(s)"].split(",").map((uw: string) => uw.trim()) : [];
    return { code, company: detail?.["Company Name"] || "-", listingDate: detail?.["Listing Date"] || "", count, underwriters };
  }).filter(Boolean).sort((a: any, b: any) => b.count - a.count).slice(0, 3);
  return (
    <div className="grid gap-3">
      {(stats as any[]).map((ipo: any, i: number) => (
        <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-(--border) bg-(--surface-strong)">
          <div>
            <p className="font-bold text-foreground flex items-center gap-2">
              {i + 1}. {ipo.code}
              <span className="text-[11px] text-muted">({formatDate(ipo.listingDate)})</span>
            </p>
            <p className="text-sm text-muted">{ipo.company}</p>
            {ipo.underwriters.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {ipo.underwriters.map((uw: string, idx: number) => (
                  <span key={idx} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded text-[10px]">{uw}</span>
                ))}
              </div>
            )}
          </div>
          <span className={`font-semibold ${type === "ara" ? "text-green-600" : "text-red-600"}`}>{ipo.count}x {type.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

export default function UwTrackerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [uwMode, setUwMode] = useState<"all" | "uwOnly">("all");
  const [view, setView] = useState<"card" | "list">("card");
  const [ipoPerf, setIpoPerf] = useState<any[]>([]);
  const [loadingIpoPerf, setLoadingIpoPerf] = useState(true);

  useEffect(() => {
    setLoadingIpoPerf(true);
    fetch("/api/ipo-performance")
      .then((res) => res.json())
      .then((json) => { setIpoPerf(Array.isArray(json?.cache?.data) ? json.cache.data : Array.isArray(json?.data) ? json.data : []); })
      .finally(() => setLoadingIpoPerf(false));
  }, []);

  const totalData = useMemo(() => {
    let count = 0;
    (detailIPO as any[]).forEach((d) => {
      const underwriters = d["Underwriter(s)"] || "";
      if (underwriters && underwriters !== "-") count += underwriters.split(",").map((u: string) => u.trim()).filter(Boolean).length;
    });
    return count;
  }, []);

  const totalIPO = useMemo(() => new Set((detailIPO as any[]).map((d) => (d["Ticker Code"] || "").trim()).filter(Boolean)).size, []);

  const totalUW = uwList.length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^[a-zA-Z0-9]*$/.test(value)) setError("Input hanya boleh huruf dan angka");
    else { setError(""); setSearchTerm(value); }
  };

  const sortedData = [...ipoData].sort((a, b) => new Date(b.ListingDate).getTime() - new Date(a.ListingDate).getTime());

  const filteredData = sortedData.filter((ipo) => {
    const matchUW = ipo.UW.toLowerCase() === searchTerm.toLowerCase();
    if (!matchUW) return false;
    if (uwMode === "all") return true;
    if (!ipo.ParticipantAdmin) return false;
    const adminCode = ipo.ParticipantAdmin.split("-")[0].trim();
    return adminCode.toLowerCase() === searchTerm.toLowerCase();
  });

  const accordionItems = [
    { title: "Apa itu UW Tracker?", content: "UW Tracker adalah alat yang menampilkan data dan aktivitas perusahaan sekuritas atau underwriter yang menangani IPO di Bursa Efek Indonesia." },
    { title: "Bagaimana cara menggunakan UW Tracker?", content: "Masukkan kode underwriter (contoh: HP) untuk melihat data IPO yang ditangani beserta performa harganya." },
    { title: "Apa manfaat menggunakan UW Tracker?", content: "Membantu investor memahami reputasi dan konsistensi underwriter di pasar IPO." },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="UW Tracker"
        description="Pantau dan analisis kinerja underwriter IPO di Bursa Efek Indonesia melalui data historis, performa harga pasca-listing, oversubscription, serta statistik win rate."
        breadcrumbs={[{ label: "Home", href: "/", isHome: true }, { label: "UW Tracker" }]}
        tags={["Analisis"]}
      />

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted">Cari Kode Underwriter</label>
            <input type="text"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring) uppercase"
              placeholder="Contoh: HP" value={searchTerm} onChange={handleSearch}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Filter</label>
            <div className="mt-1 flex w-full rounded-lg overflow-hidden border border-(--border)">
              <button onClick={() => setUwMode("all")}
                className={`flex-1 p-2 text-sm font-medium transition ${uwMode === "all" ? "bg-(--accent) text-(--accent-foreground)" : "bg-(--surface-strong) text-foreground"}`}
              >Admin + Penjamin</button>
              <button onClick={() => setUwMode("uwOnly")}
                className={`flex-1 p-2 text-sm font-medium transition ${uwMode === "uwOnly" ? "bg-(--accent) text-(--accent-foreground)" : "bg-(--surface-strong) text-foreground"}`}
              >Admin</button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--surface-strong) p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted">Total Data</p><p className="font-semibold text-foreground">{totalData}</p></div>
            <div><p className="text-muted">Total UW</p><p className="font-semibold text-foreground">{totalUW}</p></div>
            <div><p className="text-muted">Total IPO</p><p className="font-semibold text-foreground">{totalIPO}</p></div>
            <div><p className="text-muted">Menampilkan</p><p className="font-semibold text-foreground">{filteredData.length}</p></div>
          </div>
        </div>
      </div>

      {searchTerm !== "" && filteredData.length > 0 && (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
          {(() => {
            const uwData = uwList.find((u: any) => u.kode.toLowerCase() === searchTerm.toLowerCase());
            const uwName = uwData ? uwData.nama : "-";
            const uwLicense = uwData ? uwData.license : "-";
            const ipoList = filteredData;
            let statsCount: Record<string, number> = { ARA: 0, CloseHijau: 0, Stagnan: 0, CloseMerah: 0, ARB: 0 };
            let validCount = 0;
            ipoList.forEach((ipo) => { const status = getIPOStatus(ipo); if (status) { statsCount[status]++; validCount++; } });
            const winRate = validCount > 0 ? ((statsCount.ARA + statsCount.CloseHijau) / validCount * 100).toFixed(1) : "-";
            const stats = [
              { label: "ARA", value: statsCount.ARA },
              { label: "Close Hijau", value: statsCount.CloseHijau },
              { label: "Stagnan", value: statsCount.Stagnan },
              { label: "Close Merah", value: statsCount.CloseMerah },
              { label: "ARB", value: statsCount.ARB },
              { label: "Win Rate", value: winRate !== "-" ? `${winRate}%` : "-" },
            ];
            return (
              <>
                <h2 className="text-xl font-bold text-foreground mb-1">Performa UW: {searchTerm.toUpperCase()}</h2>
                <p className="text-sm text-muted mb-1">PT {uwName}</p>
                <p className="text-xs text-muted/60 mb-3">{uwLicense}</p>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm mb-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="p-3 rounded-xl border border-(--border) bg-(--surface-strong) text-center">
                      <p className="text-muted text-xs">{stat.label}</p>
                      <p className="font-semibold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted italic">Win Rate dihitung berdasarkan jumlah IPO yang ARA atau ditutup hijau di hari pertama.</p>
              </>
            );
          })()}
        </div>
      )}

      {searchTerm === "" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
              <SectionTitle icon={Trophy} title="UW Terbaik (Win Rate)" />
              <UWRanking type="best" ipoData={ipoData} uwList={uwList} />
            </div>
            <div className="p-6 rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
              <SectionTitle icon={Handshake} title="UW Terbanyak Ngawal IPO" />
              <UWRanking type="most" ipoData={ipoData} uwList={uwList} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
              <SectionTitle icon={Flame} title="IPO Oversubs Terbesar" />
              <IPORanking type="oversub" ipoData={ipoData} />
            </div>
            <div className="p-6 rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
              <SectionTitle icon={Users} title="IPO Antrian Terbanyak (SID)" />
              <IPORanking type="shareholders" ipoData={ipoData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
              <SectionTitle icon={ArrowUpCircle} title="IPO Paling Banyak ARA" />
              <IPOARAARBRanking type="ara" ipoData={ipoData} detailIPO={detailIPO} />
            </div>
            <div className="p-6 rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
              <SectionTitle icon={ArrowDownCircle} title="IPO Paling Banyak ARB" />
              <IPOARAARBRanking type="arb" ipoData={ipoData} detailIPO={detailIPO} />
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
            <SectionTitle icon={TrendingUp} title={`Performa IPO Tahun ${new Date().getFullYear()}`} />
            {loadingIpoPerf && <div className="flex items-center justify-center py-16 text-muted"><p>Memuat data IPO...</p></div>}
            {!loadingIpoPerf && ipoPerf.length === 0 && <div className="flex items-center justify-center py-16 text-muted"><p>Belum ada data IPO tahun {new Date().getFullYear()}</p></div>}
            {!loadingIpoPerf && ipoPerf.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {ipoPerf.map((x: any, i: number) => {
                  const detail = (detailIPO as any[]).find((d) => d["Ticker Code"] === x.code);
                  const underwriters = detail?.["Underwriter(s)"] ? detail["Underwriter(s)"].split(",").map((uw: string) => uw.trim()) : [];
                  const listingDate = detail?.["Listing Date"] ? formatDate(detail["Listing Date"]) : "-";
                  return (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-(--border) bg-(--surface-strong)">
                      <div>
                        <p className="font-bold text-foreground flex items-center gap-2">{i + 1}. {x.code} <span className="text-[11px] text-muted">({listingDate})</span></p>
                        <p className="text-sm text-muted">{x.company?.length > 40 ? x.company.slice(0, 40) + "..." : x.company}</p>
                        {underwriters.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {underwriters.map((uw: string, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded text-[10px]">{uw}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-md font-semibold text-sm ${
                        x.returnPct > 0 ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200" :
                        x.returnPct < 0 ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200" :
                        "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {x.returnPct > 0 ? "+" : ""}{(x.returnPct * 100).toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : filteredData.length > 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft) overflow-hidden">
          <div className="bg-(--surface) p-3 border-b border-(--border)">
            <div className="flex justify-center">
              <div className="flex gap-2 bg-(--surface-strong) rounded-xl p-1 border border-(--border) w-full md:w-auto md:px-2">
                <button onClick={() => setView("card")}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === "card" ? "bg-(--surface) shadow text-(--accent)" : "text-muted"
                  }`}
                ><LayoutGrid className="w-4 h-4" /> Detail View</button>
                <button onClick={() => setView("list")}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === "list" ? "bg-(--surface) shadow text-(--accent)" : "text-muted"
                  }`}
                ><List className="w-4 h-4" /> Simple View</button>
              </div>
            </div>
          </div>
          {view === "card" ? (
            <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredData.map((ipo, idx) => <IPOCard key={idx} ipo={ipo} />)}
            </div>
          ) : (
            <IPOListView data={filteredData} />
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft) flex flex-col items-center justify-center py-24 text-muted">
          <AlertCircle className="w-10 h-10 mb-4" />
          <p className="text-sm font-medium">Tidak ada data ditemukan</p>
        </div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang UW Tracker</h2>
          <p className="text-sm text-muted mt-2">UW Tracker menampilkan data dan aktivitas perusahaan sekuritas atau underwriter yang menangani IPO di Bursa Efek Indonesia.</p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );

  function InfoCard({ label, value }: { label: string; value?: string | number }) {
    return (
      <div className="p-2 rounded-lg bg-(--surface-strong)">
        <p className="text-muted text-xs">{label}</p>
        <p className="font-semibold text-foreground">{value || "-"}</p>
      </div>
    );
  }

  function IPOCard({ ipo }: { ipo: IPO }) {
    const underwriterList = ipo.Underwriters && ipo.Underwriters !== "-"
      ? ipo.Underwriters.split(",").map((uw) => uw.trim()).filter(Boolean)
      : [];
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft) p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">{ipo.Code || "-"}</h2>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 font-medium">{ipo.UW || "-"}</span>
        </div>
        <p className="text-sm text-muted mb-3">{ipo.CompanyName || "-"}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {[ipo.Sector, ipo.Subsector, ipo.LineOfBusiness].map((v, i) => (
            <span key={i} className="inline-block px-2 py-1 rounded-lg text-xs font-medium bg-(--surface-strong) text-foreground">{v || "-"}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <InfoCard label="Harga IPO" value={ipo.IPOPrice} />
          <InfoCard label="Listing" value={ipo.ListingDate ? formatDate(ipo.ListingDate) : "-"} />
          <InfoCard label="Papan" value={ipo.ListingBoard} />
          <InfoCard label="Record" value={ipo.Record} />
          {ipo.NumberOfSharesOffered && <InfoCard label="Total Saham (Lot)" value={formatNumber(ipo.NumberOfSharesOffered / 100)} />}
          {ipo.PercentOfTotalShares && <InfoCard label="% Total Saham" value={`${formatNumber(ipo.PercentOfTotalShares)}%`} />}
          <InfoCard label="Dana Dihimpun" value={calculateDanaDihimpun(ipo.NumberOfSharesOffered, ipo.IPOPrice)} />
          <InfoCard label={`Rasio Waran: ${ipo?.WarrantRatio ? ipo.WarrantRatio : "-"}`} value={`Exercise (Rp): ${ipo?.ExercisePrice ? ipo.ExercisePrice : "-"}`} />
        </div>
        <div className="mb-3">
          <p className="text-sm font-medium mb-2 text-foreground">Returns</p>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[ipo.ReturnD1, ipo.ReturnD2, ipo.ReturnD3, ipo.ReturnD4, ipo.ReturnD5, ipo.ReturnD6, ipo.ReturnD7].map((r, i) => (
              <div key={i} className={`p-2 rounded text-center ${getReturnStyle(r)}`}>
                <p className="text-[10px] font-medium text-muted">Day {i + 1}</p>
                <p className="font-semibold text-foreground">{r && !isNaN(parseFloat(r)) ? formatPct(r) : "-"}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div className="p-2 rounded-lg bg-(--surface-strong) col-span-2">
            <p className="text-muted text-xs">Admin Partisipan</p>
            <p className="font-semibold text-foreground">{ipo.ParticipantAdmin || "-"}</p>
          </div>
          <div className="p-2 rounded-lg bg-(--surface-strong) col-span-2">
            <p className="text-muted text-xs">Underwriters</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {underwriterList.length > 0 ? underwriterList.map((uw, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 rounded-full text-xs font-medium">{uw}</span>
              )) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-(--surface-strong) text-foreground">-</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function IPOListView({ data }: { data: IPO[] }) {
    const returnFields = useMemo(() => [
      { label: "D+1", key: "ReturnD1" as keyof IPO, longTerm: false },
      { label: "D+2", key: "ReturnD2" as keyof IPO, longTerm: false },
      { label: "D+3", key: "ReturnD3" as keyof IPO, longTerm: false },
      { label: "D+4", key: "ReturnD4" as keyof IPO, longTerm: false },
      { label: "D+5", key: "ReturnD5" as keyof IPO, longTerm: false },
      { label: "D+6", key: "ReturnD6" as keyof IPO, longTerm: false },
      { label: "D+7", key: "ReturnD7" as keyof IPO, longTerm: false },
      { label: "M+1", key: "ReturnT30" as keyof IPO, longTerm: true },
      { label: "M+6", key: "ReturnT180" as keyof IPO, longTerm: true },
      { label: "Y+1", key: "ReturnT360" as keyof IPO, longTerm: true },
    ], []);

    const probabilities = useMemo(() => {
      return returnFields.map((field) => {
        let positive = 0, total = 0;
        data.forEach((ipo) => {
          const val = (ipo as any)[field.key];
          const num = typeof val === "string" ? parseFloat(val) : Number(val);
          if (!isNaN(num)) { total++; if (num > 0) positive++; }
        });
        return total > 0 ? Math.round((positive / total) * 100) : 0;
      });
    }, [data, returnFields]);

    const formatReturnValue = (val: string | number, longTerm: boolean) => {
      const num = typeof val === "string" ? parseFloat(val) : Number(val);
      if (isNaN(num)) return "-";
      if (longTerm) return `${num.toFixed(2)}%`;
      return formatPct(num.toString());
    };

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-(--border) border-collapse">
          <thead className="bg-(--surface-strong)">
            <tr>
              <th rowSpan={2} className="sticky left-0 z-20 px-3 py-2 border border-(--border) text-foreground bg-(--surface-strong)">Code / IPO Price</th>
              <th rowSpan={2} className="px-3 py-2 border border-(--border) text-foreground">Listing</th>
              <th rowSpan={2} className="px-3 py-2 border border-(--border) text-foreground">Board</th>
              <th rowSpan={2} className="px-3 py-2 border border-(--border) text-foreground">Record</th>
              <th colSpan={7} className="px-3 py-2 border border-(--border) text-center text-foreground">Daily</th>
              <th colSpan={3} className="px-3 py-2 border border-(--border) text-center text-foreground">Total</th>
            </tr>
            <tr>
              {returnFields.map((field, i) => (
                <th key={field.key as string} className="px-3 py-2 border border-(--border) text-foreground">
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{field.label}</span>
                    <span className="text-[11px] text-muted">({probabilities[i]}%)</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-foreground text-sm">
            {data.map((ipo, idx) => (
              <tr key={idx} className="hover:bg-(--surface-strong)">
                <td className="sticky left-0 z-10 bg-(--surface-strong) px-3 py-2 font-semibold border border-(--border)">
                  {ipo.Code || "-"} <span className="ml-2 text-xs text-(--accent)">{ipo.IPOPrice || "-"}</span>
                </td>
                <td className="px-3 py-2 border border-(--border)">{ipo.ListingDate ? formatDate(ipo.ListingDate) : "-"}</td>
                <td className="px-3 py-2 border border-(--border)">{ipo.ListingBoard || "-"}</td>
                <td className="px-3 py-2 border border-(--border)">{ipo.Record || "-"}</td>
                {returnFields.map((field) => {
                  const r = (ipo as any)[field.key];
                  return (
                    <td key={field.key as string} className="px-2 py-1 text-center border border-(--border)">
                      <span className={`inline-block px-2 py-1 rounded font-semibold ${getReturnStyle(r)}`}>
                        {formatReturnValue(r, Boolean(field.longTerm))}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
