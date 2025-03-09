// Configuration for Osmosis interactions
export const OSMOSIS_CONFIG = {
  // API endpoints
  LCD_ENDPOINT: "https://lcd.osmosis.zone",
  
  // Token configuration
  PAGE_TOKEN: {
    DENOM: "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99",
    DECIMALS: 8,
    SYMBOL: "PAGE",
    TOTAL_SUPPLY: 100000000,
    CIRCULATING_SUPPLY: 42500000
  },
  
  // Pool configuration
  POOLS: {
    PAGE_OSMO: {
      ID: "1344",
      BASE_DENOM: "uosmo",
      BASE_DECIMALS: 6
    }
  },
  
  // Refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    PRICE_DATA: 60000, // 1 minute
    USER_DATA: 120000  // 2 minutes
  }
};
