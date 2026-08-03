import YahooFinance from "yahoo-finance2";

export const yahooFinance = new YahooFinance({
  fetchOptions: {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/121.0.0.0 Safari/537.36",
    },
  },
});
