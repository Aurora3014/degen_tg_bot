import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { TxVersion } from "@raydium-io/raydium-sdk-v2";

export const USER_STATE = {
    idle: 'IDLE',
    start: 'START',
    wallet: 'WALLET',
    wallet_import: 'WALLET_IMPORT',
    buy_newbuy: 'BUY_NEWBUY',
    buy_option_1: 'BUY_OPTION_1',
    buy_option_2: 'BUY_OPTION_2',
    sell_option_1: 'SELL_OPTION_1',
    sell_option_2: 'SELL_OPTION_2',
    buy_slippage: 'BUY_SLIPPAGE',
    sell_slippage: 'SELL_SLIPPAGE',
    stop_loss: 'SL',
    take_profit: 'TP',
    trailing_stop_loss: 'TSL',
    token_snipe: 'TS',
    snipe_setting: 'SNIPE_SETTING',
    buy_x_amount:'BUY_X',
    sell_x_amount_manage:'SELL_X_M',
    buy_x_amount_manage:'BUY_X_M',

}

export const RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
export const WSOL_ADDRESS = "So11111111111111111111111111111111111111112";
export const txVersion = TxVersion.V0 // or TxVersion.LEGACY

export interface DasApiAssetWithTokenInfo extends DasApiAsset {
    token_info: {
      symbol: string;
      supply: number;
      decimals: number;
      token_program: string;
      price_info: {
        price_per_token: number;
        currency: string;
      };
      mint_authority: string;
      freeze_authority: string;
    };
  }

export interface REPLY_MARKUP_BUTTON {
  text: string,
  callback_data: string
}

export interface TokenResponse {
  schemaVersion: string;
  pairs: Pair[];
}

interface Pair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  txns: TransactionData;
  volume: VolumeData;
  priceChange: PriceChangeData;
  liquidity: LiquidityData;
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: Info;
}

interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface TransactionData {
  m5: TxnStats;
  h1: TxnStats;
  h6: TxnStats;
  h24: TxnStats;
}

interface TxnStats {
  buys: number;
  sells: number;
}

interface VolumeData {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

interface PriceChangeData {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

interface LiquidityData {
  usd: number;
  base: number;
  quote: number;
}

interface Info {
  imageUrl: string;
  websites: string[];
  socials: Social[];
}

interface Social {
  label: string;
  url: string;
  type: string;
} 