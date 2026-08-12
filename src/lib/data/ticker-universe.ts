/**
 * OPSIONAL — daftar ticker pembatas cakupan Swing Trade Screener.
 *
 * - KOSONG (default)  → screen SEMUA saham yang ada di response IDX (~963).
 * - DIISI             → hanya ticker dalam daftar ini yang di-screen.
 *
 * Awalnya berisi 250 ticker paling likuid (top-250 by nilai transaksi IDX).
 * Sekarang dikosongkan karena cakupan screener diperluas ke semua saham.
 * Isi ulang daftar di sini kalau mau membatasi lagi ke subset tertentu.
 */
export const tickerUniverse: string[] = [];
