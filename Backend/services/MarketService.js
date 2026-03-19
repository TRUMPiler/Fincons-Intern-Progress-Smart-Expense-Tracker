import axios from "axios";

class MarketService {
    /**
     * Fetch top cryptocurrencies from CoinGecko (prices in INR)
     * @param {number} count
     */
    async getTopCryptos(count = 6) {
        try {
            const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=${count}&page=1&sparkline=false`;
            const { data } = await axios.get(url, { timeout: 8000 });
            return (Array.isArray(data) ? data : []).map((c) => ({
                id: c.id,
                symbol: (c.symbol || '').toUpperCase(),
                name: c.name,
                price: c.current_price,
                market_cap: c.market_cap,
                change_24h: c.price_change_percentage_24h,
                image: c.image,
            }));
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
        const [cryptos, stocks] = await Promise.all([this.getTopCryptos(6), this.getTopStocks()]);
        return { cryptos, stocks };
    }
}

export default new MarketService();
