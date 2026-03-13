export interface Crypto {
  id: string;
  symbol: string;
  name: string;
  image: string;

  current_price: number;
  market_cap: number;
  market_cap_rank: number;

  high_24h: number;
  low_24h: number;

  price_change_24h: number;
  price_change_percentage_24h: number;

  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;

  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;

  ath: number;
  ath_change_percentage: number;
  ath_date: string;

  atl: number;
  atl_change_percentage: number;
  atl_date: string;

  total_volume: number;
  fully_diluted_valuation: number;

  last_updated: string;

  roi: null | {
    times: number;
    currency: string;
    percentage: number;
  };
}