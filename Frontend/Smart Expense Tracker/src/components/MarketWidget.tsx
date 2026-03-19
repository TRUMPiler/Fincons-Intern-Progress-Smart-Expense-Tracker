import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { fetchMarketOverview } from "../services/Market";

type Crypto = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  market_cap?: number;
  change_24h?: number;
  image?: string;
};

type Stock = {
  symbol: string;
  name: string;
  price: number;
  changePercent?: number;
  marketCap?: number;
  currency?: string;
};

const MarketWidget: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchMarketOverview();
      setCryptos(data.cryptos ?? []);
      setStocks(data.stocks ?? []);
    } catch (e) {
      console.error("Failed to fetch market overview", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="p-4 shadow-sm rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Markets</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Cryptocurrencies</h4>
          <div className="mt-2 space-y-2">
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : cryptos.length === 0 ? (
              <div className="text-sm text-gray-500">No crypto data</div>
            ) : (
              cryptos.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {c.image && <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full" />}
                    <div className="text-sm font-medium">{c.name}</div>
                  </div>
                  <div className={`text-sm font-semibold ${c.change_24h && c.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Number(c.price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    <span className="text-xs font-normal ml-2">{c.change_24h !== undefined ? `(${c.change_24h?.toFixed(2)}%)` : ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Stocks</h4>
          <div className="mt-2 space-y-2">
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : stocks.length === 0 ? (
              <div className="text-sm text-gray-500">No stock data</div>
            ) : (
              stocks.map((s) => (
                <div key={s.symbol} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{s.symbol}</div>
                    <div className="text-xs text-gray-500">{s.name}</div>
                  </div>
                  <div className={`text-sm font-semibold ${s.changePercent && s.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {s.currency === 'INR' ? '₹' : s.currency === 'USD' ? '$' : ''}{Number(s.price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    <span className="text-xs font-normal ml-2">{s.changePercent !== undefined ? `(${s.changePercent?.toFixed(2)}%)` : ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketWidget;
