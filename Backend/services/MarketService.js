import axios from "axios";

class MarketService {
    /**
     * Fetch top cryptocurrencies from CoinGecko (prices in INR)
     * @param {number} count
     */
    constructor() {
        // Simple in-memory cache for overview to reduce rate-limited calls
        this._cache = { ts: 0, data: null };
    }

    async getTopCryptos(count = 6) {
        // Try CoinAPI first (if key available), fallback to CoinGecko on auth/errors
        try {
            const apiKey = process.env.COINAPI || process.env.COINAPI_KEY || '';

            const defaults = ['BTC', 'ETH', 'BNB', 'ADA', 'XRP', 'DOGE'];
            const symbols = defaults.slice(0, count);

            const nameMap = {
                BTC: 'Bitcoin',
                ETH: 'Ethereum',
                BNB: 'BNB',
                ADA: 'Cardano',
                XRP: 'XRP',
                DOGE: 'Dogecoin',
            };

            const fallbackToCoinGecko = async () => {
                try {
                    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=${count}&page=1&sparkline=false`;
                    const { data } = await axios.get(url, { timeout: 10000 });
                    return (Array.isArray(data) ? data : []).map((c) => ({
                        id: c.id,
                        symbol: (c.symbol || '').toUpperCase(),
                        name: c.name,
                        price: c.current_price,
                        market_cap: c.market_cap,
                        change_24h: c.price_change_percentage_24h,
                        image: c.image,
                    }));
                } catch (e) {
                    console.error('MarketService.getTopCryptos fallback (CoinGecko) error', e?.message || e);
                    return [];
                }
            };

            if (!apiKey) {
                console.warn('MarketService.getTopCryptos: COINAPI key not set, using CoinGecko fallback');
                return await fallbackToCoinGecko();
            }

            // Quick probe to detect auth/403 without hitting all symbols
            try {
                const probeUrl = `https://rest.coinapi.io/v1/exchangerate/${encodeURIComponent(symbols[0])}/INR`;
                await axios.get(probeUrl, { headers: { 'X-CoinAPI-Key': apiKey }, timeout: 8000 });
            } catch (probeErr) {
                const status = probeErr?.response?.status;
                console.error('MarketService.getTopCryptos probe error', status || probeErr?.message || probeErr);
                if (status === 401 || status === 403) {
                    // Key invalid or not authorized — fall back
                    return await fallbackToCoinGecko();
                }
                // If probe timed out or other network issues, fall back as well
                if (!status) return await fallbackToCoinGecko();
            }

            // If probe passed, fetch all symbols in parallel
            const requests = symbols.map(async (sym) => {
                try {
                    const url = `https://rest.coinapi.io/v1/exchangerate/${encodeURIComponent(sym)}/INR`;
                    const { data } = await axios.get(url, { headers: { 'X-CoinAPI-Key': apiKey }, timeout: 10000 });
                    if (!data || typeof data.rate !== 'number') return null;
                    return {
                        id: sym,
                        symbol: sym,
                        name: nameMap[sym] || sym,
                        price: data.rate,
                        market_cap: null,
                        change_24h: null,
                        image: null,
                    };
                } catch (e) {
                    console.error('MarketService.getTopCryptos symbol error', sym, e?.message || e);
                    return null;
                }
            });

            const results = await Promise.all(requests);
            const filtered = (results || []).filter(Boolean);
            // If CoinAPI returned no valid items, fallback
            if (!filtered || filtered.length === 0) return await fallbackToCoinGecko();
            return filtered;
        } catch (err) {
            console.error('MarketService.getTopCryptos error', err?.message || err);
            return [];
        }
    }

    /**
     * Fetch a fixed list of popular stock quotes from Yahoo Finance (server-side proxy)
     * @param {string} symbols - comma separated symbols
     */
    async getTopStocks(symbols = 'AAPL,MSFT,AMZN,GOOGL,TSLA,NVDA,META,NFLX,ORCL,BABA') {
        try {
            const apiKey = process.env.TWELVEDATA_API_KEY || '';
            if (!apiKey) {
                console.error('MarketService.getTopStocks error: TWELVEDATA_API_KEY not set');
                return [];
            }

            const syms = String(symbols)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 12);

            // Fetch quotes from Twelve Data (one request per symbol to keep parsing simple)
            const requests = syms.map(async (sym) => {
                try {
                    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(sym)}&apikey=${encodeURIComponent(apiKey)}`;
                    const { data } = await axios.get(url, { timeout: 8000 });

                    // Twelve Data returns { "code": 400, "message": "..." } on error
                    if (!data || data.code || data.status === 'error') {
                        return null;
                    }

                    // price fields are strings in Twelve Data responses
                    const price = data.price ? parseFloat(data.price) : (data.close ? parseFloat(data.close) : null);
                    const changePercent = data.percent_change ?? data.change_percent ?? (data.close && data.previous_close ? ((parseFloat(data.close) - parseFloat(data.previous_close)) / parseFloat(data.previous_close)) * 100 : undefined);

                    return {
                        symbol: data.symbol || sym,
                        name: data.name || data.exchange || sym,
                        price: Number.isFinite(price) ? price : null,
                        changePercent: typeof changePercent === 'string' ? parseFloat(changePercent) : changePercent,
                        marketCap: data.market_cap ?? null,
                        currency: data.currency ?? 'USD',
                    };
                } catch (e) {
                    // individual symbol failure should not break the whole batch
                    console.error('MarketService.getTopStocks symbol error', sym, e?.message || e);
                    return null;
                }
            });

            const results = await Promise.all(requests);
            return (results || []).filter(Boolean);
        } catch (err) {
            console.error('MarketService.getTopStocks error', err?.message || err);
            return [];
        }
    }

    async getOverview() {
        const now = Date.now();
        const ttl = 25 * 1000; // 25 seconds
        if (this._cache?.ts && (now - this._cache.ts) < ttl && this._cache.data) {
            return this._cache.data;
        }

        const [cryptos, stocks] = await Promise.all([this.getTopCryptos(6), this.getTopStocks()]);
        const data = { cryptos, stocks };
        this._cache = { ts: now, data };
        return data;
    }
}

export default new MarketService();
