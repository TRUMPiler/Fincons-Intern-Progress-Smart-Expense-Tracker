import api from "../lib/axiosInstance";

export async function fetchMarketOverview() {
  const res = await api.get(`/api/market/overview`);
  return res.data?.data ?? { cryptos: [], stocks: [] };
}
